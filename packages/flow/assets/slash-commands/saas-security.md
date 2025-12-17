---
name: saas-security
description: SaaS security review - OWASP, privacy, consent, observability, operability
agent: coder
---

# Security, Privacy & Compliance Review

## Scope

Review security posture, privacy compliance, consent governance, observability systems, and operational readiness.

## Specification

### Security Baseline

* **OWASP Top 10:2025** taxonomy awareness and mitigation.
* **OWASP ASVS** (L2/L3) verification baseline.
* Baseline controls:
  * CSP (Content Security Policy) properly configured
  * HSTS with appropriate max-age
  * Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  * CSRF protection where applicable
  * Upstash-backed rate limiting
  * Supply-chain hygiene (dependency audits)
* **Security controls must be verifiable**: CSP/HSTS/security headers and CSRF must be covered by automated checks or security tests and included in release gates.
* Risk-based anti-bot for auth and high-cost endpoints; integrate rate limits + consent gating.

### Consent Governance (Release-Blocking)

* **Behavioral consistency is required**: policy and disclosures must match actual behavior across UI, data handling, logging/observability, analytics, support operations, and marketing tags; mismatches are release-blocking.
* Analytics (PostHog) and marketing/newsletter communications (Resend) must be governed by consent and user preferences.
* Marketing tags (including GTM and Google Ads) must not load or fire without appropriate consent.
* Without consent, tracking and marketing sends must not occur, except for strictly necessary service communications.
* Event schemas and attributes must follow data minimization, with explicit PII classification and handling rules.

### Marketing Attribution (Hard Requirement)

* GTM may be used **only** for marketing tags and attribution; it must not become the primary product analytics system (PostHog remains the product analytics source).
* Conversions representing monetary value or entitlement changes must be **server-truth aligned**, **idempotent**, and **deduplicated**; client-side tags may exist for attribution but must not become the authoritative source of billing/entitlement truth.

### PII and Sensitive Data (Hard Requirement)

* PII rules apply to logs, Sentry, PostHog, support tooling, email systems, and marketing tags/conversion payloads.
* A consistent scrubbing/redaction standard must exist, and must be covered by automated tests to prevent leakage to third parties.

### Data Lifecycle

* Define deletion/deactivation semantics and deletion propagation.
* Export capability where applicable.
* DR/backup posture aligned with retention.
* **Define data classification, retention periods, deletion propagation to third-party processors, and explicit exceptions** (legal/tax/anti-fraud).
* External disclosures must match actual behavior.

### Async/Workflows Governance (Hard Requirement)

* Define idempotency and deduplication posture.
* Define controlled retries/backoff.
* **Dead-letter handling must exist and be observable and operable**.
* **Safe replay must be supported**.
* Side-effects (email/billing/ledger/entitlements) must be governed such that they are either proven effectively-once or safely re-entrant without duplicated economic/security consequences.

### Observability and Alerting (Hard Requirement)

* Structured logs and correlation IDs must exist end-to-end (request/job/webhook) with consistent traceability.
* Define critical-path SLO/SLI posture.
* Define actionable alerts for: webhook failures, ledger/entitlement drift, authentication attacks, abuse spikes, and drift detection.

### Configuration and Secrets

* Required configuration must fail-fast at build/startup.
* Strict environment isolation (dev/stage/prod).
* Rotation and incident remediation posture must be auditable and exercisable.

### Drift Detection (Hard Requirement)

* Drift alerts must have a defined remediation playbook (automated fix or operator workflow).
* Each remediation must be auditable and support post-incident traceability.

### Abuse/Fraud Posture

* Define prevention and enforcement measures for referral/UGC/support abuse.
* Risk signals trigger protective actions and step-up verification where appropriate.

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Attack surface reduction**: Are there unused endpoints? Overly permissive APIs?
* **Monitoring gaps**: What security events aren't being tracked? Alert fatigue issues?
* **Compliance readiness**: Is SOC2/GDPR/CCPA posture documented? Audit-ready?
* **Incident response**: Is there a playbook? Has it been tested?
* **Third-party risk**: Are vendor dependencies assessed? Data processing agreements in place?
* **Security UX**: Are security features discoverable? Do they create unnecessary friction?

## Domain Gates

* [ ] CSP/HSTS/security headers configured and tested
* [ ] CSRF protection implemented where needed
* [ ] Rate limiting active on sensitive endpoints
* [ ] Consent governs all analytics/marketing
* [ ] PII scrubbing verified (logs, Sentry, PostHog)
* [ ] Data deletion propagates to third parties
* [ ] DLQ exists and is operable
* [ ] Correlation IDs present end-to-end
* [ ] Critical alerts defined and tested
* [ ] Config fails fast on missing required values
* [ ] Drift detection has remediation playbook
