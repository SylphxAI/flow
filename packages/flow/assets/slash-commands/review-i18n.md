---
name: review-i18n
description: Review i18n - localization, routing, translation quality
agent: coder
---

# Internationalization Review

## Mandate

* Perform a **deep, thorough review** of internationalization in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify what would make the product feel native to each locale.

## Tech Stack

* **i18n**: next-intl
* **Framework**: Next.js

## Non-Negotiables

* `/en/*` must not exist (permanently redirect to non-prefixed)
* Missing translation keys must fail build
* No hardcoded user-facing strings outside localization

## Context

Internationalization isn't just translation — it's making the product feel native to each market. Bad i18n is obvious to users and signals that they're second-class citizens. Good i18n is invisible.

Consider: dates, numbers, currency, pluralization, text direction, cultural norms. Does the product feel like it was built for each locale, or does it feel like a translation of an English product?

## Driving Questions

* What would make the product feel native to a non-English user?
* Where do translations feel awkward or machine-generated?
* What cultural assumptions are baked into the UX that don't translate?
* How painful is the translation workflow for adding new strings?
* What locales are we missing that represent real market opportunity?
* Where do we fall back to English in ways users would notice?
