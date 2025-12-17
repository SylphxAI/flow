---
name: review-security
description: Review security - OWASP, CSP/HSTS, CSRF, anti-bot, rate limiting
agent: coder
---

# Security Review

## Mandate

* Perform a **deep, thorough review** of security controls in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Security Baseline

* OWASP Top 10:2025 taxonomy; OWASP ASVS (L2/L3) verification baseline.
* Password UX masked + temporary reveal; no plaintext passwords in logs/returns/storage/telemetry.
* MFA for Admin/SUPER_ADMIN; step-up for high-risk.
* Risk-based anti-bot for auth and high-cost endpoints; integrate rate limits + consent gating.

### Baseline Controls

* CSP/HSTS/headers
* CSRF where applicable
* Upstash-backed rate limiting
* PII scrubbing
* Supply-chain hygiene
* Measurable security

### Verification Requirements

* **Security controls must be verifiable**: CSP/HSTS/security headers and CSRF (where applicable) must be covered by automated checks or security tests and included in release gates.

### Configuration and Secrets Governance

* Required configuration must fail-fast at build/startup
* Strict environment isolation (dev/stage/prod)
* Rotation and incident remediation posture must be auditable and exercisable

## Verification Checklist

- [ ] OWASP Top 10:2025 addressed
- [ ] CSP headers configured
- [ ] HSTS enabled
- [ ] CSRF protection where needed
- [ ] Rate limiting implemented
- [ ] No plaintext passwords anywhere
- [ ] MFA for admin roles
- [ ] Security headers tested in CI
