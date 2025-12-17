---
name: review-pricing
description: Review pricing - pricing governance, grandfathering, migrations
agent: coder
---

# Pricing Review

## Mandate

* Perform a **deep, thorough review** of pricing governance in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Stripe Pricing Governance (Stripe-first, not Dashboard-first)

* Stripe is the system-of-record for products, prices, subscriptions, invoices, and disputes; internal systems must not contradict Stripe truth.
* Pricing changes must be performed by creating new Stripe Prices and updating the "active sellable price" policy; historical prices must remain immutable for existing subscriptions unless an approved migration is executed.
* Default pricing change policy is **grandfathering**: existing subscribers keep their current price; new customers use the currently active sellable price.

### Pricing Admin Requirements

* An operational-grade Pricing Admin must exist to manage:
  * Creation of new Stripe Prices
  * Activation/deactivation of sellable prices
  * Controlled bulk subscription migrations (optional)
* All actions must be governed by RBAC, step-up controls, and audit logs.
* Stripe Dashboard is treated as monitoring/emergency access; non-admin Stripe changes must be detectable (drift), alertable, and remediable.

### Pricing Strategy

* Clear tier differentiation
* Feature gating by plan
* Upgrade/downgrade paths defined
* Proration handling
* Trial-to-paid conversion flow

## Verification Checklist

- [ ] Stripe is system-of-record
- [ ] New prices don't mutate existing
- [ ] Grandfathering policy implemented
- [ ] Pricing admin exists with RBAC
- [ ] Stripe Dashboard drift detectable
- [ ] Upgrade/downgrade paths work
