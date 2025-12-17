---
name: saas-auth
description: SaaS identity review - SSO, passkeys, verification, account security
agent: coder
---

# Identity & Account Security Review

## Scope

Review identity systems: authentication methods, SSO providers, passkeys/WebAuthn, verification flows, session management, and account security surfaces.

## Specification

### Identity Providers (SSO)

* SSO providers (minimum): **Google, Apple, Facebook, Microsoft, GitHub** (prioritize by audience).
* If provider env/secrets are missing, **hide** the login option (no broken/disabled UI).
* Allow linking multiple providers and safe unlinking; server-enforced and abuse-protected.

### Passkeys (WebAuthn)

* Passkeys are first-class with secure enrollment/usage/recovery.
* Must support cross-device authentication where platform allows.

### Verification

* **Email verification is mandatory** baseline for high-impact capabilities.
* **Phone verification is optional** and used as risk-based step-up (anti-abuse, higher-trust flows, recovery); consent-aware and data-minimizing.

### Membership and Entitlements

* Membership is entitlement-driven and server-enforced.
* All authorization/entitlements are **server-enforced**; no client-trust.

### Account Security Surface

* Provide a dedicated **Account Security** surface.
* **Minimum acceptance criteria**:
  * Session/device visibility and revocation
  * MFA/passkey management
  * Linked identity provider management
  * Key security event visibility (and export where applicable)
* All server-enforced and auditable.

### Session Management

* Session/device visibility + revocation available to user.
* Security event visibility with clear audit trail.
* Recovery governance (including support-assisted recovery) with strict audit logging.
* Step-up authentication for sensitive actions.

### Password Security

* Password UX: masked + temporary reveal option.
* No plaintext passwords in logs/returns/storage/telemetry.
* MFA required for Admin/SUPER_ADMIN; step-up for high-risk actions.

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Onboarding friction**: Is sign-up flow optimized? Too many steps? Missing social providers for target market?
* **Security vs UX balance**: Are step-up challenges appropriate? Too frequent? Too rare?
* **Recovery flows**: Is account recovery secure yet accessible? Support burden from lockouts?
* **Modern auth**: Are passkeys properly promoted? Is passwordless an option?
* **Trust signals**: Are verified badges shown? Does verification unlock features appropriately?

## Domain Gates

* [ ] All SSO providers working (or hidden if unconfigured)
* [ ] Passkey enrollment/usage/recovery tested
* [ ] Email verification enforced for high-impact actions
* [ ] Account security surface complete (sessions, MFA, providers, events)
* [ ] Session revocation works correctly
* [ ] No client-trust for authorization decisions
* [ ] Step-up auth for sensitive actions
* [ ] No plaintext passwords anywhere
