---
name: pricing
description: Pricing strategy - tiers, feature gating. Use when designing pricing.
---

# Pricing Guideline

## Tech Stack

* **Payments**: Stripe
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* Platform is source of truth — Stripe syncs FROM platform, never reverse
* All pricing/product configuration must be in code
* Feature entitlements derived from platform state, not Stripe metadata
* Pricing drift must be detectable and auto-correctable
* No manual Stripe dashboard configuration

## Context

Pricing owns strategy — what tiers exist, what features each tier gets, how upgrades work. Billing handles the payment mechanics. This separation allows switching payment processors without repricing.

## Driving Questions

* Is all pricing defined in code?
* How do we test pricing changes before going live?
* What would make upgrading feel like an obvious decision?
* How do we communicate value at each tier?
* Can we A/B test pricing without Stripe changes?
