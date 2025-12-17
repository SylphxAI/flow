---
name: review-billing
description: Review billing - Stripe integration, webhooks, state machine
agent: coder
---

# Billing Review

## Mandate

* Perform a **deep, thorough review** of billing and payments in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Billing and Payments (Stripe)

* Support subscriptions and one-time payments as product needs require.
* **Billing state machine follows mapping requirements**; UI must only surface explainable, non-ambiguous states aligned to server-truth.
* Tax/invoicing and refund/dispute handling must be behaviorally consistent with product UX and entitlement state.

### Webhook Requirements (High-Risk)

* Webhooks must be idempotent, retry-safe, out-of-order safe, auditable
* Billing UI reflects server-truth state without ambiguity
* **Webhook trust is mandatory**: webhook origin must be verified (signature verification and replay resistance)
* The Stripe **event id** must be used as the idempotency and audit correlation key
* Unverifiable events must be rejected and must trigger alerting
* **Out-of-order behavior must be explicit**: all webhook handlers must define and enforce a clear out-of-order strategy (event ordering is not guaranteed even for the same subscription)

### State Machine

* Define mapping: **Stripe state → internal subscription state → entitlements**
* Handle: trial, past_due, unpaid, canceled, refund, dispute
* UI only shows interpretable, non-ambiguous states

## Verification Checklist

- [ ] Billing state machine defined
- [ ] Webhook signature verification
- [ ] Idempotent webhook handling (event id)
- [ ] Out-of-order handling defined
- [ ] All Stripe states mapped
- [ ] UI reflects server-truth only
- [ ] Refund/dispute handling works
