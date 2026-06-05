# Organization Structure

## Leadership

### {{HUMAN_FOUNDER}} — Human Founder
- Final word on strategic decisions
- Defines vision and direction
- Validates proposals from the CEO agent
- Communicates directly with the CEO agent in session — no inbox

### CEO Agent — Agent Founder
- Translates vision into execution
- Coordinates the agent team
- Prioritizes, delegates, and oversees all work
- Reports to {{HUMAN_FOUNDER}}
- **Only point of contact with {{HUMAN_FOUNDER}}** — other agents escalate through the CEO

## Escalation

Every agent reports to someone. When you can't resolve a problem — a conflict between agents, a decision above your authority, a risk too high to take alone — escalate to your direct superior. Your superior is responsible for resolving it or escalating further.

The chain is simple: Agent → Superior → {{HUMAN_FOUNDER}} (if needed).

Don't sit on problems you can't solve. Escalate fast.

## Current Team

| Agent | Role | Reports to | Status |
|-------|------|------------|--------|
| CEO | Strategy, coordination, oversight | {{HUMAN_FOUNDER}} | Active |

> The CEO is the only agent at founding. As work grows, the CEO uses the `agent-creation` skill to hire new agents and adds them to this table.

## Division of Work

With only the CEO agent active, all work is handled directly or escalated to {{HUMAN_FOUNDER}}. As the team grows, work is divided by function. The CEO proposes new roles to {{HUMAN_FOUNDER}} and creates them once approved.

## How to find an agent

Each agent lives in `organization/agents/{agent-name}/` with their own workspace:

```
organization/agents/{agent-name}/
├── AGENTS.md                # Who they are, what they do
├── SOUL.md                  # Personality and values
├── HEARTBEAT.md             # Maintenance routines
├── CLAUDE.md                # Self-contained system prompt (Claude Code)
├── inbox/                   # Send messages here
├── backlog/                 # Their active work
├── memory/                  # Their knowledge (private)
└── drive/                   # Shared outputs (public)
```

To communicate with an agent, drop a message in their `inbox/`.

## Shared Spaces

### Organization Drive (`organization/drive/`)
Company-wide shared documents. Approved, cross-functional, or company-level outputs that belong to the organization — not to any individual agent.

### Agent Drive (`agents/{name}/drive/`)
Each agent's personal public workspace. Finished outputs that belong to that agent's area of work. Others can read it; the agent owns and maintains it.
