---
name: guideline-auth
description: Guideline: authentication - sign-in, SSO, passkeys, verification
agent: coder
---

# Auth Guideline

## Tech Stack

* **Auth**: better-auth
* **Framework**: Next.js

## Non-Negotiables

* All authorization decisions must be server-enforced (no client-trust)
* Email verification required for high-impact capabilities
* If SSO provider secrets are missing, hide the option (no broken UI)

## Context

Authentication is the front door to every user's data. It needs to be both secure and frictionless — a difficult balance. Users abandon products with painful sign-in flows, but weak auth leads to compromised accounts.

Consider the entire auth journey: first sign-up, return visits, account linking, recovery flows. Where is there unnecessary friction? Where are there security gaps? What would make auth both more secure AND easier?

## Driving Questions

* What's the sign-in experience for a first-time user vs. returning user?
* Where do users get stuck or abandon the auth flow?
* What happens when a user loses access to their primary auth method?
* How does the system handle auth provider outages gracefully?
* What would passwordless-first auth look like here?
* Where is auth complexity hiding bugs or security issues?
