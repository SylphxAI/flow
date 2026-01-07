---
name: auth
description: Authentication patterns - sign-in, SSO, passkeys, sessions. Use when implementing auth flows.
---

# Auth Guideline

## Tech Stack

* **Auth**: Better Auth
* **Framework**: Next.js (with Turbopack)
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* All authentication via Better Auth (no custom implementation)
* All authorization decisions must be server-enforced (no client-trust)
* Email verification required for high-impact capabilities
* Session token in httpOnly cookie only
* If SSO provider secrets are missing, hide the option (no broken UI)

## Context

Auth handles how users get sessions — sign-in, SSO, token issuance. Session management (visibility, revocation, step-up) lives in `account-security`.

Better Auth is the SSOT for authentication. No custom auth implementations.

## Driving Questions

* Is all auth handled by Better Auth?
* Are we building custom auth logic that Better Auth already provides?
* What's the sign-in experience for first-time vs returning users?
* What happens when a user loses access to their primary auth method?
