---
name: review-performance
description: Review performance - budgets, Core Web Vitals, caching
agent: coder
---

# Performance Review

## Mandate

* Perform a **deep, thorough review** of performance in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify bottlenecks and optimization opportunities.

## Tech Stack

* **Framework**: Next.js (SSR/ISR/Static)
* **Platform**: Vercel
* **Tooling**: Bun

## Review Scope

### Performance Requirements

* Performance must be **measurable and regression-resistant**:
  * Define and enforce performance budgets for key journeys
  * Define caching boundaries and correctness requirements across SSR/ISR/static and service worker behavior
  * Monitor Core Web Vitals and server latency
  * Alert on regressions

### Core Web Vitals Targets

* LCP (Largest Contentful Paint) < 2.5s
* FID (First Input Delay) < 100ms
* CLS (Cumulative Layout Shift) < 0.1
* INP (Interaction to Next Paint) < 200ms

## Key Areas to Explore

* What are the current Core Web Vitals scores and where do they fall short?
* Which pages or components are the biggest performance bottlenecks?
* How effective is the current caching strategy?
* What opportunities exist for code splitting and lazy loading?
* How does the bundle size compare to industry benchmarks?
* What database queries are slow and how can they be optimized?
