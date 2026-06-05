import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as path from "node:path";
import * as fs from "node:fs";

export default function (pi: ExtensionAPI) {
  let firstInteraction = true;

  pi.on("session_start", async () => {
    firstInteraction = true;
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (!firstInteraction) return;
    firstInteraction = false;

    const baseDir = ctx.cwd;
    const files = [
      "../../shared/agents/habits/heartbeat/communication-processing/HABIT.md",
      "../../shared/agents/habits/heartbeat/memory-processing/HABIT.md",
      "../../shared/agents/habits/heartbeat/work-management/HABIT.md",
      "../../shared/agents/habits/work/communication-sending/HABIT.md",
      "../../shared/agents/habits/work/memory-working/HABIT.md",
      "../../shared/agents/habits/work/objectives/HABIT.md",
      "../../shared/agents/habits/work/work-execution/HABIT.md",
      "../../shared/organization/MANIFESTO.md",
      "../../shared/organization/STRUCTURE.md",
    ];

    const sections: string[] = [];

    for (const file of files) {
      const fullPath = path.resolve(baseDir, file);
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        sections.push(`## ${file}\n\n${content}`);
      } catch {
        sections.push(`## ${file}\n\n[ERROR: Could not read file]`);
      }
    }

    return {
      message: {
        customType: "wake-routine",
        content: `SESSION STARTUP — Read and internalize the following files. They define your habits and organizational context:\n\n${sections.join("\n\n---\n\n")}`,
        display: false,
      },
    };
  });
}
