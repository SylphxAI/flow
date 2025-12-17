---
name: review
description: Review codebase by domain - usage: /review auth, /review billing, etc.
agent: coder
args:
  - name: domain
    description: Domain to review (auth, billing, security, etc.)
    required: true
---

# Review: $ARGS

Perform a focused review of the specified domain(s) in this codebase.

## Mandate

* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Deep, thorough analysis**: don't skim — understand root causes and systemic patterns.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify gaps, inefficiencies, and opportunities the checklist doesn't cover.

## Guidelines Reference

Based on the domain(s) requested, read the relevant guideline(s) below. You may read multiple guidelines in parallel if the review spans multiple domains.

| Domain | Guideline | Description |
|--------|-----------|-------------|
| **Identity & Auth** |||
| `auth` | `/guideline-auth` | Sign-in, SSO, passkeys, verification |
| `account-security` | `/guideline-account-security` | MFA, session management, account recovery |
| `privacy` | `/guideline-privacy` | Data handling, consent, GDPR/CCPA |
| **Billing & Revenue** |||
| `billing` | `/guideline-billing` | Stripe integration, webhooks, subscriptions |
| `pricing` | `/guideline-pricing` | Pricing models, tiers, feature gating |
| `ledger` | `/guideline-ledger` | Transaction records, audit trails, reconciliation |
| **Security** |||
| `security` | `/guideline-security` | OWASP, input validation, secrets management |
| `trust-safety` | `/guideline-trust-safety` | Abuse prevention, rate limiting, fraud |
| **Frontend & UX** |||
| `uiux` | `/guideline-uiux` | Design system, accessibility, interactions |
| `seo` | `/guideline-seo` | Meta tags, structured data, crawlability |
| `pwa` | `/guideline-pwa` | Service workers, offline, installability |
| `performance` | `/guideline-performance` | Core Web Vitals, bundle size, caching |
| `i18n` | `/guideline-i18n` | Localization, routing, hreflang |
| **Data** |||
| `database` | `/guideline-database` | Schema design, indexes, migrations |
| `data-architecture` | `/guideline-data-architecture` | Data models, relationships, integrity |
| `storage` | `/guideline-storage` | File uploads, CDN, blob storage |
| **Operations** |||
| `observability` | `/guideline-observability` | Logging, metrics, tracing, alerts |
| `operability` | `/guideline-operability` | Deployment, rollback, feature flags |
| `delivery` | `/guideline-delivery` | CI/CD, testing, release process |
| **Growth & Support** |||
| `growth` | `/guideline-growth` | Onboarding, activation, retention |
| `referral` | `/guideline-referral` | Referral programs, viral loops |
| `support` | `/guideline-support` | Help systems, tickets, documentation |
| **Admin & Discovery** |||
| `admin` | `/guideline-admin` | Admin panel, RBAC, config management |
| `discovery` | `/guideline-discovery` | Feature discovery, competitive analysis |
| **Code Quality** |||
| `code-quality` | `/guideline-code-quality` | Patterns, testing, maintainability |

## Execution

1. Parse the `$ARGS` to identify which domain(s) to review
2. Read the corresponding guideline file(s) — **read in parallel** if multiple domains
3. Use the guideline's Tech Stack, Non-Negotiables, Context, and Driving Questions to guide your review
4. Delegate workers to investigate different aspects simultaneously
5. Synthesize findings and implement fixes

## Multi-Domain Reviews

You can review multiple domains at once:
- `/review auth security` — Review both auth and security
- `/review billing pricing ledger` — Full revenue stack review
- `/review performance seo pwa` — Frontend optimization review

When reviewing multiple domains, look for **cross-cutting concerns** and **gaps between domains**.

## Output Format

```
## Review: [domain(s)]

### Critical Issues
- [ ] Issue description → Fix implemented

### Improvements Made
- ✓ What was fixed/improved

### Recommendations
- Future considerations (if can't fix now)
```
