---
name: review
description: Review codebase by topic - /review <what to review>
args:
  - name: topic
    description: What to review (e.g., auth, security, "the login flow", "why it's slow")
    required: true
---

# Review: $ARGS

## Mandate

- **Think like the failure mode.** Security → attacker. Performance → slow network. Auth → confused user.
- **Delegate workers** for parallel research. You synthesize and verify.
- **Fix, don't report.** Implement solutions directly.

## Execution

1. **Invoke skills** — Load guidelines for relevant domains:
   ```
   abuse-prevention, account-security, admin, appsec, auth, billing,
   code-quality, competitive-analysis, data-modeling, database, delivery,
   deployments, growth, i18n, ledger, observability, performance, pricing,
   privacy, pwa, referral, seo, storage, support, uiux
   ```
   Skills contain: tech stack decisions, non-negotiables, driving questions.

2. **Understand** — How is this implemented? Architecture, choices, tradeoffs.

3. **Find issues** — What violates the guidelines? What's wrong and why it matters?

4. **Fix** — Implement solutions directly.

## Output

```
## Review: [topic]

### Understanding
[Architecture, choices, tradeoffs]

### Issues
[What's wrong and why]

### Fixed
[Changes made]

### Remains
[Needs human decision]
```
