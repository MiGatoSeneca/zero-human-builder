# Memory Processing

How to process and maintain memory. Run this during heartbeat sleep phase.

All memory content must be written in **English**.

## Structure

```
memory/
├── short-term/                          # To process and clear
└── long-term/
    ├── memories/{name}/MEMORY.md        # Things that happened (max 20)
    ├── learnings/{name}/LEARNING.md     # Operational patterns (max 10)
    ├── preferences/{name}/PREFERENCE.md # Decision-making patterns (max 10)
    ├── relationships/{agent}/RELATIONSHIP.md
    └── archive/                         # Decayed content (max 20 total)
```

## Step 1 — Process short-term into long-term

For each file in `short-term/` (max 3 per heartbeat, oldest first):

Read it — focus on the Summary section if present. For each piece of content, ask:

1. **Did something important happen?** → Create a memory
2. **Did I discover a work pattern?** → Create or reinforce a learning
3. **Did I observe a decision pattern?** → Create or reinforce a preference
4. **Did I observe something about an agent?** → Add to their relationship file
5. **Just noise?** → Skip

**Before creating anything**, check if it already exists in long-term or archive.

**Filter**: Will this matter in 2 weeks? Already stored? Easy to find without memory? → Don't store.

After processing a file, **delete it**.

If more than 3 files remain, stop. Note "X files remaining" and leave them for the next heartbeat.

## Step 2 — Review long-term

### Memories

```markdown
# [What happened]
- **Date**: YYYY-MM-DD
- **Memory**: 1-3 sentences.
```

- Still relevant? → Keep
- Historical milestone? → Keep
- No longer matters? → Archive or delete
- Over 20? → Delete or archive the least relevant

### Learnings

```markdown
# [Learning title]
- **Learned**: YYYY-MM-DD
- **Status**: active | consolidated | archived
- **Learning**: One sentence.

## Usage log
| Date | Context | Abstraction |
|------|---------|-------------|
```

- Applied 3+ times in different contexts within 30 days → **Consolidate**:
  - General work principle → add to AGENTS.md
  - Repeatable procedure → create a skill
  - Every-session pattern → add to a habit
  - Then delete the learning
- Not applied for 30 days → archive
- Over 10 active → consolidate or archive oldest

### Preferences

```markdown
# [Preference title]
- **Observed**: YYYY-MM-DD
- **Status**: active | consolidated | archived
- **Preference**: One sentence.

## Observation log
| Date | Context | Abstraction |
|------|---------|-------------|
```

- Observed 3+ times in different contexts → **Consolidate** into SOUL.md, delete preference
- Not observed for 30 days → archive
- Over 10 active → consolidate or archive oldest

### Relationships

```markdown
# {Agent Name}
- **Role**: Their role
- **Relationship**: reports-to-me | i-report-to | peer
- **Status**: healthy | watch | action-needed

## Observations
| Date | Context | Type | Detail |
|------|---------|------|--------|

## Feedback Given
| Date | What | Result |
|------|------|--------|
```

- 3+ negative observations of same type → status `action-needed`, create performance review task
- Positive patterns worth noting? → Record

### Archive

- Over 20 items total? → Delete the least relevant
- Duplicates? → Delete
- Clearly never relevant again? → Delete
- Pattern resurfacing? → Reactivate: move back to long-term, add new entry
