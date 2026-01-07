---
name: seo
description: SEO - meta tags, structured data. Use when optimizing for search.
---

# SEO Guideline

## Tech Stack

* **Framework**: Next.js (SSR-first for indexable/discovery)

## Non-Negotiables

* Every page must have complete metadata (title, description, canonical, OG, Twitter Cards)
* Canonical URLs must be correct (no duplicate content)
* Complete favicon set (ico, svg, apple-touch-icon, PWA icons)
* Structured data (JSON-LD) for rich results where applicable
* Security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)

## Required Files

* `robots.txt` — search engine crawling rules
* `sitemap.xml` — page discovery for search engines
* `llms.txt` — LLM/AI crawler guidance
* `security.txt` — security vulnerability reporting (at `/.well-known/security.txt`)
* `ads.txt` — if ads exist
* `app-ads.txt` — if mobile ads exist

## Context

SEO is about being found when people are looking for what you offer. Good SEO isn't tricks — it's making content genuinely useful and technically accessible to search engines and AI crawlers.

## Driving Questions

* Is every page's head complete with all required meta tags?
* Are Open Graph and Twitter Cards generating correct previews?
* Is structured data present and validated?
* Do all required files exist and pass validation?
* Is the site accessible to both search engines and LLM crawlers?
* Are security headers properly configured?
