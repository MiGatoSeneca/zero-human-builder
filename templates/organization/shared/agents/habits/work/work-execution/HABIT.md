# Work Execution

How to execute a task. Read this when starting work on a specific task. All content in **English**.

## Starting a Task

1. Update status to `in-progress`
2. Analyze the task — break it into parts:
   - What can you do yourself?
   - What needs delegation? → Send `task-request` to the right agent, add as blocker

## Working

- Write outputs to `backlog/{task}/files/`
- Keep a running log in `backlog/{task}/log/MEMORY.md` as you go:

```markdown
# Log — {task-name}

[2026-04-20 08:31] Starting. Reading spec.
[2026-04-20 08:34] Decided to use approach X because Y.
[2026-04-20 08:42] Draft complete. Sending review-request.
```

- **Do NOT write to `memory/short-term/` during task execution.** All working notes go in the task's `log/MEMORY.md`.
- If blocked → update TASK.md status, describe blocker, send `follow-up` to owner
- If finished → move to finishing steps below

### Key Principles

- **Research before deciding** — Look for data, references, prior art. Evaluate options. Then propose with justification. Never escalate a decision you haven't researched yourself. Asking questions to gather context is fine — asking questions to replace your thinking is not.
- **Act by default** — If it's within your responsibilities, do it and report after. Only escalate what is irreversible, expensive, or changes direction.
- **Advance proactively** — Deadlines are the latest acceptable date, not the target. If you can do it now, do it now.

## Reviewing Other Agents' Work

When you receive a deliverable for review:

1. Read it completely — every section, every decision
2. Be critical by default — look for what's weak, missing, or unjustified
3. Acknowledge what's good — but explain why, not just "looks good"
4. Every decision needs a "why" — no justification = flag it
5. Give specific, actionable feedback — "needs X because Y", not "this is weak"

## Finishing a Task

When a task reaches a terminal state (done, blocked, or discarded):

1. Update TASK.md status to `review` (if done) or `blocked`
2. Send `review-request` to reviewers with deliverables and definition of done
3. If approved → status `done`, send `delivery` to stakeholders
4. **Only now** write a summary to `memory/short-term/YYYY-MM-DD-{task-name}.md`:

```markdown
# {task-name} — Summary

- **What I did**: [1-2 sentences]
- **Decisions made**: [list]
- **Outcome**: completed | blocked | discarded
- **Notable**: [anything worth remembering — a pattern, a surprise, a learning]
```

This summary is what the heartbeat will process into long-term memory. Make it clear and self-contained. It is the **only** time you write to short-term memory during task work.

5. Move deliverables to appropriate drive
6. Move task to `backlog/archive/`

## Proposing New Tasks

When you finish and have capacity:

1. Read your objectives (`drive/objectives/current.md`) and company objectives (`organization/drive/objectives/monthly.md`)
2. Is your backlog enough for the next session? Are objectives covered?
3. Create tasks with status `proposed` for high-impact gaps
4. Send `feedback-request` to your manager listing proposed tasks with justification

Proposed tasks cannot be worked on until approved. Each must connect to an objective and have a clear outcome.
