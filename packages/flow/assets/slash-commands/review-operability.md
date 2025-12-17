---
name: review-operability
description: Review operability - async workflows, DLQ, retries, drift detection
agent: coder
---

# Operability Review

## Mandate

* Perform a **deep, thorough review** of operability in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify operational risks and reliability improvements.

## Tech Stack

* **Workflows**: Upstash Workflows + QStash
* **Cache**: Upstash Redis
* **Platform**: Vercel

## Review Scope

### Async/Workflows Governance (Hard Requirement)

* Define idempotency and deduplication posture
* Define controlled retries/backoff
* **Dead-letter handling must exist and be observable and operable**
* **Safe replay must be supported**
* Side-effects (email/billing/ledger/entitlements) must be governed such that they are either proven effectively-once or safely re-entrant

### Drift Detection (Hard Requirement)

* Drift alerts must have a defined remediation playbook (automated fix or operator workflow)
* Each remediation must be auditable and support post-incident traceability

### Release Safety

* Define safe rollout posture with backward compatibility
* Rollback expectations for billing/ledger/auth changes

## Key Areas to Explore

* How does the system handle job failures and retries?
* What happens to messages that fail permanently (DLQ)?
* How are operators notified of and able to resolve stuck workflows?
* What drift can occur between systems and how is it detected?
* How safe is the deployment process for critical paths?
* What runbooks exist for common operational issues?
