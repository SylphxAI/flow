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
* Translation bundles must be split by namespace (no monolithic files)
* Server Components for translations wherever possible

## Bundle Strategy

```
messages/
├── en/
│   ├── common.json      # Shared strings
│   ├── auth.json        # Auth flow
│   ├── dashboard.json   # Dashboard
│   └── settings.json    # Settings
└── zh/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    └── settings.json
```

Each route loads only its required namespaces.
Client bundles must not include server-only translations.

## Context

Internationalization isn't just translation — it's making the product feel native to each market. Bad i18n signals users are second-class citizens. Good i18n is invisible.

next-intl is the SSOT for i18n. No custom implementations.

## Driving Questions

* Is next-intl handling all translations?
* Are bundles split by namespace?
* What would make the product feel native to non-English users?
* Where do translations feel awkward?
* How large are client-side translation bundles?
