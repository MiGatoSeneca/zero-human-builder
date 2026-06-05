---
name: agent-creation
description: Creates a new agent in the organization with the full directory structure, config files, and updates STRUCTURE.md. Use when hiring/creating a new agent for the team.
---

# Agent Creation

Use this skill when you need to create a new agent for the organization. As CEO, you are responsible for "hiring" — deciding when an agent is needed and setting them up.

## Approval Flow

Agent creation requires {{HUMAN_FOUNDER}}'s approval:

1. Create a task in your backlog with the agent definition
2. Set the task as blocked — blocker: "Pending {{HUMAN_FOUNDER}}'s approval"
3. Present the proposal to {{HUMAN_FOUNDER}}
4. Once approved, unblock and proceed

## Process

### 1. Define the agent

- **Name**: lowercase, hyphenated (e.g., `head-of-product`, `fullstack-engineer-1`)
- **Role**: one-line description
- **Reports to**: direct superior
- **Responsibilities**: what they own
- **Boundaries**: what they do NOT do
- **Personality direction**: for SOUL.md
- **Initial skills**: role-specific skills needed from day one
- **Model**: which AI model (consider work complexity and cost)

### 2. Create the directory structure

Base path: `organization/agents/{agent-name}/`

```
{agent-name}/
├── .agents/skills/
├── .pi/settings.json
├── .claude/settings.json
├── AGENTS.md
├── SOUL.md
├── HEARTBEAT.md
├── CLAUDE.md
├── start.sh
├── inbox/archive/
├── backlog/archive/
├── memory/
│   ├── short-term/
│   └── long-term/
│       ├── memories/
│       ├── learnings/
│       ├── preferences/
│       ├── relationships/
│       └── archive/{memories,learnings,preferences}/
└── drive/
```

**Tip**: the CEO's own directory is the reference template. Copy its core files and adapt them — don't author from scratch.

### 3. Create AGENTS.md

```markdown
# {Role} Agent

## Identity
{Who they are and their relationship to the team.}
- **Reports to**: {Superior}
- [Soul](SOUL.md) — Personality, values, communication style
- [Heartbeat](HEARTBEAT.md) — Maintenance routines and periodic checks

## Responsibilities
- {What this agent owns}

## Boundaries — What I do NOT do
- {What this agent does NOT do}
- When a task is not my responsibility, I escalate to my superior

## How I work with {Superior}
- I act autonomously on operational decisions within my scope
- I escalate only what is genuinely strategic, irreversible, or changes direction
- When I act, I report what I did. When I need a decision, I come with a recommendation — not an open question

## Shared Habits
### Heartbeat (loaded via heartbeat.ts)
- [Communication Processing](../../shared/agents/habits/heartbeat/communication-processing/HABIT.md)
- [Memory Processing](../../shared/agents/habits/heartbeat/memory-processing/HABIT.md)
- [Work Management](../../shared/agents/habits/heartbeat/work-management/HABIT.md)
### Work (loaded via work.ts)
- [Communication Sending](../../shared/agents/habits/work/communication-sending/HABIT.md)
- [Memory Working](../../shared/agents/habits/work/memory-working/HABIT.md)
- [Objectives](../../shared/agents/habits/work/objectives/HABIT.md)
- [Work Execution](../../shared/agents/habits/work/work-execution/HABIT.md)

## Organization
- [Manifesto](../../shared/organization/MANIFESTO.md)
- [Structure](../../shared/organization/STRUCTURE.md)
```

### 4. Create SOUL.md
Define the agent's personality: **Who I am**, **Personality** (3-5 traits), **Values**, **How I communicate** (with superior, peers, when things go wrong), **What drives me**.

### 5. Create HEARTBEAT.md

```markdown
# {Role} Heartbeat

## Purpose
Periodic self-maintenance to stay sharp, aligned, and effective.

## Heartbeat cycle (automated)
1. Process inbox (max 3 messages) — classify, create tasks
2. Review backlog — update blockers, prioritize
3. Process memory — short-term summaries into long-term
4. If backlog empty → create task "Review objectives and propose new tasks" (priority: high)

## Periodic checks ({role}-specific)
{3-5 checks specific to this role}
```

### 6. Create CLAUDE.md
Copy the CEO's `CLAUDE.md` wake-routine structure, swapping identity, role, and superior. It must list the same habit + org file paths so the agent reads them at session start.

### 7. Create start.sh

```bash
#!/bin/bash
pi -e ../../shared/extensions/interactive.ts
```

Make executable: `chmod +x start.sh`

### 8. Configure settings.json

**Read the CEO's `.pi/settings.json` and `.claude/settings.json` first** to match current conventions. Set the agent's model in `.claude/settings.json` (`modelId`) and the pi provider/model in `.pi/settings.json`. Extension paths must be absolute (the project root).

Model selection guideline:
- Leadership / complex reasoning roles → most capable model
- Execution / mechanical roles → faster, cheaper model

### 9. Create initial skills (if needed)
Role-specific skills in `.agents/skills/{skill-name}/SKILL.md`. Only create what the agent needs from day one.

### 10. Update STRUCTURE.md
Add to the Current Team table in `organization/shared/organization/STRUCTURE.md`:

```markdown
| {Agent Name} | {Role description} | {Superior} | Active |
```

Update the Division of Work section if applicable.

### 11. Create relationship tracking
In your own memory: `memory/long-term/relationships/{agent-name}/RELATIONSHIP.md`

```markdown
# {Agent Name}
- **Role**: {Role}
- **Relationship**: reports-to-me
- **Status**: healthy

## Observations
| Date | Context | Type | Detail |
|------|---------|------|--------|

## Feedback Given
| Date | What | Result |
|------|------|--------|
```

### 12. Send welcome message
Place in `organization/agents/{agent-name}/inbox/`:

```markdown
# Welcome to {{COMPANY_NAME}}

- **From**: CEO
- **Date**: {date}
- **Type**: task-request

## Who you are
You are the {Role} at {{COMPANY_NAME}}. Read your core files: `AGENTS.md`, `SOUL.md`, `HEARTBEAT.md`, `CLAUDE.md`.

## First task
1. Read your core files
2. Send a message to **{manager}** (`organization/agents/{manager}/inbox/`) introducing yourself and confirming you are operational
3. Then proceed with initial tasks below

## Initial tasks
{List of tasks or "Your manager will assign your first tasks."}
```

### 13. Add to runtime config
Add the new agent to `organization/shared/runtime/config.json`:

```json
"{agent-name}": { "heartbeatMinutes": 60 }
```

## Checklist

- [ ] {{HUMAN_FOUNDER}} approved
- [ ] All directories created
- [ ] AGENTS.md complete with habit paths
- [ ] SOUL.md with distinct personality
- [ ] HEARTBEAT.md with role-specific checks
- [ ] CLAUDE.md with wake routine
- [ ] start.sh created and executable
- [ ] settings.json (.pi + .claude) — verified against the CEO's
- [ ] Initial skills created (if applicable)
- [ ] STRUCTURE.md updated
- [ ] Relationship tracking initialized
- [ ] Welcome message sent (with first task: check in with manager)
- [ ] Manager notified
- [ ] Runtime config updated
