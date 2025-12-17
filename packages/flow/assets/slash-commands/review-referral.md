---
name: review-referral
description: Review referral - attribution, anti-fraud, rewards, clawback
agent: coder
---

# Referral Review

## Mandate

* Perform a **deep, thorough review** of the referral system in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify growth opportunities and fraud prevention improvements.

## Tech Stack

* **Analytics**: PostHog
* **Database**: Neon (Postgres)

## Review Scope

### Referral (Anti-Abuse Baseline Required)

* Referral must be measurable, abuse-resistant, and governed:
  * Attribution semantics
  * Reward lifecycle governance (including revocation/clawbacks)
  * Anti-fraud measures
  * Admin reporting/audit
  * Localized and instrumented

### Referral Anti-Fraud Minimum Baseline (Mandatory)

* Define a minimum set of risk signals and enforcement measures, including:
  * Velocity controls
  * Account/device linkage posture
  * Risk-tiered enforcement
  * Reward delay/hold/freeze
  * Clawback conditions
  * Auditable manual review/appeal posture where applicable

## Key Areas to Explore

* How effective is the current referral program at driving growth?
* What fraud patterns have been observed and how are they mitigated?
* How does the attribution model handle edge cases (multiple touches, expired links)?
* What is the reward fulfillment process and where can it fail?
* How do users discover and share referral links?
* What analytics exist to measure referral program ROI?
