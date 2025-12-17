---
name: review-privacy
description: Review privacy - consent, PII handling, data lifecycle, GDPR
agent: coder
---

# Privacy Review

## Mandate

* Perform a **deep, thorough review** of privacy controls in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Consent Governance (Release-Blocking)

* Analytics (PostHog) and marketing/newsletter communications (Resend) must be governed by consent and user preferences.
* Marketing tags (including GTM and Google Ads) must not load or fire without the appropriate consent.
* Without consent, tracking and marketing sends must not occur, except for strictly necessary service communications.
* Event schemas and attributes must follow data minimization, with explicit PII classification and handling rules.

### PII and Sensitive Data Controls (Hard Requirement)

* PII rules apply to logs, Sentry, PostHog, support tooling, email systems, and marketing tags/conversion payloads.
* A consistent scrubbing/redaction standard must exist, and must be covered by automated tests to prevent leakage to third parties.

### Data Lifecycle

* Define deletion/deactivation semantics
* Deletion propagation to third parties
* Export where applicable
* DR/backup posture aligned with retention
* **Define data classification, retention periods, deletion propagation to third-party processors, and explicit exceptions** (legal/tax/anti-fraud)
* Ensure external disclosures match behavior

### Behavioral Consistency

* **Behavioral consistency is required**: policy and disclosures must match actual behavior across UI, data handling, logging/observability, analytics, support operations, and marketing tags; mismatches are release-blocking.

## Verification Checklist

- [ ] Consent gates analytics/marketing
- [ ] No tracking without consent
- [ ] PII scrubbed from logs/Sentry/PostHog
- [ ] Data deletion flow works
- [ ] Deletion propagates to third parties
- [ ] Privacy policy matches actual behavior
