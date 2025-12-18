---
name: continue
description: Iterate toward production-grade - find gaps from every angle, fix completely
agent: coder
---

# Continue

**Goal: Production-grade, not MVP.** Perfect architecture. Perfect naming. No workarounds.

## Think From Every Perspective

Simulate being each persona. What's missing? What's frustrating? What breaks?

- **New user** — First impression, onboarding, can they succeed without docs?
- **Power user** — Edge cases, advanced flows, what's limiting them?
- **Developer** — Is the code maintainable? Clear naming? Good abstractions?
- **Admin** — Can they manage users, debug issues, see what's happening?
- **Attacker** — Where are the security holes? What can be exploited?
- **3am oncall** — If it breaks, can they diagnose it? Are there logs? Alerts?

Don't checklist. Actually **inhabit** each perspective and feel the friction.

## Delegate for Collective Wisdom

Spawn multiple agents in parallel to ultrathink from different angles:
- One agent: user experience gaps
- One agent: security & trust gaps
- One agent: architecture & code quality gaps
- One agent: operability & observability gaps

You are the **Final Gate**. Synthesize their findings. Verify. Decide. Execute.

## Invoke Skills

Before fixing, load guidelines for relevant domains. Skills contain tech stack decisions, non-negotiables, patterns.

## Fix Completely

No workarounds. No "good enough". Each fix should be the **final implementation** — production-ready, battle-tested quality.

## Loop

After fixing: Are there new gaps? Did fixing X reveal Y was also broken?

If yes → `/continue` again. Keep iterating until production-grade.

## Output

```
## Perspectives Explored
[Which personas, what gaps found from each]

## Fixed
[Changes made and why they're production-ready]

## Remains
[Needs human decision or blocked]

## Next
[/continue | production-ready]
```
