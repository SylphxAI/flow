---
name: review-trust-safety
description: Review trust & safety - UGC moderation, abuse prevention, appeals
agent: coder
---

# Trust & Safety Review

## Mandate

* Perform a **deep, thorough review** of trust and safety controls in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify abuse vectors and user safety improvements.

## Tech Stack

* **Analytics**: PostHog
* **Database**: Neon (Postgres)
* **Workflows**: Upstash Workflows + QStash

## Review Scope

### Abuse/Fraud Posture (Hard Requirement)

* Define prevention and enforcement measures for:
  * **UGC abuse**: spam, harassment, illegal content, impersonation
  * **Support abuse**: fake tickets, social engineering, support channel manipulation
  * **Account abuse**: fake accounts, bot networks, coordinated inauthentic behavior
* Risk signals must trigger protective actions and step-up verification where appropriate.

### Risk Signals and Enforcement

* Define a minimum set of risk signals:
  * Velocity controls (rate of actions)
  * Account/device linkage posture
  * Behavioral anomaly detection
  * Risk-tiered enforcement (warn → restrict → suspend → ban)

### Content Moderation

* UGC moderation pipeline must be:
  * Automated where possible (spam, obvious violations)
  * Escalation path for edge cases
  * Auditable with before/after state
  * Localized for different content standards

### Appeals and Manual Review

* Appeals workflow must be:
  * Discoverable and accessible to affected users
  * Time-bound with SLA expectations
  * Auditable with decision rationale
  * Reversible where appropriate
* Manual review queue must be operable and have visibility into backlog

### Protective Actions

* Define graduated response levels:
  * Content removal/hiding
  * Feature restriction
  * Account suspension (temporary)
  * Account termination (permanent)
* All actions must be auditable with who/when/why

## Key Areas to Explore

* What abuse patterns exist and how are they currently detected?
* Where are the gaps in automated moderation?
* How do users report abuse and how effective is the response?
* What is the false positive rate for automated enforcement?
* How are appeals handled and what is the resolution time?
* What visibility do operators have into abuse trends?
