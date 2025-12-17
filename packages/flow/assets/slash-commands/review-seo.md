---
name: review-seo
description: Review SEO - metadata, Open Graph, canonical, hreflang, sitemap
agent: coder
---

# SEO Review

## Mandate

* Perform a **deep, thorough review** of SEO in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for discoverability and search rankings.

## Tech Stack

* **Framework**: Next.js (SSR-first for indexable/discovery)

## Review Scope

### SEO Requirements

* SEO-first + SSR-first for indexable/discovery
* Required elements:
  * Metadata (title, description)
  * Open Graph tags
  * Favicon (all sizes)
  * Canonical URLs
  * hreflang + x-default
  * schema.org structured data
  * sitemap.xml
  * robots.txt

### SEO/i18n/Canonicalization Verification

* `/en/*` non-existence (must redirect)
* hreflang/x-default correct
* Sitemap containing only true variants
* UGC canonical redirects
* Locale routing invariants

## Key Areas to Explore

* How does the site perform in search engine results currently?
* What pages are missing proper metadata or structured data?
* How does the sitemap handle dynamic content and pagination?
* Are there duplicate content issues or canonicalization problems?
* What opportunities exist for featured snippets or rich results?
* How does page load performance affect SEO rankings?
