---
name: zero-human-init
description: Scaffold a new zero-human startup project — an agent organization with a founding CEO agent, shared habits (heartbeat + work), organization docs (manifesto, structure), and an optional pi/ollama runtime. Use when starting a new zero-human company / agent-run project, or when the user says "init a new zero-human project", "create a new agent startup", "scaffold a zero-human org".
---

# Zero-Human Init

Scaffolds a fresh **zero-human startup**: a markdown-driven agent organization modeled on the proven structure. It generates the folder tree, the founding **CEO agent** (with its `agent-creation` skill so it can hire the rest of the team), the **shared habits** (heartbeat + work), the **organization docs** (manifesto + structure), and an optional **pi/ollama runtime**.

## What gets generated

```
{project}/
├── README.md
└── organization/
    ├── agents/ceo/            # founding agent: AGENTS, SOUL, HEARTBEAT, CLAUDE,
    │                          #   inbox/ backlog/ memory/ drive/, agent-creation skill
    ├── shared/
    │   ├── agents/habits/     # heartbeat/* and work/* habits (the operating system)
    │   ├── organization/      # MANIFESTO.md, STRUCTURE.md
    │   ├── extensions/        # pi extensions (wake/heartbeat/work, ollama)
    │   └── runtime/           # agent-runtime.ts, config.json, README (optional)
    └── drive/objectives/      # company objectives
```

## Procedure

### 1. Gather inputs (keep it minimal)

The deep personalization (mission, vision, values, objectives) does **not** happen here — it happens on the CEO's first boot, in a founding session run by the `company-setup` skill. So `init` only asks the essentials to stand up the project. Ask with the AskUserQuestion tool (one batch):

| Field | Question | Default if skipped |
|-------|----------|--------------------|
| `COMPANY_NAME` | Name of the startup | — (required) |
| `ONE_LINER` | One sentence: what does it do? | — (required) |
| `HUMAN_FOUNDER` | Human founder's name | `Pablo` |
| `LANGUAGE` | Working language for all written output | `English` |
| target directory | Where to create it | `~/Personal/{slug}` |
| runtime | Keep the pi/ollama runtime, or markdown-only? | Keep it (it's inert until started) |
| `CEO_MODEL_CLAUDE` | Claude model id for the CEO | `claude-sonnet-4-6` |

Then derive the rest **without asking** — these are provisional drafts the founding session will replace:

- `COMPANY_SLUG` = lowercase, hyphenated `COMPANY_NAME`
- `DATE` = today (session date)
- `MISSION`, `VISION`, `WHAT_WE_DO` = a short, sensible draft inferred from the one-liner. Keep them brief — they're placeholders.
- `CEO_PERSONALITY` = "I am a demanding, direct builder with high standards. I challenge weak thinking and bias toward action." (default edge)
- `WHAT_DRIVES_CEO` = "Building {COMPANY_NAME} into a company that matters. Every decision serves that mission."
- `DRAFT_NOTICE` = `> ⚠️ DRAFT — these foundations were stubbed from a one-liner. The CEO finalizes them with the founder in the founding session (run the \`company-setup\` skill).`

**Don't over-ask.** Required = name + one-liner. Everything else defaults. Tell the user the company docs will be a DRAFT until the founding session, and confirm the target directory before writing.

### 2. Generate

Write the collected values to a temp JSON config and run the generator:

```bash
SKILL_DIR="$HOME/Personal/zero-human-builder/zero-human-init"
cat > /tmp/zh-init.json <<'JSON'
{
  "target_dir": "<ABS_TARGET>",
  "values": {
    "COMPANY_NAME": "...",
    "COMPANY_SLUG": "...",
    "ONE_LINER": "...",
    "WHAT_WE_DO": "...",
    "MISSION": "...",
    "VISION": "...",
    "HUMAN_FOUNDER": "...",
    "CEO_PERSONALITY": "...",
    "WHAT_DRIVES_CEO": "...",
    "LANGUAGE": "English",
    "CEO_MODEL_CLAUDE": "claude-sonnet-4-6",
    "DATE": "YYYY-MM-DD",
    "DRAFT_NOTICE": "> ⚠️ DRAFT — these foundations were stubbed from a one-liner. The CEO finalizes them with the founder in the founding session (run the `company-setup` skill)."
  }
}
JSON
python3 "$SKILL_DIR/generate.py" /tmp/zh-init.json
```

The generator refuses to write into a non-empty directory. `PROJECT_ROOT` is injected automatically (used in the pi settings' absolute extension paths).

### 3. If markdown-only runtime was chosen

Remove the optional pi runtime pieces from the generated project:

```bash
rm -rf "<ABS_TARGET>/organization/shared/extensions" "<ABS_TARGET>/organization/shared/runtime"
rm -f "<ABS_TARGET>/organization/agents/ceo/.pi/settings.json" "<ABS_TARGET>/organization/agents/ceo/start.sh"
```

Leave `.claude/settings.json` and `CLAUDE.md` — those drive Claude Code, which reads the habits directly via the wake routine in `CLAUDE.md`.

### 4. Write the project README

Create `<ABS_TARGET>/README.md` describing the company, how to run the CEO (`cd organization/agents/ceo && claude`, or `./start.sh` for pi), and how the CEO grows the team with `agent-creation`.

### 5. Init git (optional) and report

Offer to `git init`. Then summarize: what was created and where, and how to launch the CEO:

```
cd <ABS_TARGET>/organization/agents/ceo && claude     # (or ./start.sh for pi)
```

Make the key point clear: **the company docs are a DRAFT on purpose.** On its first boot the CEO will run the `company-setup` skill and define the company *with the founder* — mission, vision, values, the first objective, and the first hires. That founding session is the CEO's first task (it's waiting in its `inbox/`).

## Notes

- The **habits are the operating system** — don't duplicate their rules elsewhere; the CEO reads them at session start.
- The founding org has **only the CEO**. It grows when the CEO proposes a hire to the founder and runs `agent-creation`.
- All written output is in `LANGUAGE` (default English); conversations with the founder can be in any language.
