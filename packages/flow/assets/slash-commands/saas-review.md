---
name: saas-review
description: Full-stack SaaS product review - master orchestrator
agent: coder
---

# SaaS Product Review — Master Orchestration

## Mandate

* Perform a **complete end-to-end review** across product, engineering, security, compliance, growth, operations, and UX.
* **Delegate work to multiple workers; you act as the final gate to improve quality.**
* Deliverables must be stated as **standards, constraints, and acceptance criteria**.
* **Single-pass delivery**: no roadmap, no phasing, no deferrals; deliver an integrated outcome.

## Non-Negotiable Engineering Principles

* No workarounds, hacks, or TODOs.
* Feature-first with clean architecture; designed for easy extension; no "god files".
* Type-first, strict end-to-end correctness (**DB → API → UI**).
* Serverless-first; edge-compatible where feasible without sacrificing correctness, security, or observability.
* Mobile-first responsive design; desktop-second.
* Precise naming; remove dead/unused code.
* Upgrade all packages to latest stable; avoid deprecated patterns.

## Fixed Platform & Stack (Locked)

| Layer | Technology |
|-------|------------|
| Platform | Vercel |
| Framework | Next.js (SSR-first) |
| API | tRPC |
| i18n | next-intl |
| Database | Neon (Postgres) |
| ORM | Drizzle |
| Auth | better-auth |
| Payments | Stripe |
| Email | Resend |
| Observability | Sentry |
| Analytics | PostHog |
| Cache/Workflows | Upstash Redis + Workflows + QStash |
| Storage | Vercel Blob |
| Tooling | Bun, Biome, Bun test |
| Tag Management | GTM (marketing only) |

## Review Execution

### Phase 1: All Reviews (Parallel)

Spawn **all workers in parallel** using the Task tool. Each worker runs its slash command and returns findings.

**Delegation pattern:**
```
Use Task tool with subagent_type: "Coder" for each worker.
Spawn ALL 8 workers in a single message (parallel execution).
Each worker prompt: "Run /{command} and return findings."
```

| Worker | Command | Focus |
|--------|---------|-------|
| Billing | `/saas-billing` | Stripe, webhooks, pricing governance, ledger |
| Auth | `/saas-auth` | SSO, passkeys, verification, sessions, account security |
| i18n | `/saas-i18n` | Locales, routing, canonicalization, hreflang |
| Platform | `/saas-platform` | Design system, SEO, PWA, performance, a11y |
| Security | `/saas-security` | OWASP, privacy, consent, observability, operability |
| Growth | `/saas-growth` | Onboarding, referral, retention, guidance |
| Admin | `/saas-admin` | RBAC, bootstrap, config, feature flags, ops tooling |
| Discovery | `/saas-discovery` | Feature opportunities, pricing optimization, competitive research |

### Phase 2: Final Gate (You)

Synthesize all domain findings and discovery insights:

1. **Aggregate findings** from all workers
2. **Resolve conflicts** between domains
3. **Verify delivery gates** (below)
4. **Produce integrated report** with prioritized actions

## Architecture Foundations (All Domains)

These principles apply across all domain reviews:

### Server Enforcement

* All authorization/entitlements are **server-enforced**; no client-trust.
* **Server-truth is authoritative**: UI state must never contradict server-truth.

### Consistency Model

* For billing, entitlements, ledger, admin privileges, and security posture: define explicit consistency model (source-of-truth, delay windows, retry handling).

### Drizzle Migrations

* Migration files must exist, be complete, and be committed.
* Deterministic, reproducible, environment-safe; linear/auditable history; no drift.
* CI must fail if schema changes are not represented by migrations.

### Vercel Blob Upload Governance

* All uploads must be **intent-based and server-verified**.
* Client uploads via short-lived, server-issued authorization, then calls server finalize endpoint.
* Server validates Blob URL/key ownership and matches against originating intent before attaching to any resource.
* Support safe retries and idempotent finalize; expired/abandoned intents must be cleanable and auditable.

### Auditability

* For any high-value mutation: who/when/why, before/after state, and correlation to triggering request/job/webhook must be recorded and queryable.

## Delivery Gates (Release-Blocking)

CI must block merges/deploys when failing:

### Code Quality
- [ ] Biome lint/format passes
- [ ] Strict TypeScript typecheck passes
- [ ] Unit + E2E tests pass (Bun test)
- [ ] Build succeeds

### Data Integrity
- [ ] Migration integrity checks pass
- [ ] No schema drift

### Internationalization
- [ ] Missing translation keys fail build
- [ ] `/en/*` returns 301 redirect
- [ ] hreflang/x-default correct
- [ ] Sitemap contains only true localized pages

### Performance
- [ ] Performance budgets enforced
- [ ] Core Web Vitals within targets
- [ ] Regression detection active

### Security
- [ ] CSP/HSTS/security headers verified
- [ ] CSRF protection tested
- [ ] Consent gates analytics/marketing

### Operability
- [ ] Observability configured for critical paths
- [ ] Alerting defined for anomalies
- [ ] DLQ is operable with safe replay

### Release Criteria
- [ ] Required configuration fails fast if missing
- [ ] All domain gates pass
- [ ] No TODOs/hacks/workarounds/dead code

## Output Format

### Executive Summary
- Overall health assessment
- Critical blockers (must fix before release)
- High-priority improvements

### Domain Reports
For each domain, summarize:
- Compliance status (pass/fail with details)
- Improvement opportunities discovered
- Recommended actions with priority

### Strategic Opportunities
From discovery phase:
- Feature roadmap (prioritized)
- Pricing optimizations
- Competitive positioning

### Delivery Gate Status
Checklist with pass/fail for each gate

## Completion Criteria

Complete only when:
- [ ] All 8 workers finished (domains + discovery)
- [ ] All findings synthesized
- [ ] Delivery gates verified
- [ ] Integrated report produced
- [ ] No deferrals — everything addressed in single pass
