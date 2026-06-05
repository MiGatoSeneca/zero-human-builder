# Communication Processing

How to process incoming messages during heartbeat. All messages in **English**.

## Inbox Structure

```
inbox/
├── {message}.md          # Pending messages
└── archive/
    └── {message}.md      # Processed messages
```

## Message Format

File name: `YYYY-MM-DD-HHMM-{sender}-{type}.md`

```markdown
# [Subject]

- **From**: Who sends it
- **Date**: YYYY-MM-DD HH:MM
- **Type**: task-request | delivery | review-request | feedback-request | follow-up | response | milestone
- **Related task**: Link to related task (if any)

## Body

The actual message content.
```

## Message Types

| Type | What it means |
|------|--------------|
| **task-request** | Someone is delegating work to you |
| **delivery** | Work has been completed and delivered |
| **review-request** | Someone asks you to validate their work |
| **feedback-request** | Someone asks for your input before or during work |
| **follow-up** | Someone is checking on status of something |
| **response** | A reply to any of the above |
| **milestone** | Broadcast of a significant achievement |

## Processing

For each `.md` file in `inbox/` (ignore `archive/`):

1. Read it
2. Decide the action:
   - **Needs a response** → create task `respond-to-{sender}-{topic}`
   - **Creates work** → create task in backlog with the work described
   - **Updates existing work** → update the related task's TASK.md
   - **Informational** → no task needed
3. Add to the message file:
   ```markdown
   ## Processed
   - **Date**: YYYY-MM-DD HH:MM
   - **Action**: What was decided (task created, task updated, noted)
   ```
4. Move to `inbox/archive/`

**Never write or send responses during heartbeat.** Only create tasks.
