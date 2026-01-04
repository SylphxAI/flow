---
name: pricing
description: Pricing strategy - tiers, feature gating. Use when designing pricing.
---

# Pricing Guideline

## Tech Stack

* **Payments**: Stripe
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Platform-Led Pricing

Platform is the source of truth for all pricing.

- Products, prices, tiers, features defined in platform code
- Stripe Products/Prices created via sync, not manually
- No Stripe dashboard configuration
- Pricing changes → code change → sync to Stripe
- Historical prices remain in Stripe (immutable)

## Non-Negotiables

* All pricing configuration must be in code
* No manual Stripe dashboard changes
* Pricing drift must be detectable and auto-correctable
* Feature entitlements derived from platform state, not Stripe metadata

## Pricing Model

```typescript
// Platform defines pricing (code is SSOT)
const plans = {
  free: { price: 0, features: ['basic'] },
  pro: { price: 29, features: ['basic', 'advanced', 'priority'] },
  enterprise: { price: 299, features: ['basic', 'advanced', 'priority', 'sla'] }
}

// Sync to Stripe on deploy/startup
await syncPricingToStripe(plans)
```

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
