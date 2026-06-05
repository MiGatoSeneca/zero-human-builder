---
name: company-setup
description: Founding session — work WITH the human founder to define and personalize the company's core documents (manifesto, mission, vision, values, objectives) and propose the first hires. Run this the FIRST time the CEO boots (the manifesto is marked DRAFT), or any time the founder wants to revisit the company's foundations.
---

# Company Setup — Founding Session

This is the CEO's first real job: sit down with the founder and **co-create the company's foundations**, then write them down. The `zero-human-init` generator only captured the company name and a one-liner — everything else in `MANIFESTO.md` and the objectives is a **DRAFT** waiting for this session.

Run this interactively with the founder. Do not generate the final docs silently — **synthesize, then confirm** before writing.

## When to run

- **First boot**: if `../../shared/organization/MANIFESTO.md` contains a `> ⚠️ DRAFT` notice → run this now, it's your top task.
- **On request**: whenever the founder wants to revisit mission, vision, values, or objectives.

## Procedure

### 1. Read what exists

Read `MANIFESTO.md`, `STRUCTURE.md`, the company objectives (`organization/drive/objectives/monthly.md`), your own `SOUL.md`. Note what's still a placeholder/DRAFT.

### 2. Interview the founder

Ask in small batches (don't dump 10 questions at once). Cover:

- **What we do** — confirm/refine the one-liner. What's the product, concretely?
- **Market & customer** — who is this for? What segment, what context?
- **Problem** — what painful problem are we solving? Why now?
- **Differentiation** — why us? What makes this different from the obvious alternatives?
- **Mission** — the change we exist to create (1-2 sentences).
- **Vision** — the world we're building toward.
- **Values** — the manifesto ships with a default set (Make noise, Be different, Impact is north star, Actions not words, Question everything, Team over individual, Know what you are). Ask: keep them? edit any? add one that's specific to this company?
- **First 3-month objective** — one measurable outcome with a number and a deadline.
- **First hires** — what roles does the founder imagine needing first? (Don't create them now — just capture intent.)

Use judgment: if the founder gives a rich answer, don't re-ask. Keep it conversational.

### 3. Synthesize and confirm

Draft the personalized text for: Mission, Vision, "What is {company}", and the values (kept/edited). Present it to the founder in the chat. Iterate until they approve. **Only write after approval.**

### 4. Write the docs

- Update `../../shared/organization/MANIFESTO.md`: fill Mission, Vision, the "What is" section, adjust values as agreed, and **remove the `> ⚠️ DRAFT` notice line**.
- Update `organization/drive/objectives/monthly.md` with the first company objective (metric, target, deadline, key results).
- Update your own `drive/objectives/current.md` with your CEO objective tracing to the company objective.
- If the founder's input reveals a sharper CEO personality, refine `SOUL.md` accordingly.
- Update `STRUCTURE.md` only if the founder defined concrete first roles (otherwise leave the team as just CEO).

### 5. Propose first hires

Based on the captured intent, list the first agents you'd create (role, why, when), as a recommendation for the founder. On approval, use the `agent-creation` skill — one agent at a time.

### 6. Log it

Write a short summary to `memory/short-term/YYYY-MM-DD-company-setup.md` so the heartbeat consolidates the founding decisions into long-term memory.

## Done when

- [ ] MANIFESTO.md personalized, DRAFT notice removed
- [ ] First company objective written
- [ ] CEO objective written
- [ ] First hires proposed to the founder
- [ ] Session summary in short-term memory
