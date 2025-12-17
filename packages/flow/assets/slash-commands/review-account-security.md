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

### Security Event Management

* Login attempts (success/failure) logged
* Password changes logged
* MFA enrollment/removal logged
* Session creation/revocation logged
* Suspicious activity detection
* Security event notifications

### Recovery Governance

* Account recovery flow secure
* Support-assisted recovery with strict audit logging
* Step-up verification for sensitive actions

## Verification Checklist

- [ ] Session/device visibility exists
- [ ] Session revocation works
- [ ] MFA management available
- [ ] Identity provider linking visible
- [ ] Security events logged and visible
- [ ] Recovery flow is secure and audited
