---
name: guideline-pricing
description: Guideline: pricing - strategy, packaging, monetization
agent: coder
---

# Pricing Guideline

## Tech Stack

* **Payments**: Stripe

## Non-Negotiables

* Stripe is system-of-record; internal systems must not contradict Stripe truth
* Pricing changes must create new Stripe Prices (historical prices immutable)
* Non-admin Stripe Dashboard changes must be detectable (drift)

## Context

Pricing is strategy, not just configuration. The right pricing captures value, reduces friction, and aligns incentives. The wrong pricing leaves money on the table or drives users away.

Consider the entire monetization journey: how users discover value, how they decide to pay, how they upgrade/downgrade. Where is there friction? Where are we undercharging? Where are we losing conversions?

## Driving Questions

* How does our pricing compare to competitors?
* Where do users abandon the upgrade flow?
* What would make upgrading feel like an obvious decision?
* How do we communicate value at each pricing tier?
* What pricing experiments would teach us the most?
* If we could change one thing about pricing, what would have the biggest impact?
