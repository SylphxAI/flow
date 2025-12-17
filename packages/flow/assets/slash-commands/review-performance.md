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

## Review Scope

### Performance Requirements

* Performance must be **measurable and regression-resistant**:
  * Define and enforce performance budgets for key journeys
  * Define caching boundaries and correctness requirements across SSR/ISR/static and service worker behavior
  * Monitor Core Web Vitals and server latency
  * Alert on regressions

### Performance Budget Verification

* **Performance budget verification** for key journeys (including Core Web Vitals-related thresholds) with release-blocking regression detection

### Core Web Vitals

* LCP (Largest Contentful Paint) < 2.5s
* FID (First Input Delay) < 100ms
* CLS (Cumulative Layout Shift) < 0.1
* INP (Interaction to Next Paint) < 200ms

### Performance Best Practices

* Image optimization (WebP, lazy loading)
* Code splitting
* Tree shaking
* Bundle size monitoring
* Font optimization
* Critical CSS
* Preloading key resources
* Server response time < 200ms

## Verification Checklist

- [ ] Performance budgets defined
- [ ] Core Web Vitals within targets
- [ ] Regression detection active
- [ ] Caching boundaries defined
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] No render-blocking resources
