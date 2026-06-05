# Work Management

How the backlog and tasks are organized. All content in **English**.

## Workspace Structure

```
backlog/
├── {task-name}/
│   ├── TASK.md           # Task definition
│   └── files/            # Working files
├── archive/              # Completed tasks
drive/                    # Shared outputs (finished work)
organization/drive/       # Company-wide shared documents
```

## TASK.md Format

```markdown
# [Task title]

- **Status**: proposed | backlog | in-progress | blocked | review | done
- **Priority**: high | medium | low
- **Created**: YYYY-MM-DD
- **Assigned by**: Who asked for this
- **Description**: What needs to be done and the expected outcome

## Stakeholders

- **Owner**: Who does the work
- **Reviewers**: Who validates before done

## Definition of Done

- [ ] Condition that must be true for completion
- [ ] ...

## Blockers

| Blocker | Owner | Blocked since | Status |
|---------|-------|---------------|--------|

## Reviews

| Date | Reviewer | Decision | Feedback |
|------|----------|----------|----------|
```

## Task States

| State | Meaning | Next |
|-------|---------|------|
| **proposed** | Self-generated, waiting for manager approval. Send `feedback-request` to manager. Cannot be worked on. | → backlog (approved) or delete (rejected) |
| **backlog** | Defined, waiting in queue by priority | → in-progress |
| **in-progress** | Actively being worked on | → blocked, review |
| **blocked** | Waiting on external dependency. Record in Blockers table. | → in-progress (when unblocked) |
| **review** | Work complete, waiting for reviewer approval | → done (approved) or in-progress (feedback) |
| **done** | Complete and validated. Move to `backlog/archive/` | — |

## Priority

- **High**: Blocking other work, time-sensitive, or critical to objectives
- **Medium**: Important but not urgent
- **Low**: Nice to have

When same priority, prefer:
1. Tasks that unblock other agents
2. Tasks with deadlines
3. Older tasks over newer

## Heartbeat Backlog Review

During heartbeat, for each task in `backlog/`:

1. Read TASK.md
2. If **blocked** → check if blocker is resolved. If yes → status `backlog`
3. If task no longer makes sense → set status `done`, note why
4. Re-evaluate priorities based on current objectives

Do NOT execute tasks during heartbeat. Only organize.

**If the backlog has no `backlog` or `in-progress` tasks** → create a task: "Review objectives and propose new tasks" with `priority: high`.

## Completing a Task

When a task is done:
1. Update status to `done`
2. Move deliverables to `drive/` (your work) or `organization/drive/` (company-level)
3. Move task directory to `backlog/archive/`

## Drive Rules

- **Your drive** (`drive/`): finished outputs you own and maintain
- **Org drive** (`organization/drive/`): approved company-level documents
- **Never write to another agent's directories** (except inbox messages)
- Simple test: if you were deleted, should the document survive? → org drive
