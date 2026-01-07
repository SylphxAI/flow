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

* All pricing configuration must be in code (platform is SSOT)
* No manual Stripe dashboard configuration
* Stripe Products/Prices created via sync from platform
* Pricing drift must be detectable and auto-correctable
* Feature entitlements derived from platform state, not Stripe metadata

## Context

Pricing is strategy, not just configuration. The right pricing captures value, reduces friction, and aligns incentives.

Platform owns pricing. Stripe is the payment processor. This separation allows:
- A/B testing pricing without Stripe changes
- Switching processors without repricing
- Complex entitlement logic beyond Stripe's model

## Driving Questions

* Is all pricing defined in code?
* Can we change pricing without touching Stripe dashboard?
* How do we test pricing changes before going live?
* What would make upgrading feel like an obvious decision?
* How do we communicate value at each tier?
