---
name: review-delivery
description: Review delivery gates - release blocking checks, verification
agent: coder
---

# Delivery Gates Review

## Mandate

* Perform a **deep, thorough review** of delivery gates in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Delivery Gates and Completion

CI must block merges/deploys when failing:

#### Code Quality Gates
- [ ] Biome lint/format passes
- [ ] Strict TS typecheck passes
- [ ] Unit + E2E tests pass (Bun test)
- [ ] Build succeeds

#### Data Integrity Gates
- [ ] Migration integrity checks pass
- [ ] No schema drift

#### i18n Gates
- [ ] Missing translation keys fail build
- [ ] `/en/*` returns 301 redirect
- [ ] hreflang/x-default correct
- [ ] Sitemap contains only true variants

#### Performance Gates
- [ ] Performance budget verification for key journeys
- [ ] Core Web Vitals within thresholds
- [ ] Release-blocking regression detection

#### Security Gates
- [ ] CSP/HSTS/security headers verified
- [ ] CSRF protection tested

#### Consent Gates
- [ ] Analytics/marketing consent gating verified
- [ ] Newsletter eligibility and firing rules tested

### Automation Requirement

**All gates above must be enforced by automated tests or mechanized checks (non-manual); manual verification does not satisfy release gates.**

### Configuration Gates

* Build/startup must fail-fast when required configuration/secrets are missing or invalid for the target environment.

### Operability Gates

* Observability and alerting configured for critical anomalies
* Workflow dead-letter handling is operable, visible, and supports controlled replay

## Verification Checklist

- [ ] All gates automated (no manual)
- [ ] CI blocks on failures
- [ ] Config fail-fast works
- [ ] Operability gates met
- [ ] No TODOs/hacks/workarounds
- [ ] No dead/unused code
