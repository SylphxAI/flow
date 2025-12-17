---
name: review
description: Review codebase by domain - /review <what to review>
agent: coder
args:
  - name: topic
    description: What to review (e.g., auth, security, billing, "the login flow", "why it's slow")
    required: true
---

# Review: $ARGS

## Mandate

* **Understand first.** Don't treat guidelines as checklists — absorb the principles, then apply judgment.
* **Think like the failure mode.** Security? Think like an attacker. Performance? Think like a slow network. Auth? Think like a confused user.
* **Delegate workers** for parallel research. You synthesize and verify.
* **Fix, don't report.** Implement solutions directly.

## Available Guidelines

Read relevant guideline(s) based on what you're reviewing:

| Guideline | Domain |
|-----------|--------|
| `/guideline-auth` | Sign-in, SSO, passkeys, verification |
| `/guideline-account-security` | MFA, sessions, account recovery |
| `/guideline-privacy` | Data handling, consent, GDPR/CCPA |
| `/guideline-billing` | Stripe, webhooks, subscriptions |
| `/guideline-pricing` | Pricing models, tiers, feature gating |
| `/guideline-ledger` | Transactions, audit trails, reconciliation |
| `/guideline-security` | OWASP, validation, secrets |
| `/guideline-trust-safety` | Abuse prevention, rate limiting, fraud |
| `/guideline-uiux` | Design system, accessibility |
| `/guideline-seo` | Meta tags, structured data, crawlability |
| `/guideline-pwa` | Service workers, offline, installability |
| `/guideline-performance` | Core Web Vitals, bundle size, caching |
| `/guideline-i18n` | Localization, routing, hreflang |
| `/guideline-database` | Schema, indexes, migrations |
| `/guideline-data-architecture` | Data models, relationships, integrity |
| `/guideline-storage` | File uploads, CDN, blob storage |
| `/guideline-observability` | Logging, metrics, tracing, alerts |
| `/guideline-operability` | Deployment, rollback, feature flags |
| `/guideline-delivery` | CI/CD, testing, release process |
| `/guideline-growth` | Onboarding, activation, retention |
| `/guideline-referral` | Referral programs, viral loops |
| `/guideline-support` | Help systems, tickets, documentation |
| `/guideline-admin` | Admin panel, RBAC, config |
| `/guideline-discovery` | Feature discovery, competitive analysis |
| `/guideline-code-quality` | Patterns, testing, maintainability |

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
