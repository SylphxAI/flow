---
name: review-account-security
description: Review account security - sessions, devices, MFA, security events
agent: coder
---

# Account Security Review

## Mandate

* Perform a **deep, thorough review** of account security in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for user safety and threat detection.

## Tech Stack

* **Auth**: better-auth
* **Framework**: Next.js

## Review Scope

### Membership and Account Security

* Membership is entitlement-driven and server-enforced.
* Provide a dedicated **Account Security** surface.
* **Account Security minimum acceptance**:
  * Session/device visibility and revocation
  * MFA/passkey management
  * Linked identity provider management
  * Key security event visibility (and export where applicable)
  * All server-enforced and auditable

### Recovery Governance

* Account recovery flow secure
* Support-assisted recovery with strict audit logging
* Step-up verification for sensitive actions

## Key Areas to Explore

* What visibility do users have into their active sessions and devices?
* How robust is the MFA implementation and enrollment flow?
* What security events are logged and how accessible are they to users?
* How does the account recovery flow prevent social engineering attacks?
* What step-up authentication exists for sensitive actions?
* How are compromised accounts detected and handled?
