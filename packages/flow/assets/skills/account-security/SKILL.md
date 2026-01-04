---
name: account-security
description: Account security - MFA, sessions, recovery. Use when protecting user accounts.
---

# Account Security Guideline

## Tech Stack

* **Auth**: Better Auth
* **Framework**: Next.js
* **Database**: Neon (Postgres)

## Re-authentication Flow

All sensitive operations require explicit re-authentication:

```
    Sensitive action triggered
                ↓
        Check verified session
                ↓
    Does the user have a password?
        ├─ Yes → Verify password
        └─ No  → Send email OTP (6 digits, 10-minute expiry)
                ↓
        Verification succeeds
                ↓
        Mark session as verified
                ↓
    Allow scoped, time-bound sensitive actions
    (2FA setup, email change, account deletion, etc.)
```

The verified state must:
- Have explicit scope
- Have explicit expiration
- Never be implicitly reused
- Never be shared across sessions or contexts

## Non-Negotiables

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
