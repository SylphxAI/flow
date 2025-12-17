---
name: saas-i18n
description: SaaS internationalization review - locales, routing, canonicalization, hreflang
agent: coder
---

# Internationalization & Routing Review

## Scope

Review internationalization systems: locale support, URL routing strategy, canonicalization, hreflang implementation, and UGC handling across languages.

## Specification

### Supported Locales

`en`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `de`, `fr`, `pt-BR`, `it`, `nl`, `pl`, `tr`, `id`, `th`, `vi`

### URL Strategy: Prefix Except Default

* English is default and **non-prefixed**.
* `/en/*` must **not exist**; permanently redirect to non-prefixed equivalent.
* All non-default locales are `/<locale>/...`.

### Globalization Rules

* Use Intl APIs for formatting (dates, numbers, currencies).
* Explicit fallback rules for missing translations.
* **Missing translation keys must fail build** — no silent fallbacks in production.
* No hardcoded user-facing strings outside localization system.

### UGC Canonicalization

* Separate UI language from content language.
* Exactly one canonical URL per UGC resource determined by content language.
* No indexable locale-prefixed duplicates unless primary content is truly localized; otherwise redirect to canonical.
* Canonical/hreflang/sitemap must reflect only true localized variants.

### SEO Requirements

* `hreflang` tags with `x-default` pointing to non-prefixed (English) version.
* `sitemap.xml` containing only true localized variants.
* Canonical URLs properly set per page.
* No duplicate content across locale paths.

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Market expansion**: Are high-value markets missing? (e.g., Arabic RTL, Hindi)
* **Translation quality**: Are translations professional or machine-generated? User complaints?
* **Locale detection**: Is auto-detection helpful or annoying? Is manual switching easy?
* **Regional pricing**: Does i18n support regional pricing display? Currency localization?
* **Legal localization**: Are terms/privacy properly localized per jurisdiction?
* **Date/time handling**: Timezone-aware displays? User preference respected?

## Domain Gates

* [ ] All supported locales have complete translations
* [ ] `/en/*` returns 301 redirect to non-prefixed
* [ ] Missing translation keys fail build
* [ ] hreflang tags present and correct
* [ ] x-default points to non-prefixed version
* [ ] Sitemap contains only true localized pages
* [ ] UGC has single canonical URL per content
* [ ] No hardcoded strings in components
