---
name: billing
description: Billing - Stripe, webhooks, subscriptions. Use when implementing payments.
---

# Billing Guideline

## Tech Stack

* **Payments**: Stripe
* **Workflows**: Upstash Workflows + QStash
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Platform-Led Billing

Platform is the source of truth. Stripe syncs FROM platform, not TO it.

- Platform defines products, prices, features, entitlements
- Stripe is synced to match platform state
- No manual Stripe dashboard configuration
- Platform state → Stripe sync (never reverse)
- Stripe webhooks confirm sync success, not drive state

## Non-Negotiables

* Webhook signature must be verified (reject unverifiable events)
* Stripe event ID must be used for idempotency
* Webhooks must handle out-of-order delivery
* UI must only display states derivable from platform-truth
* No Stripe dashboard design — all configuration in code

## Subscription Lifecycle

```
Platform defines plan
        ↓
Sync to Stripe (create Product + Price)
        ↓
User selects plan in UI
        ↓
Create Stripe Checkout Session
        ↓
User completes payment
        ↓
Webhook confirms → Update platform state
        ↓
Entitlements derived from platform state
```

## Context

Billing is where trust meets money. A bug here isn't just annoying — it's a financial and legal issue. Users must always see accurate state, and the system must never lose or duplicate charges.

The platform owns billing logic. Stripe is a payment processor, not a product catalog.

## Driving Questions

* Is all billing configuration in code, not Stripe dashboard?
* Can we switch payment processors without redesigning billing?
* What happens when webhooks arrive out of order?
* How are disputes and chargebacks handled end-to-end?
* Where could revenue leak (failed renewals, unhandled states)?
