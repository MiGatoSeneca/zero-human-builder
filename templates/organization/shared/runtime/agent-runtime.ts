/**
 * Brash Agent Runtime
 *
 * Autonomous execution system for the agent team.
 * Two triggers per agent:
 *   1. Heartbeat — periodic timer (configurable interval)
 *   2. Inbox event — new file appears in agent's inbox/
 *
 * Each trigger spawns `pi -p` from the agent's directory.
 * The agent's AGENTS.md, extensions (wake.ts), and skills load automatically.
 * The agent follows its full cycle: wake → inbox → backlog → work → sleep.
 *
 * Usage:
 *   npx tsx agent-runtime.ts                    # Start daemon (all agents paused)
 *   npx tsx agent-runtime.ts --once             # Run one heartbeat for all enabled agents and exit
 *   npx tsx agent-runtime.ts --agent <name>     # Only run/watch one agent
 *   npx tsx agent-runtime.ts start <name|all>   # Start agent(s) — activates heartbeat + inbox watch
 *   npx tsx agent-runtime.ts stop <name|all>    # Stop agent(s) — pauses heartbeat + inbox watch
 *   npx tsx agent-runtime.ts status             # Show current state of all agents
 */

import { spawn, type ChildProcess } from "node:child_process";
import { watch, type FSWatcher, createWriteStream } from "node:fs";
import { readdir, stat, mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { appendFile } from "node:fs/promises";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentConfig {
  enabled: boolean;
  heartbeatMinutes: number;
  timeoutMinutes: number;
  taskTimeoutMinutes: number;
  model?: string;
}

interface Config {
  agentsDir: string;
  logsDir: string;
  maxConcurrency: number;
  defaults: {
    heartbeatMinutes: number;
    timeoutMinutes: number;
    taskTimeoutMinutes: number;
    enabled: boolean;
    model?: string;
  };
  agents: Record<string, Partial<AgentConfig> & { comment?: string }>;
}

interface AgentState {
  name: string;
  dir: string;
  config: AgentConfig;
  active: boolean;         // Whether heartbeat + inbox watch are on
  running: boolean;        // Whether a pi process is currently executing
  queued: boolean;
  queueTrigger?: string;
  lastHeartbeat: number;
  heartbeatTimer?: ReturnType<typeof setTimeout>;
  watcher?: FSWatcher;
  process?: ChildProcess;
}

// State persisted to runtime-state.json
interface RuntimeState {
  agents: Record<string, { active: boolean; lastStarted?: string; lastStopped?: string }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEARTBEAT_PROMPT = `Heartbeat. Execute your maintenance cycle:

1. Wake up: check short-term memory, read long-term memory
2. Check inbox: process any pending messages. For each message either create a new task, modify an existing task, or create a response task. Do NOT write responses directly — only create tasks.
3. Review backlog: check task statuses, blockers, re-prioritize. Identify the highest priority task ready for execution.
4. Sleep: process short-term memory into long-term, update task statuses, clear short-term

IMPORTANT: Do NOT execute tasks during this heartbeat. Only organize. The highest priority task will be triggered separately after this cycle completes.

At the end, output a single line: NEXT_TASK: {task-name} (the task directory name that should be executed next, or NONE if nothing is ready).

Be fast and efficient. This is a maintenance cycle, not a work session.`;

const INBOX_PROMPT = `You have new messages in your inbox. Execute your maintenance cycle:

1. Wake up: check short-term memory, read long-term memory
2. Check inbox: process the new messages. For each message either create a new task, modify an existing task, or create a response task. Do NOT write responses directly — only create tasks.
3. Review backlog: check if messages created or unblocked any tasks. Re-prioritize. Identify the highest priority task ready for execution.
4. Sleep: process short-term memory into long-term, update task statuses, clear short-term

IMPORTANT: Do NOT execute tasks during this cycle. Only organize. The highest priority task will be triggered separately after this cycle completes.

At the end, output a single line: NEXT_TASK: {task-name} (the task directory name that should be executed next, or NONE if nothing is ready).

Be fast and efficient. This is a maintenance cycle, not a work session.`;

const TASK_PROMPT = (taskName: string) => `Execute task: ${taskName}

1. Read backlog/${taskName}/TASK.md to understand what needs to be done
2. Update status to in-progress
3. Do the work — write outputs to backlog/${taskName}/files/
4. Keep a running log in backlog/${taskName}/log/MEMORY.md as you work (timestamps, decisions, progress)
5. If blocked, update TASK.md with the blocker and stop
6. If you need input from another agent, send them a message in their inbox and mark yourself blocked
7. If complete, update status to review or done (depending on whether reviewers are defined)
8. Send any necessary messages (delivery, review-request) to stakeholders

When the task finishes (done, blocked, or discarded), write a summary to memory/short-term/ with:
- What you did
- Decisions made and why
- What you learned
- Outcome (completed / blocked / discarded)

Do NOT write to short-term memory during execution — only when the task ends. All working logs go in the task directory.

Focus only on this task. Be thorough and deliver quality work.`;

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

const __dirname_resolved = dirname(new URL(import.meta.url).pathname);
const agents = new Map<string, AgentState>();
let shuttingDown = false;
let maxConcurrency = 3;
let runningCount = 0;
const waitQueue: Array<() => void> = [];

const STATE_FILE = join(__dirname_resolved, "runtime-state.json");

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function ts(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function log(msg: string): void {
  console.log(`[${ts()}] ${msg}`);
}

function logError(msg: string): void {
  console.error(`[${ts()}] ERROR: ${msg}`);
}

async function logToFile(logsDir: string, agent: string, content: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const file = join(logsDir, `${agent}-${date}.log`);
  await appendFile(file, content);
}

// ---------------------------------------------------------------------------
// Runtime state persistence
// ---------------------------------------------------------------------------

async function loadRuntimeState(): Promise<RuntimeState> {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { agents: {} };
  }
}

async function saveRuntimeState(): Promise<void> {
  const state: RuntimeState = { agents: {} };
  for (const [name, agentState] of agents) {
    state.agents[name] = {
      active: agentState.active,
      lastStarted: agentState.active ? new Date().toISOString() : undefined,
    };
  }
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

async function loadConfig(): Promise<Config> {
  const configPath = join(__dirname_resolved, "config.json");
  const raw = await readFile(configPath, "utf-8");
  return JSON.parse(raw);
}

function resolveAgentConfig(config: Config, agentName: string): AgentConfig {
  const agentOverrides = config.agents[agentName] || {};
  return {
    enabled: agentOverrides.enabled ?? config.defaults.enabled,
    heartbeatMinutes: agentOverrides.heartbeatMinutes ?? config.defaults.heartbeatMinutes,
    timeoutMinutes: agentOverrides.timeoutMinutes ?? config.defaults.timeoutMinutes,
    taskTimeoutMinutes: agentOverrides.taskTimeoutMinutes ?? config.defaults.taskTimeoutMinutes ?? 60,
    model: agentOverrides.model ?? config.defaults.model,
  };
}

// ---------------------------------------------------------------------------
// Agent discovery
// ---------------------------------------------------------------------------

async function discoverAgents(config: Config): Promise<string[]> {
  const agentsDir = resolve(__dirname_resolved, config.agentsDir);
  const entries = await readdir(agentsDir, { withFileTypes: true });
  const found: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const agentsFile = join(agentsDir, entry.name, "AGENTS.md");
    try {
      await access(agentsFile);
      found.push(entry.name);
    } catch {
      // Not an agent directory
    }
  }

  return found;
}

// ---------------------------------------------------------------------------
// Inbox watching
// ---------------------------------------------------------------------------

function hasNewInboxFiles(agentDir: string): Promise<boolean> {
  return readdir(join(agentDir, "inbox"))
    .then((files) => files.filter((f) => f.endsWith(".md") && f !== "archive").length > 0)
    .catch(() => false);
}

function watchInbox(state: AgentState, logsDir: string): void {
  const inboxDir = join(state.dir, "inbox");

  try {
    state.watcher = watch(inboxDir, { persistent: true }, (eventType, filename) => {
      if (shuttingDown || !state.active) return;
      if (!filename || !filename.endsWith(".md") || filename === "archive") return;

      log(`📬 ${state.name}: new inbox file detected (${filename})`);

      if (state.running) {
        // Already running — queue a follow-up
        state.queued = true;
        state.queueTrigger = "inbox";
        log(`   ${state.name} is busy — queued for after current run`);
      } else {
        runAgent(state, "inbox", logsDir);
      }
    });

    log(`👁  ${state.name}: watching inbox`);
  } catch (err) {
    logError(`${state.name}: failed to watch inbox — ${err}`);
  }
}

function unwatchInbox(state: AgentState): void {
  if (state.watcher) {
    state.watcher.close();
    state.watcher = undefined;
    log(`🚫 ${state.name}: stopped watching inbox`);
  }
}

// ---------------------------------------------------------------------------
// Agent execution
// ---------------------------------------------------------------------------

async function runAgent(state: AgentState, trigger: "heartbeat" | "inbox" | "task", logsDir: string, taskName?: string): Promise<void> {
  if (state.running) {
    state.queued = true;
    state.queueTrigger = trigger;
    return;
  }

  // Concurrency gate — wait if at max
  if (runningCount >= maxConcurrency) {
    log(`⏳ ${state.name}: waiting for concurrency slot (${runningCount}/${maxConcurrency})`);
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }

  state.running = true;
  runningCount++;

  let prompt: string;
  if (trigger === "task" && taskName) {
    prompt = TASK_PROMPT(taskName);
  } else if (trigger === "inbox") {
    prompt = INBOX_PROMPT;
  } else {
    prompt = HEARTBEAT_PROMPT;
  }

  const timeoutMs = trigger === "task"
    ? state.config.taskTimeoutMinutes * 60 * 1000
    : state.config.timeoutMinutes * 60 * 1000;

  const startTime = Date.now();

  log(`🚀 ${state.name}: starting (trigger: ${trigger})`);

  const header = `\n${"=".repeat(70)}\n[${ts()}] ${state.name} — trigger: ${trigger}\n${"=".repeat(70)}\n`;
  await logToFile(logsDir, state.name, header);

  // Stream output directly to log file (no buffering in memory)
  const date = new Date().toISOString().slice(0, 10);
  const logFile = join(logsDir, `${state.name}-${date}.log`);
  const logStream = createWriteStream(logFile, { flags: "a" });

  return new Promise<void>((resolvePromise) => {
    const piArgs = [
      "-p",
      "--no-session",
      ...(state.config.model ? ["--model", state.config.model] : []),
      prompt,
    ];

    // Use script -q /dev/null to force pseudo-TTY (unbuffered output)
    const child = spawn("script", ["-q", "/dev/null", "pi", ...piArgs], {
      cwd: state.dir,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    state.process = child;

    // Timeout
    const timeoutTimer = setTimeout(() => {
      const mins = trigger === "task" ? state.config.taskTimeoutMinutes : state.config.timeoutMinutes;
      logError(`${state.name}: timeout after ${mins}m — killing`);
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed) child.kill("SIGKILL");
      }, 5000);
    }, timeoutMs);

    // Pipe output to log file + capture last lines for NEXT_TASK parsing
    const outputLines: string[] = [];
    child.stdout?.on("data", (chunk: Buffer) => {
      logStream.write(chunk);
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) outputLines.push(line.trim());
        if (outputLines.length > 50) outputLines.shift();
      }
    });
    child.stderr?.pipe(logStream, { end: false });

    child.on("close", async (code) => {
      clearTimeout(timeoutTimer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      const footer = `\n[${ts()}] Exit code: ${code} | Duration: ${elapsed}s\n\n`;
      logStream.write(footer);
      logStream.end();

      if (code === 0) {
        log(`✅ ${state.name}: finished in ${elapsed}s`);

        // Parse NEXT_TASK from output (only for heartbeat/inbox triggers)
        if (trigger !== "task") {
          const nextTaskLine = outputLines.slice(-20).find(l => l.startsWith("NEXT_TASK:"));
          if (nextTaskLine) {
            const taskName = nextTaskLine.replace("NEXT_TASK:", "").trim();
            if (taskName && taskName !== "NONE") {
              log(`🎯 ${state.name}: next task → ${taskName}`);
              // Launch task execution in parallel (don't await)
              runAgent(state, "task", logsDir, taskName);
            }
          }
        }
      } else {
        logError(`${state.name}: exited with code ${code} after ${elapsed}s`);
      }

      state.running = false;
      state.process = undefined;
      state.lastHeartbeat = Date.now();

      // Release concurrency slot
      runningCount--;
      if (waitQueue.length > 0) {
        const next = waitQueue.shift()!;
        next();
      }

      // Process queue — only if still active
      if (state.queued && !shuttingDown && state.active) {
        state.queued = false;
        const nextTrigger = (state.queueTrigger as "heartbeat" | "inbox") || "heartbeat";
        state.queueTrigger = undefined;
        log(`📋 ${state.name}: processing queued run (trigger: ${nextTrigger})`);
        runAgent(state, nextTrigger, logsDir);
      } else {
        state.queued = false;
        state.queueTrigger = undefined;
      }

      resolvePromise();
    });

    child.on("error", async (err) => {
      clearTimeout(timeoutTimer);
      logError(`${state.name}: failed to start — ${err.message}`);
      logStream.write(`\n[${ts()}] ERROR: ${err.message}\n\n`);
      logStream.end();
      state.running = false;
      state.process = undefined;
      // Release concurrency slot
      runningCount--;
      if (waitQueue.length > 0) {
        const next = waitQueue.shift()!;
        next();
      }
      resolvePromise();
    });
  });
}

// ---------------------------------------------------------------------------
// Start / Stop agents
// ---------------------------------------------------------------------------

function startAgent(state: AgentState, logsDir: string): void {
  if (state.active) {
    log(`   ${state.name} is already active`);
    return;
  }

  state.active = true;
  watchInbox(state, logsDir);
  scheduleHeartbeat(state, logsDir);
  log(`▶️  ${state.name}: started`);
}

function stopAgent(state: AgentState): void {
  if (!state.active) {
    log(`   ${state.name} is already paused`);
    return;
  }

  state.active = false;
  unwatchInbox(state);

  if (state.heartbeatTimer) {
    clearTimeout(state.heartbeatTimer);
    state.heartbeatTimer = undefined;
  }

  // If running, let current execution finish but don't process queue
  state.queued = false;
  state.queueTrigger = undefined;

  log(`⏸  ${state.name}: stopped${state.running ? " (current execution will finish)" : ""}`);
}

// ---------------------------------------------------------------------------
// Heartbeat scheduling
// ---------------------------------------------------------------------------

function scheduleHeartbeat(state: AgentState, logsDir: string): void {
  const intervalMs = state.config.heartbeatMinutes * 60 * 1000;

  const tick = async () => {
    if (shuttingDown || !state.active) return;

    const timeSinceLast = Date.now() - state.lastHeartbeat;
    if (timeSinceLast >= intervalMs) {
      await runAgent(state, "heartbeat", logsDir);
    }

    if (!shuttingDown && state.active) {
      state.heartbeatTimer = setTimeout(tick, Math.min(intervalMs, 60000));
    }
  };

  // First heartbeat: run immediately
  state.heartbeatTimer = setTimeout(tick, 1000);
  log(`💓 ${state.name}: heartbeat every ${state.config.heartbeatMinutes}m`);
}

// ---------------------------------------------------------------------------
// Shutdown
// ---------------------------------------------------------------------------

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log("🛑 Shutting down...");

  for (const [name, state] of agents) {
    if (state.heartbeatTimer) clearTimeout(state.heartbeatTimer);
    if (state.watcher) state.watcher.close();
    if (state.process) {
      log(`   Stopping ${name}...`);
      state.process.kill("SIGTERM");
    }
  }

  await saveRuntimeState();

  setTimeout(() => {
    for (const [name, state] of agents) {
      if (state.process && !state.process.killed) {
        log(`   Force killing ${name}`);
        state.process.kill("SIGKILL");
      }
    }
    process.exit(0);
  }, 5000);
}

// ---------------------------------------------------------------------------
// State file watching (for CLI commands)
// ---------------------------------------------------------------------------

function watchStateFile(logsDir: string): void {
  let debounce: ReturnType<typeof setTimeout> | undefined;

  watch(STATE_FILE, { persistent: true }, () => {
    if (shuttingDown) return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(async () => {
      try {
        const desired = await loadRuntimeState();
        for (const [name, state] of agents) {
          const desiredActive = desired.agents[name]?.active ?? false;
          if (desiredActive && !state.active) {
            startAgent(state, logsDir);
          } else if (!desiredActive && state.active) {
            stopAgent(state);
          }
        }
      } catch {
        // Ignore parse errors during writes
      }
    }, 200);
  });
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  command: "daemon" | "once" | "start" | "stop" | "status";
  target?: string;  // agent name or "all"
  agentFilter?: string;  // --agent filter for daemon/once
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  // Subcommands: start, stop, status
  if (args[0] === "start") return { command: "start", target: args[1] || "all" };
  if (args[0] === "stop") return { command: "stop", target: args[1] || "all" };
  if (args[0] === "status") return { command: "status" };

  // Legacy flags
  let once = false;
  let agentFilter: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--once") once = true;
    if (args[i] === "--agent" && args[i + 1]) agentFilter = args[++i];
  }

  return { command: once ? "once" : "daemon", agentFilter };
}

// ---------------------------------------------------------------------------
// CLI commands (start/stop/status — modify state file for running daemon)
// ---------------------------------------------------------------------------

async function cliStart(target: string): Promise<void> {
  const state = await loadRuntimeState();
  const config = await loadConfig();
  const discovered = await discoverAgents(config);

  const targets = target === "all" ? discovered : [target];
  let changed = false;

  for (const name of targets) {
    if (!discovered.includes(name)) {
      logError(`Agent "${name}" not found`);
      continue;
    }
    const agentConfig = resolveAgentConfig(config, name);
    if (!agentConfig.enabled) {
      log(`⏸  ${name}: disabled in config.json — skipping`);
      continue;
    }
    if (state.agents[name]?.active) {
      log(`   ${name}: already active`);
      continue;
    }
    state.agents[name] = { active: true, lastStarted: new Date().toISOString() };
    log(`▶️  ${name}: starting`);
    changed = true;
  }

  if (changed) {
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
    log("State updated. Running daemon will pick up changes.");
  }
}

async function cliStop(target: string): Promise<void> {
  const state = await loadRuntimeState();
  const config = await loadConfig();
  const discovered = await discoverAgents(config);

  const targets = target === "all" ? discovered : [target];
  let changed = false;

  for (const name of targets) {
    if (!state.agents[name]?.active) {
      log(`   ${name}: already paused`);
      continue;
    }
    state.agents[name] = { active: false, lastStopped: new Date().toISOString() };
    log(`⏸  ${name}: stopping`);
    changed = true;
  }

  if (changed) {
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
    log("State updated. Running daemon will pick up changes.");
  }
}

async function cliStatus(): Promise<void> {
  const state = await loadRuntimeState();
  const config = await loadConfig();
  const discovered = await discoverAgents(config);

  console.log("\nBrash Agent Runtime — Status\n");
  console.log("Agent                     Config    State     Heartbeat");
  console.log("─".repeat(65));

  for (const name of discovered.sort()) {
    const agentConfig = resolveAgentConfig(config, name);
    const configStatus = agentConfig.enabled ? "enabled" : "disabled";
    const runtimeActive = state.agents[name]?.active ? "▶️  active" : "⏸  paused";
    const heartbeat = agentConfig.enabled ? `${agentConfig.heartbeatMinutes}m` : "—";
    console.log(`${name.padEnd(26)}${configStatus.padEnd(10)}${runtimeActive.padEnd(14)}${heartbeat}`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const cli = parseArgs();

  // Handle CLI subcommands (no daemon needed)
  if (cli.command === "start") {
    await cliStart(cli.target!);
    return;
  }
  if (cli.command === "stop") {
    await cliStop(cli.target!);
    return;
  }
  if (cli.command === "status") {
    await cliStatus();
    return;
  }

  // Daemon / once mode
  const config = await loadConfig();
  maxConcurrency = config.maxConcurrency || 3;
  const logsDir = resolve(__dirname_resolved, config.logsDir);

  await mkdir(logsDir, { recursive: true });

  log("🏢 Brash Agent Runtime starting");
  log(`   Agents dir: ${resolve(__dirname_resolved, config.agentsDir)}`);
  log(`   Logs dir: ${logsDir}`);
  log(`   Max concurrency: ${maxConcurrency}`);
  log(`   Timeouts: heartbeat ${config.defaults.timeoutMinutes}m / task ${config.defaults.taskTimeoutMinutes}m`);

  // Discover agents
  const discovered = await discoverAgents(config);
  log(`   Discovered ${discovered.length} agents: ${discovered.join(", ")}`);

  // Initialize agent states — all paused by default
  for (const name of discovered) {
    if (cli.agentFilter && name !== cli.agentFilter) continue;

    const agentConfig = resolveAgentConfig(config, name);
    if (!agentConfig.enabled) {
      log(`   ⏸  ${name}: disabled in config`);
      continue;
    }

    const agentDir = resolve(__dirname_resolved, config.agentsDir, name);
    const state: AgentState = {
      name,
      dir: agentDir,
      config: agentConfig,
      active: false,        // Start paused
      running: false,
      queued: false,
      lastHeartbeat: 0,
    };

    agents.set(name, state);
  }

  if (agents.size === 0) {
    log("No enabled agents found. Exiting.");
    return;
  }

  // --once mode: run one heartbeat per agent and exit (ignores paused state)
  if (cli.command === "once") {
    log(`\n🔄 Running single heartbeat for ${agents.size} agent(s)...\n`);
    const promises: Promise<void>[] = [];
    for (const state of agents.values()) {
      state.active = true;  // Temporarily activate for --once
      promises.push(runAgent(state, "heartbeat", logsDir));
    }
    await Promise.all(promises);
    log("\n✅ All heartbeats complete. Exiting.");
    return;
  }

  // Daemon mode: start with all agents paused
  log(`\n🔄 Starting daemon mode for ${agents.size} agent(s) — all paused`);
  log(`   Use 'npx tsx agent-runtime.ts start <agent|all>' to activate agents\n`);

  // Write initial state file (all paused)
  await saveRuntimeState();

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Watch state file for start/stop commands
  watchStateFile(logsDir);

  // List registered agents
  for (const [name, state] of agents) {
    log(`   ⏸  ${name}: registered (heartbeat: ${state.config.heartbeatMinutes}m) — waiting for start`);
  }

  log("\n🟡 Runtime active — all agents paused. Use start/stop commands to control.\n");
}

main().catch((err) => {
  logError(`Fatal: ${err.message}`);
  process.exit(1);
});
