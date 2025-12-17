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

### Referral Best Practices

* Clear attribution window
* Reward triggers well-defined
* Double-sided rewards (referrer + referee)
* Fraud detection signals
* Admin visibility into referral chains
* Automated clawback on refund/chargeback

## Verification Checklist

- [ ] Attribution tracking works
- [ ] Reward lifecycle defined
- [ ] Velocity controls implemented
- [ ] Device/account linkage checked
- [ ] Clawback on fraud/refund
- [ ] Admin can review referrals
- [ ] Localized referral messaging
