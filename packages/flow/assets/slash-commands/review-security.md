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
* **Explore beyond the spec**: identify vulnerabilities and hardening opportunities.

## Tech Stack

* **Rate Limiting**: Upstash Redis
* **Framework**: Next.js
* **Platform**: Vercel

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

### Configuration and Secrets Governance

* Required configuration must fail-fast at build/startup
* Strict environment isolation (dev/stage/prod)
* Rotation and incident remediation posture must be auditable and exercisable

## Key Areas to Explore

* What OWASP Top 10 vulnerabilities exist in the current implementation?
* How comprehensive are the security headers (CSP, HSTS, etc.)?
* Where is rate limiting missing or insufficient?
* How are secrets managed and what is the rotation strategy?
* What attack vectors exist for the authentication flows?
* How does the system detect and respond to security incidents?
