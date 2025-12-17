---
name: review-referral
description: Review referral - attribution, rewards, fraud prevention
agent: coder
---

# Referral Review

## Mandate

* Perform a **deep, thorough review** of the referral system in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify growth opportunities and fraud vectors.

## Tech Stack

* **Analytics**: PostHog
* **Database**: Neon (Postgres)

## Non-Negotiables

* Referral rewards must have clawback capability for fraud
* Attribution must be auditable (who referred whom, when, reward status)
* Velocity controls must exist to prevent abuse

## Context

Referral programs can drive explosive growth — or become fraud magnets. The best referral programs make sharing natural and rewarding. The worst become liability when abusers exploit them.

Consider both sides: what makes users want to share? And what prevents bad actors from gaming the system? A referral program that's easy to abuse is worse than no referral program.

## Driving Questions

* Why would a user share this product with someone they know?
* How easy is it for a bad actor to generate fake referrals?
* What fraud patterns exist that we haven't addressed?
* What is the actual ROI of the referral program?
* Where do users drop off in the referral/share flow?
* If we redesigned referrals from scratch, what would be different?
