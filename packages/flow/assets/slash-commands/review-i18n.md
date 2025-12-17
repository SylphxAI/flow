---
name: review-i18n
description: Review i18n - locales, routing, canonicalization, UGC
agent: coder
---

# Internationalization Review

## Mandate

* Perform a **deep, thorough review** of internationalization in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for coverage, quality, and user experience.

## Tech Stack

* **i18n**: next-intl
* **Framework**: Next.js

## Review Scope

### Supported Locales

`en`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `de`, `fr`, `pt-BR`, `it`, `nl`, `pl`, `tr`, `id`, `th`, `vi`

### URL Strategy: Prefix Except Default

* English is default and non-prefixed.
* `/en/*` must not exist; permanently redirect to non-prefixed equivalent.
* All non-default locales are `/<locale>/...`.

### Globalization Rules

* Intl formatting for dates, numbers, currency
* Explicit fallback rules
* Missing translation keys must fail build
* No hardcoded user-facing strings outside localization

### UGC Canonicalization

* Separate UI language from content language.
* Exactly one canonical URL per UGC resource determined by content language.
* No indexable locale-prefixed duplicates unless primary content is truly localized; otherwise redirect to canonical.
* Canonical/hreflang/sitemap must reflect only true localized variants.

## Key Areas to Explore

* How complete and consistent are the translations across all locales?
* What user-facing strings are hardcoded and missing from localization?
* How does the routing handle edge cases (unknown locales, malformed URLs)?
* What is the translation workflow and how can it be improved?
* How does the system handle RTL languages if needed in the future?
