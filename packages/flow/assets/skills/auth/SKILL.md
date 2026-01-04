---
name: auth
description: Authentication patterns - sign-in, SSO, passkeys, sessions. Use when implementing auth flows.
---

# Auth Guideline

## Tech Stack

* **Auth**: Better Auth
* **Framework**: Next.js
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* All authorization decisions must be server-enforced (no client-trust)
* Email verification required for high-impact capabilities
* If SSO provider secrets are missing, hide the option (no broken UI)
* Session management via Better Auth (no custom implementation)

## Auth Flow

```
User initiates sign-in
        ↓
Better Auth handles provider/credentials
        ↓
Session created server-side
        ↓
Session token in httpOnly cookie
        ↓
All requests validated server-side
```

## Context

Authentication is the front door to every user's data. It needs to be both secure and frictionless. Users abandon products with painful sign-in flows, but weak auth leads to compromised accounts.

Better Auth is the SSOT for authentication. No custom auth implementations.

## Driving Questions

* Is all auth handled by Better Auth?
* Are we building custom auth logic that Better Auth already provides?
* What's the sign-in experience for first-time vs returning users?
* What happens when a user loses access to their primary auth method?
* Where is auth complexity hiding bugs or security issues?
