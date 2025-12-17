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
* **Explore beyond the spec**: identify improvements for security, usability, and reliability.

## Tech Stack

* **Auth**: better-auth
* **Framework**: Next.js

## Review Scope

### Identity, Verification, and Sign-in

* SSO providers (minimum): **Google, Apple, Facebook, Microsoft, GitHub** (prioritize by audience).
* If provider env/secrets are missing, **hide** the login option (no broken/disabled UI).
* Allow linking multiple providers and safe unlinking; server-enforced and abuse-protected.
* Passkeys (WebAuthn) are first-class with secure enrollment/usage/recovery.

### Verification Requirements

* **Email verification is mandatory** baseline for high-impact capabilities.
* **Phone verification is optional** and used as risk-based step-up (anti-abuse, higher-trust flows, recovery); consent-aware and data-minimizing.

## Key Areas to Explore

* How does the current auth implementation compare to best practices?
* What security vulnerabilities exist in the sign-in flows?
* How can the user experience be improved while maintaining security?
* What edge cases are not handled (account recovery, provider outages, etc.)?
* How does session management handle concurrent devices?
