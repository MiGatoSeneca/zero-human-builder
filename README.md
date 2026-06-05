# zero-human-builder

A generator for **zero-human startups** — agent-run companies. Instead of copy-pasting the same scaffolding every time you start a new one, answer a couple of questions and get a complete agent organization with a founding CEO agent ready to work.

## What it generates

A markdown-driven agent organization (modeled on the proven structure):

- **A founding CEO agent** — `AGENTS.md` (role), `SOUL.md` (personality), `HEARTBEAT.md` (maintenance), `CLAUDE.md` (self-contained system prompt + wake routine), and its `inbox/ backlog/ memory/ drive/` workspace.
- **The `company-setup` skill** inside the CEO — the founding session. `init` only captures a name + one-liner and leaves the company docs as a **DRAFT**; on first boot the CEO runs `company-setup` to define mission, vision, values, the first objective and first hires *with the founder*, then writes the real docs.
- **The `agent-creation` skill** inside the CEO — so the CEO can "hire" the rest of the team on demand.
- **Shared habits** (`shared/agents/habits/`) — the operating system: heartbeat (communication / memory / work-management) and work (communication-sending / memory-working / objectives / work-execution).
- **Organization docs** (`shared/organization/`) — `MANIFESTO.md`, `STRUCTURE.md`.
- **Optional pi/ollama runtime** (`shared/runtime/`, `shared/extensions/`) — for unattended, heartbeat-driven autonomy. Inert until you start it. Can be skipped for a markdown-only / Claude-Code-only project.

## Usage

Inside Claude Code, run the skill:

```
/zero-human-init
```

It asks for the company name, what it does, the founder's name, and a few optionals (everything else defaults), then stamps out the project — by default into `~/Personal/{slug}`.

## Layout of this repo

```
zero-human-builder/
├── .claude/skills/zero-human-init/
│   ├── SKILL.md         # the generator skill (asks questions, drives generation)
│   └── generate.py      # stamps templates/ → target, substituting {{PLACEHOLDERS}}
└── templates/
    └── organization/    # the mold: a faithful, genericized agent org
```

The skill is **project-local**: it lives in `.claude/skills/`, so it's available when you run `claude` from this folder — nothing is installed in `~`. Edit the templates here to evolve what every new startup inherits.

## Reference

The structure is distilled from a working zero-human company (`brash`): each agent lives in `organization/agents/{name}/`, communicates via `inbox/` files, tracks work in `backlog/`, and maintains private `memory/` + public `drive/`. The shared habits define *how* every agent operates so behavior is consistent across the org.
