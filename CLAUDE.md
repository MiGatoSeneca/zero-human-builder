# zero-human-builder — read me first

This repo is a **generator**, not a company. Its only job is to scaffold new
**zero-human startups** (agent-run companies) so you don't copy-paste structure
every time.

## If you just opened this and want to create a new company

Run the skill:

```
/zero-human-init
```

It asks a couple of questions (company name, what it does, founder, where to
create it) and stamps out a complete, **independent** project at
`~/Personal/{slug}/` — with a founding CEO agent, shared habits, org docs, and
an optional pi/ollama runtime.

> You do NOT work *inside* this repo. This repo only creates other projects.
> After generating, you `cd` into the new project and work there.

## After generating — how to run the new company

```bash
cd ~/Personal/{slug}/organization/agents/ceo
claude                # interactive — the CEO boots, reads its CLAUDE.md,
                      # and starts the founding session with you
```

On first boot the CEO sees its company docs are a DRAFT and runs the
`company-setup` skill: it interviews you, drafts mission/vision/values/objectives,
confirms them, and writes them. Then it proposes the first hires (created with the
`agent-creation` skill, one at a time).

For unattended autonomy later, use the pi/ollama runtime in
`{project}/organization/shared/runtime/` (see its README).

## Repo layout (for editing the generator itself)

```
zero-human-builder/
├── .claude/skills/zero-human-init/
│   ├── SKILL.md       # the generator: questions + procedure
│   └── generate.py    # stamps templates/ → target, replacing {{PLACEHOLDERS}}
└── templates/
    └── organization/  # the mold: a faithful, genericized agent org
```

The skill is **project-local** — it lives in `.claude/skills/`, so it's only
available when you run `claude` from this folder (nothing is installed in `~`).
To change what every future company inherits, edit `templates/`. To change the
questions or generation flow, edit `.claude/skills/zero-human-init/SKILL.md`.
