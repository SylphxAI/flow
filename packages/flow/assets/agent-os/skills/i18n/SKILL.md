---
name: i18n
description: Internationalization - localization, translations. Use when adding languages.
---

# i18n Guideline

## Tech Stack

* **i18n**: next-intl
* **Framework**: Next.js

## Non-Negotiables

* `/en/*` must not exist (permanently redirect to non-prefixed)
* Missing translation keys must fail build
* No hardcoded user-facing strings outside localization
* Translation bundles must be split by namespace or route (no monolithic language files)

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
* How large are the translation bundles, and what's being sent to the client?

## Bundle Constraints

* No monolithic language files — split by namespace (`common`, `auth`, `dashboard`, etc.)
* Server Components for translations wherever possible — client bundles must not include translations that could stay on server
* Each route should load only its required namespaces
* Measure client bundle size impact of translations
