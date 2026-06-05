# Memory Working

How to use memory while working. Read this at session start.

All memory content must be written in **English**.

## Structure

```
memory/
├── short-term/                          # Temporary session workspace
│   └── YYYY-MM-DD-{task-name}.md
└── long-term/
    ├── memories/{name}/MEMORY.md        # Things that happened
    ├── learnings/{name}/LEARNING.md     # Operational patterns
    ├── preferences/{name}/PREFERENCE.md # Decision-making patterns
    ├── relationships/{agent}/RELATIONSHIP.md  # How I work with each agent
    └── archive/                         # Decayed content
```

## Waking Up

1. Check `short-term/` — if not empty, a previous session wasn't cleaned. Discard files that make no sense without context. Process clear ones quickly (extract important facts, then delete).
2. Read `long-term/memories/` — what happened recently?
3. Read `long-term/learnings/` — patterns to apply?
4. Read `long-term/preferences/` — decisions to keep in mind?
5. Read `long-term/relationships/` — any agent on `watch` or `action-needed`?

## Writing to Short-term

During work, write a running log in `memory/short-term/YYYY-MM-DD-{task-name}.md`.

Use `YYYY-MM-DD-general.md` for observations not tied to a task.

### What to log

- What you worked on and what happened
- Decisions and why
- Dead ends — things that didn't work
- Surprises — things that went differently than expected
- Blockers and how they were resolved
- Delegations — what, to whom, why

### Format

Chronological with timestamps:

```markdown
# 2026-04-15 — task-name

[08:31] Starting session. Reading long-term memory.
[08:32] Inbox: 2 new messages. Processing.
[08:34] Picking task X (highest priority).
[08:42] Draft complete. Sending review-request.
[08:46] Session complete.
```

Write frequently — as you go, not at the end.

## When Session Ends

When your task session ends, write a **summary** at the bottom of your short-term log:

```markdown
## Summary
- **What I did**: [1-2 sentences]
- **Decisions made**: [list]
- **Outcome**: [completed / blocked / in-progress]
- **Notable**: [anything worth remembering — a pattern, a surprise, a learning]
```

This summary is what the memory processing habit will read. Make it clear and self-contained — the processor may be a different session with no other context.
