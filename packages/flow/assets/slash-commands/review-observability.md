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
* **Explore beyond the spec**: identify blind spots and debugging improvements.

## Tech Stack

* **Error Tracking**: Sentry
* **Analytics**: PostHog
* **Platform**: Vercel

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

## Key Areas to Explore

* How easy is it to debug a production issue end-to-end?
* What blind spots exist where errors go unnoticed?
* How effective are the current alerts (signal vs noise)?
* What SLOs/SLIs are defined and are they meaningful?
* How does log correlation work across async boundaries?
* What dashboards exist and do they answer the right questions?
