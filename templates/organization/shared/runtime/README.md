# Agent Runtime (optional)

Autonomous execution system for the {{COMPANY_NAME}} agent team. **Optional** — you only need this for unattended, heartbeat-driven autonomy. For day-to-day work you can just run `claude` (or `pi`) inside an agent's directory; it reads `CLAUDE.md` and loads its habits.

Requires the `pi` runtime and (for local-model heartbeats) Ollama.

## How it works

Two triggers wake agents up:

1. **Heartbeat** — Periodic timer (configurable per agent). The agent runs its full cycle: wake → inbox → backlog → work → sleep.
2. **Inbox event** — A new file in the agent's `inbox/` directory triggers an immediate wake-up.

Each trigger spawns `pi -p` (print mode, non-interactive) from the agent's directory. The agent's `AGENTS.md`, extensions, and skills load automatically. **All agents start paused** — the daemon registers them but doesn't activate heartbeats until you explicitly start them.

## Usage

```bash
npx tsx agent-runtime.ts                 # start daemon (all agents paused)
npx tsx agent-runtime.ts start ceo       # activate an agent
npx tsx agent-runtime.ts start all
npx tsx agent-runtime.ts stop ceo
npx tsx agent-runtime.ts status
npx tsx agent-runtime.ts --once          # single heartbeat for all enabled agents
```

## Configuration

Edit `config.json`. Per-agent overrides: `enabled`, `heartbeatMinutes`, `timeoutMinutes`, `model`, `thinkingLevel`.

- `enabled: false` → the agent is never registered (start/stop won't affect it)
- All other agents start **paused** and must be explicitly started

## Running as a background service

```bash
tmux new-session -d -s {{COMPANY_SLUG}}-runtime 'npx tsx agent-runtime.ts'
tmux attach -t {{COMPANY_SLUG}}-runtime
```
