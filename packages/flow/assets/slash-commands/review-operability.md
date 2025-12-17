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

## Review Scope

### Async/Workflows Governance (Hard Requirement)

* Define idempotency and deduplication posture
* Define controlled retries/backoff
* **Dead-letter handling must exist and be observable and operable**
* **Safe replay must be supported**
* Side-effects (email/billing/ledger/entitlements) must be governed such that they are either proven effectively-once or safely re-entrant without duplicated economic/security consequences

### Drift Detection (Hard Requirement)

* Drift alerts must have a defined remediation playbook (automated fix or operator workflow)
* Each remediation must be auditable and support post-incident traceability

### Release Safety

* Define safe rollout posture with backward compatibility
* Rollback expectations for billing/ledger/auth changes

### Operability Best Practices

* Health check endpoints
* Graceful shutdown
* Circuit breakers for external services
* Timeout configuration
* Retry with exponential backoff
* Bulk operation controls
* Maintenance mode capability

## Verification Checklist

- [ ] Async jobs idempotent
- [ ] DLQ exists and observable
- [ ] Safe replay supported
- [ ] Drift detection implemented
- [ ] Remediation playbooks exist
- [ ] Rollback strategy defined
- [ ] Health checks present
