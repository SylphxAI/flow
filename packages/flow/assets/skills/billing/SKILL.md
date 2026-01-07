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

## Non-Negotiables

* Platform is source of truth — Stripe syncs FROM platform, never reverse
* All billing configuration in code, not Stripe dashboard
* Webhook signature must be verified (reject unverifiable events)
* Stripe event ID must be used for idempotency
* Webhooks must handle out-of-order delivery
* Entitlements derived from platform state, not Stripe metadata

## Context

Billing is where trust meets money. A bug here isn't just annoying — it's a financial and legal issue. Users must always see accurate state, and the system must never lose or duplicate charges.

The platform owns billing logic. Stripe is a payment processor, not a product catalog.

## Driving Questions

* Is all billing configuration in code, not Stripe dashboard?
* Can we switch payment processors without redesigning billing?
* What happens when webhooks arrive out of order?
* How are disputes and chargebacks handled end-to-end?
* Where could revenue leak (failed renewals, unhandled states)?
