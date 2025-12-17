---
name: saas-billing
description: SaaS billing review - Stripe, webhooks, pricing governance, ledger
agent: coder
---

# Billing & Payments Review

## Scope

Review all payment and billing systems: Stripe integration, webhook handling, pricing governance, subscription state machine, and financial-grade ledger (if applicable).

## Specification

### Billing State Machine (Hard Requirement)

* **Billing and access state machine is mandatory**: define and validate the mapping **Stripe state → internal subscription state → entitlements**, including trial, past_due, unpaid, canceled, refund, and dispute outcomes.
* UI must only present interpretable, non-ambiguous states derived from server-truth.
* **No dual-write (hard requirement)**: subscription/payment truth must be derived from Stripe-driven events; internal systems must not directly rewrite billing truth or authorize entitlements based on non-Stripe truth, except for explicitly defined admin remediation flows that are fully server-enforced and fully audited.

### Stripe Integration

* Support subscriptions and one-time payments as product needs require.
* Tax/invoicing and refund/dispute handling must be behaviorally consistent with product UX and entitlement state.

### Webhook Handling (Hard Requirement)

* Webhooks must be idempotent, retry-safe, out-of-order safe, auditable; billing UI reflects server-truth state without ambiguity.
* **Webhook trust is mandatory (high-risk)**: webhook origin must be verified (signature verification and replay resistance). The Stripe **event id** must be used as the idempotency and audit correlation key; unverifiable events must be rejected and must trigger alerting.
* **Out-of-order behavior must be explicit**: all webhook handlers must define and enforce a clear out-of-order strategy (event ordering is not guaranteed even for the same subscription), and must define final-state decision rules.

### Pricing Governance (Stripe-first, not Dashboard-first)

* Stripe is the system-of-record for products, prices, subscriptions, invoices, and disputes; internal systems must not contradict Stripe truth.
* Pricing changes must be performed by creating new Stripe Prices and updating the "active sellable price" policy; historical prices must remain immutable for existing subscriptions unless an approved migration is executed.
* Default pricing change policy is **grandfathering**: existing subscribers keep their current price; new customers use the currently active sellable price.
* An operational-grade **Pricing Admin** must exist to manage creation of new Stripe Prices, activation/deactivation of sellable prices, and (optionally) controlled bulk subscription migrations; all actions must be governed by RBAC, step-up controls, and audit logs.
* Stripe Dashboard is treated as monitoring/emergency access; non-admin Stripe changes must be detectable (drift), alertable, and remediable.

### Financial-Grade Balance System (Only if "balance/credits/wallet" exists)

* Any balance concept must be implemented as an **immutable ledger** (append-only source of truth), not a mutable balance field.
* Deterministic precision (no floats), idempotent posting, concurrency safety, transactional integrity, and auditability are required.
* Monetary flows must be currency-based and reconcilable with Stripe; credits (if used) must be governed as non-cash entitlements.

### Auditability

* **Auditability chain is mandatory** for any high-value mutation: who/when/why, before/after state, and correlation to the triggering request/job/webhook must be recorded and queryable.

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Conversion optimization**: Are there friction points in the checkout flow? Missing payment methods for target markets?
* **Churn reduction**: Is dunning (failed payment retry) properly configured? Are there win-back opportunities?
* **Pricing opportunities**: Are tiers properly differentiated? Is there usage-based pricing potential?
* **Trial optimization**: Is trial-to-paid conversion measured and optimized?
* **Upgrade/downgrade UX**: Is plan switching seamless? Prorated correctly?

## Domain Gates

* [ ] Stripe state machine fully mapped and documented
* [ ] Webhook handlers are idempotent and out-of-order safe
* [ ] Signature verification implemented and tested
* [ ] Pricing admin exists with RBAC and audit
* [ ] No dual-write violations
* [ ] Ledger is append-only (if balance exists)
* [ ] Billing UI reflects server-truth only
