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

### SEO/i18n/Canonicalization Verification (Specific Tests Required)

* `/en/*` non-existence: must permanently redirect to non-prefixed equivalent
* hreflang/x-default: all pages must have correct hreflang tags including x-default
* Sitemap validation: sitemap.xml must contain only true localized variants (no duplicate content URLs)
* UGC canonical redirects: locale-prefixed UGC URLs must redirect to canonical (content-language-based) URL
* Locale routing invariants: unknown locales handled gracefully, no 500 errors

### Security Verification (Specific Tests Required)

* CSP header: present and correctly configured (no unsafe-inline where avoidable)
* HSTS header: present with appropriate max-age
* X-Frame-Options / X-Content-Type-Options: present
* CSRF protection: tokens validated on state-changing requests

### Consent Gating Verification (Specific Tests Required)

* Analytics scripts: must not load before consent
* Marketing tags (GTM, Google Ads): must not fire before consent
* Newsletter eligibility: must respect user preferences
* Conversion tracking: must follow consent state

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
