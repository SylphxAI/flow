---
name: continue
description: Continue incomplete work - find gaps, finish features, fix what's broken
agent: coder
---

# Continue

Find what's incomplete. Finish it.

## Mandate

- **Think, don't checklist.** Understand the project. What would "done" look like?
- **Delegate workers** for parallel research. You synthesize and verify.
- **Fix, don't report.** Implement solutions directly.

## Execution

1. **Understand** — Read README, entry points, core flows

2. **Find gaps** — Not just TODO/FIXME, but:
   - Implicit broken (empty catch, happy path only, no logs)
   - Missing entirely (referenced but not implemented)

3. **Invoke skills** — Before fixing, load guidelines for relevant domains:
   ```
   auth, account-security, billing, security, database, performance, observability...
   ```
   Skills contain: tech stack decisions, non-negotiables, patterns, anti-patterns.

4. **Fix by impact** — What blocks users? Causes data loss? Fix those first. Fix completely.

5. **Loop** — New gaps from fixes? → `/continue` again

## Output

```
## Found
[What's incomplete and why]

## Fixed
[Changes made]

## Remains
[Needs human decision]

## Next
[/continue | done]
```
