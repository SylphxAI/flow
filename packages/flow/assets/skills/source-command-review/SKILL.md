---
name: "source-command-review"
description: "Review codebase by topic - /review <what to review>"
---

# source-command-review

Use this skill when the user asks to run the migrated source command `review`.

## Command Template

# Review: $ARGS

## Mandate

* **Understand first.** Absorb the principles, then apply judgment.
* **Think like the failure mode.** Security? Think like an attacker. Performance? Think like a slow network. Auth? Think like a confused user.
* **Delegate workers** for parallel research. You synthesize and verify.
* **Fix, don't report.** Implement solutions directly.

## Skills

Domain knowledge is available through Skills that auto-activate based on context:

auth, account-security, privacy, billing, pricing, ledger, security, trust-safety, uiux, seo, pwa, performance, i18n, database, data-architecture, storage, observability, operability, delivery, growth, referral, support, admin, discovery, code-quality

You don't need to invoke them — they activate when relevant.

## Output

```
## Review: [topic]

### Understanding
[How this is implemented. Architecture, choices, tradeoffs.]

### Issues
[What's wrong and why it matters]

### Fixed
[Changes made]

### Remaining
[Needs human decision or blocked]
```
