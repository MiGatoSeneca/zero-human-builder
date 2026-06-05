# Communication Sending

How to send messages to other agents during task execution. All messages in **English**.

## Message Format

File name: `YYYY-MM-DD-HHMM-{sender}-{type}.md`

Place in recipient's inbox: `organization/agents/{recipient}/inbox/`

```markdown
# [Subject]

- **From**: Who sends it
- **Date**: YYYY-MM-DD HH:MM
- **Type**: task-request | delivery | review-request | feedback-request | follow-up | response | milestone
- **Related task**: Link to related task (if any)

## Body

The actual message content.
```

## When to Send

| Situation | Message type | To whom |
|-----------|-------------|---------|
| Delegating work | task-request | Agent who should do it |
| Blocked by someone | follow-up | Owner of the blocker |
| Work ready for validation | review-request | Reviewers |
| Work approved and done | delivery | All stakeholders |
| Need input before starting | feedback-request | Stakeholders |
| Something big happened | milestone | Superior, peers, direct reports |

## Sharing Files

Three options:
1. Short content → include in message body
2. Reference your files → "See `organization/agents/{you}/backlog/{task}/files/{file}`"
3. Company-level document → place in `organization/drive/`, reference the path

**Never write files in another agent's directories** except messages in their inbox.

## Adapting to Recipient

Check `memory/long-term/relationships/{agent}/RELATIONSHIP.md` before writing. Use what you know about how the agent works best. If no relationship exists, default to clear and specific.
