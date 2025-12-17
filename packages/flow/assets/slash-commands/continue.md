---
name: continue
description: Continue incomplete work - find gaps, finish features, fix what's broken
agent: coder
---

# Continue

Find what's incomplete. Finish it.

## Mandate

* **Think, don't checklist.** Understand the project first. What is it trying to do? What would "done" look like?
* **Delegate workers** for parallel research. You synthesize and verify.
* **Fix, don't report.** Implement solutions directly.
* **One pass.** No deferrals. Complete each fix fully.

## How to Find Incomplete Work

Don't grep for TODO and call it done. Incomplete work hides in:

**What's explicitly unfinished** — Yes, scan for TODO/FIXME/HACK. But ask: why are they there? What was the person avoiding?

**What's implicitly broken** — Code that "works" but:
- Fails silently (empty catch blocks, swallowed errors)
- Works only in happy path (no validation, no edge cases)
- Works but confuses users (unclear errors, missing feedback)
- Works but can't be debugged (no logs, no context)

**What's missing entirely** — Features referenced but not implemented. UI that leads nowhere. Promises in docs that code doesn't deliver.

## The Real Test

For each part of the system, ask:

> "If I were a user trying to accomplish their goal, where would I get stuck?"

> "If this broke at 3am, could someone figure out why?"

> "If requirements changed tomorrow, what would be painful to modify?"

> "If we had 100x traffic, what would fall over first?"

These questions reveal incompleteness that checklists miss.

## Execution

1. **Understand the project** — Read README, main entry points, core flows. What is this thing supposed to do?

2. **Walk the critical paths** — Trace actual user journeys through code. Where does the path get uncertain, error-prone, or incomplete?

3. **Find the gaps** — Not just TODOs, but:
   - Dead ends (code that starts something but doesn't finish)
   - Weak spots (minimal implementation that will break under pressure)
   - Missing pieces (what's referenced but doesn't exist)

4. **Prioritize by impact** — What blocks users? What causes data loss? What makes debugging impossible? Fix those first.

5. **Fix completely** — Don't patch. Understand root cause. Implement proper solution. Test it works.

## When to Go Deeper

If issues cluster in a domain, invoke `/review <domain>` for thorough analysis:

```
/review auth        — Auth flow issues
/review security    — Validation gaps, injection risks
/review database    — Schema issues, missing indexes
/review performance — Slow paths, bundle bloat
```

Full list: auth, account-security, privacy, billing, pricing, ledger, security, trust-safety, uiux, seo, pwa, performance, i18n, database, data-architecture, storage, observability, operability, delivery, growth, referral, support, admin, discovery, code-quality

## Loop

After fixing, ask: "Did my fixes introduce new gaps? Did fixing X reveal Y was also broken?"

If yes → continue. If no Critical/High issues remain → done.

## Output

```
## What I Found

[Describe the gaps discovered — not a checklist, but an understanding of what's incomplete and why]

## What I Fixed

- [Description of fix and why it matters]

## What Remains

- [Issues that need human decision or are blocked]

## Next

[/continue again | /review <domain> | done]
```
