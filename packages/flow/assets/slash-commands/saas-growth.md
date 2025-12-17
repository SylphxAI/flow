---
name: saas-growth
description: SaaS growth review - onboarding, referral, retention, guidance
agent: coder
---

# Growth Systems Review

## Scope

Review growth systems: onboarding flows, referral program, retention mechanics, viral/sharing features, and user guidance.

## Specification

### Growth System Foundation

* The system must produce a coherent, measurable growth system for activation, sharing/virality, and retention, aligned with compliance and anti-abuse constraints.

### Onboarding

* Onboarding must be **outcome-oriented** (guide to first value, not just feature tour).
* Localized for all supported locales.
* Accessible (WCAG AA).
* Instrumented (track completion, drop-off points).
* Progressive disclosure — don't overwhelm new users.

### Sharing/Virality

* Sharing must be **consent-aware** (no spam, no dark patterns).
* Abuse-resistant with rate limiting and detection.
* Measurable end-to-end (share → click → signup → conversion).
* Platform-appropriate sharing (native share sheet on mobile, copy link on desktop).

### Retention

* Retention must be **intentionally engineered**, not accidental.
* Monitored with cohort analysis.
* Protected against regressions (alert on retention drops).
* Re-engagement flows (email, push) must be consent-governed.

### Referral Program (Anti-Abuse Baseline Required)

* Referral must be measurable, abuse-resistant, and governed:
  * Clear attribution semantics (who referred whom, when)
  * Reward lifecycle governance (pending → approved → paid, including revocation/clawbacks)
  * Anti-fraud measures
  * Admin reporting and audit capabilities
  * Localized and instrumented

* **Referral anti-fraud minimum baseline is mandatory**:
  * Define minimum set of risk signals and enforcement measures
  * Velocity controls (rate limiting referrals)
  * Account/device linkage posture (detect self-referral)
  * Risk-tiered enforcement (high-risk delays, low-risk instant)
  * Reward delay/hold/freeze capabilities
  * Clawback conditions clearly defined
  * Auditable manual review/appeal posture where applicable

### Support and Communications

* Support/Contact surface must be discoverable, localized, WCAG AA, SEO-complete, privacy-safe, and auditable where relevant.
* Newsletter subscription/preferences must be consent-aware; unsubscribe enforcement must be reliable and immediate.

### Admin Platform (Growth-Related)

* **Admin analytics and reporting are mandatory**:
  * Comprehensive dashboards/reports for business, growth, billing, referral, support, and security/abuse signals
  * Governed by RBAC
  * Reporting must be consistent with system-of-record truth and auditable

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Activation optimization**: What's the "aha moment"? How fast do users reach it? What's blocking them?
* **Viral loops**: Are there natural sharing moments? Can product usage generate invites?
* **Retention hooks**: What brings users back? Email? Push? In-app value?
* **Referral improvements**: Is the reward compelling? Is sharing frictionless? What's the k-factor?
* **Churn analysis**: Why do users leave? Exit surveys? Behavioral patterns before churn?
* **Expansion revenue**: Are there upsell opportunities? Usage-based triggers?

## Domain Gates

* [ ] Onboarding tracks completion and drop-off
* [ ] Onboarding is localized and accessible
* [ ] Sharing respects consent and has rate limits
* [ ] Sharing is measurable end-to-end
* [ ] Retention cohorts are tracked
* [ ] Retention regression alerts exist
* [ ] Referral attribution is accurate
* [ ] Referral has anti-fraud controls
* [ ] Reward lifecycle is auditable
* [ ] Support surface is discoverable and localized
* [ ] Newsletter unsubscribe works immediately
