---
name: account-security
description: Account security - MFA, sessions, recovery. Use when protecting user accounts.
---

# Account Security Guideline

## Tech Stack

* **Auth**: Better Auth
* **Framework**: Next.js
* **Database**: Neon (Postgres)

## Non-Negotiables

* Sensitive actions require step-up re-authentication (password or email OTP)
* Verified session state must be scoped, time-bound, never implicitly reused
* Session/device visibility and revocation must exist
* All security-sensitive actions must be server-enforced and auditable
* Account recovery must require step-up verification
* MFA via Better Auth (no custom implementation)

## Context

Account security is about giving users control over their own safety. Users should be able to see what's accessing their account, remove suspicious sessions, and understand when something unusual happens.

## Driving Questions

* Can users see all active sessions and revoke them?
* Is re-authentication required for all sensitive actions?
* What happens when an account is compromised?
* How does the recovery flow prevent social engineering?
* What security events trigger user notification?
