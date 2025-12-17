---
name: review-auth
description: Review authentication - SSO providers, passkeys, verification, sign-in
agent: coder
---

# Authentication Review

## Mandate

* Perform a **deep, thorough review** of authentication in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Identity, Verification, and Sign-in

* SSO providers (minimum): **Google, Apple, Facebook, Microsoft, GitHub** (prioritize by audience).
* If provider env/secrets are missing, **hide** the login option (no broken/disabled UI).
* Allow linking multiple providers and safe unlinking; server-enforced and abuse-protected.
* Passkeys (WebAuthn) are first-class with secure enrollment/usage/recovery.

### Verification Requirements

* **Email verification is mandatory** baseline for high-impact capabilities.
* **Phone verification is optional** and used as risk-based step-up (anti-abuse, higher-trust flows, recovery); consent-aware and data-minimizing.

### Authentication Best Practices

* Secure session management
* Token rotation and expiry
* Brute force protection
* Account enumeration prevention
* Secure password reset flow
* Remember me functionality (secure)

## Verification Checklist

- [ ] All SSO providers implemented
- [ ] Missing provider secrets hide UI option
- [ ] Multi-provider linking works safely
- [ ] Passkeys (WebAuthn) supported
- [ ] Email verification enforced
- [ ] Phone verification optional/step-up
- [ ] Session management secure
