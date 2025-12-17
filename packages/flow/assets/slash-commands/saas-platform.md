---
name: saas-platform
description: SaaS frontend review - design system, SEO, PWA, performance, accessibility
agent: coder
---

# Frontend & Platform Review

## Scope

Review frontend systems: design system, SEO implementation, PWA capabilities, performance optimization, and accessibility compliance.

## Specification

### Design System & UX

* Design-system driven UI (tokens for colors, spacing, typography).
* Dark/light theme support with user preference persistence.
* **WCAG AA** accessibility compliance.
* CLS-safe (no layout shift).
* **Mobile-first** responsive design; desktop-second.
* Iconify for icons; no emoji in UI content.

### SEO Requirements

* **SEO-first + SSR-first** for indexable/discovery pages.
* Required metadata:
  * Title and description (unique per page)
  * Open Graph tags (og:title, og:description, og:image)
  * Favicon (multiple sizes)
  * Canonical URL
  * robots meta tag
* `schema.org` structured data where applicable.
* `sitemap.xml` (auto-generated, up-to-date).
* `robots.txt` properly configured.

### PWA Capabilities

* Web app manifest with proper icons and theme colors.
* Service worker with explicit cache correctness.
* Push notifications using VAPID where applicable.
* **Service Worker caching boundary is mandatory**: service worker must not cache personalized/sensitive/authorized content.
* Authenticated and entitlement-sensitive routes must have explicit cache-control and SW rules.
* SW caching boundaries must be validated by tests to prevent stale or unauthorized state exposure.

### Performance

* Performance must be **measurable and regression-resistant**:
  * Define and enforce performance budgets for key journeys
  * Define caching boundaries and correctness requirements across SSR/ISR/static and service worker behavior
  * Monitor Core Web Vitals and server latency; alert on regressions
* Target metrics:
  * LCP < 2.5s
  * FID < 100ms
  * CLS < 0.1
  * TTFB < 600ms

### Guidance System

* Guidance is mandatory for all user-facing features and monetization flows.
* Must be: discoverable, clear, dismissible with re-entry option.
* Localized and measurable (track engagement).
* Governed by eligibility and frequency controls.

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Performance wins**: Are there obvious bundle size reductions? Lazy loading opportunities? Image optimization?
* **SEO gaps**: Missing structured data? Pages not indexed? Slow crawl rate?
* **PWA enhancement**: Is offline experience meaningful? Are push notifications valuable?
* **Accessibility**: Beyond AA compliance, are there UX improvements for assistive tech?
* **Design consistency**: Are there inconsistencies in the design system usage? Rogue styles?
* **Mobile experience**: Is mobile-first truly implemented? Touch targets adequate?

## Domain Gates

* [ ] Design tokens used consistently (no hardcoded values)
* [ ] Dark/light theme works correctly
* [ ] WCAG AA compliance verified
* [ ] All pages have unique title/description/OG tags
* [ ] Sitemap.xml exists and is current
* [ ] Schema.org markup present
* [ ] Service worker doesn't cache authenticated content
* [ ] Core Web Vitals within targets
* [ ] Performance budgets defined and enforced
* [ ] Guidance system implemented for key flows
