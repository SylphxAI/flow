---
name: review-observability
description: Review observability - logs, Sentry, correlation IDs, alerting
agent: coder
---

# Observability Review

## Mandate

* Perform a **deep, thorough review** of observability in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Observability and Alerting (Mandatory)

* Structured logs and correlation IDs must exist end-to-end (request/job/webhook) with consistent traceability
* Define critical-path SLO/SLI posture
* Define actionable alerts for:
  * Webhook failures
  * Ledger/entitlement drift
  * Authentication attacks
  * Abuse spikes
  * Drift detection

### Logging Best Practices

* Structured JSON logs
* Correlation ID in all logs
* Request ID propagation
* User context (anonymized where needed)
* Error stack traces
* Performance timing
* No PII in logs

### Monitoring

* Sentry for error tracking
* PostHog for product analytics
* Server metrics (latency, throughput, errors)
* Database query performance
* External service health

## Verification Checklist

- [ ] Structured logging implemented
- [ ] Correlation IDs propagate
- [ ] Sentry configured
- [ ] SLO/SLI defined
- [ ] Alerts for critical failures
- [ ] No PII in logs
- [ ] Dashboards for key metrics
