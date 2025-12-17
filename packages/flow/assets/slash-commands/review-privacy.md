---
name: review-privacy
description: Review privacy - consent, PII, data lifecycle, compliance
agent: coder
---

# Privacy Review

## Mandate

* Perform a **deep, thorough review** of privacy controls in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify compliance gaps and privacy improvements.

## Tech Stack

* **Analytics**: PostHog
* **Email**: Resend
* **Tag Management**: GTM (marketing only)
* **Observability**: Sentry

## Non-Negotiables

* Analytics and marketing must not fire before user consent
* PII must not leak into logs, Sentry, PostHog, or third-party services
* Account deletion must propagate to all third-party processors
* Marketing tags (GTM, Google Ads) must not load without consent
* Conversion tracking must be server-truth aligned, idempotent, and deduplicated

## Context

Privacy isn't just compliance — it's trust. Users share data expecting it to be handled responsibly. Every log line, every analytics event, every third-party integration is a potential privacy leak.

The review should verify that actual behavior matches stated policy. If the privacy policy says "we don't track without consent," does the code actually enforce that? Mismatches are not just bugs — they're trust violations.

## Driving Questions

* Does the consent implementation actually block tracking, or just record preference?
* Where does PII leak that we haven't noticed?
* If a user requests data deletion, what actually gets deleted vs. retained?
* Does the privacy policy accurately reflect what the code actually does?
* How would we handle a GDPR data subject access request today?
* What data are we collecting that we don't actually need?
