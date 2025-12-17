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
* **Explore beyond the spec**: identify gaps in automated verification and release safety.

## Tech Stack

* **CI**: GitHub Actions
* **Testing**: Bun test
* **Linting**: Biome
* **Platform**: Vercel

## Review Scope

### Delivery Gates and Completion

CI must block merges/deploys when failing:

* Code Quality: Biome lint/format, strict TS typecheck, unit + E2E tests, build
* Data Integrity: Migration integrity checks, no schema drift
* i18n: Missing translation keys fail build, `/en/*` redirects, hreflang correct
* Performance: Budget verification, Core Web Vitals thresholds, regression detection
* Security: CSP/HSTS/headers verified, CSRF protection tested
* Consent: Analytics/marketing consent gating verified

### Automation Requirement

**All gates above must be enforced by automated tests or mechanized checks (non-manual); manual verification does not satisfy release gates.**

### Configuration Gates

* Build/startup must fail-fast when required configuration/secrets are missing or invalid.

### Operability Gates

* Observability and alerting configured for critical anomalies
* Workflow dead-letter handling is operable and supports controlled replay

## Key Areas to Explore

* What release gates are missing or insufficient?
* Where does manual verification substitute for automation?
* How fast is the CI pipeline and what slows it down?
* What flaky tests exist and how do they affect reliability?
* How does the deployment process handle rollbacks?
* What post-deployment verification exists?
