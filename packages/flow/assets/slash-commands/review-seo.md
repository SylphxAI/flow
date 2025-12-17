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

### SEO Best Practices

* Unique titles per page
* Meta descriptions present
* Heading hierarchy (single H1)
* Image alt text
* Internal linking structure
* Page speed optimization
* Mobile-friendly
* No duplicate content

## Verification Checklist

- [ ] All pages have unique titles
- [ ] Meta descriptions present
- [ ] Open Graph tags complete
- [ ] Canonical URLs correct
- [ ] hreflang implemented
- [ ] sitemap.xml exists and valid
- [ ] robots.txt configured
- [ ] schema.org markup present
- [ ] SSR for indexable content
