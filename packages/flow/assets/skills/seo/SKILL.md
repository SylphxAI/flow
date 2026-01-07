---
name: seo
description: SEO - meta tags, structured data. Use when optimizing for search.
---

# SEO Guideline

## Tech Stack

* **Framework**: Next.js (SSR-first for indexable/discovery)

## Non-Negotiables

* All pages must have complete metadata
* Canonical URLs must be correct (no duplicate content)
* All required files must exist and be correct

## Required Files

| File | Required | Purpose |
|------|----------|---------|
| `robots.txt` | ✅ Yes | Search engine crawling rules |
| `sitemap.xml` | ✅ Yes | Page discovery for search engines |
| `llms.txt` | ✅ Yes | LLM/AI crawler guidance (new standard) |
| `security.txt` | ✅ Yes | Security vulnerability reporting |
| `ads.txt` | If ads | Authorized digital sellers |
| `app-ads.txt` | If mobile ads | Mobile app authorized sellers |

## HTML5 Head (Complete)

Every page must have:

```html
<!-- Essential Meta -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page Title | Brand</title>
<meta name="description" content="...">
<link rel="canonical" href="https://...">

<!-- Favicon (complete set) -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#...">

<!-- Open Graph (Social) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://.../og-image.png">
<meta property="og:site_name" content="...">
<meta property="og:locale" content="en_US">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@handle">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://.../twitter-image.png">

<!-- Security -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">

<!-- Performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://...">

<!-- Structured Data -->
<script type="application/ld+json">...</script>
```

## Structured Data (JSON-LD)

Required for rich results:
- Organization/WebSite schema on homepage
- Article schema for blog posts
- Product schema for products
- BreadcrumbList for navigation
- FAQ schema where applicable

## Security Headers

Must be set (via next.config.js or middleware):
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

## llms.txt Format

```
# Site Name
> Brief description of what this site/product does

## Overview
What the site is about, key features, target users.

## Key Pages
- /docs - Documentation
- /api - API reference
- /blog - Blog posts

## Contact
support@example.com
```

## security.txt Format

Located at `/.well-known/security.txt`:
```
Contact: mailto:security@example.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://example.com/.well-known/security.txt
```

## Context

SEO is about being found when people are looking for what you offer. Good SEO isn't tricks — it's making content genuinely useful and technically accessible to search engines and AI crawlers.

## Driving Questions

* Is every page's head complete with all required meta tags?
* Are Open Graph and Twitter Cards generating correct previews?
* Is structured data present and validated?
* Do all required files exist and pass validation?
* Is the site accessible to both search engines and LLM crawlers?
* Are security headers properly configured?
