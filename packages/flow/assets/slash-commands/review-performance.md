---
name: review-performance
description: Review performance - speed, Core Web Vitals, bottlenecks
agent: coder
---

# Performance Review

## Mandate

* Perform a **deep, thorough review** of performance in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify what's making the product feel slow.

## Tech Stack

* **Framework**: Next.js (SSR/ISR/Static)
* **Platform**: Vercel
* **Tooling**: Bun

## Non-Negotiables

* Core Web Vitals must meet thresholds (LCP < 2.5s, CLS < 0.1, INP < 200ms)
* Performance regressions must be detectable

## Context

Performance is a feature. Slow products feel broken, even when they're correct. Users don't read loading spinners — they leave. Every 100ms of latency costs engagement.

Don't just measure — understand. Where does time go? What's blocking the critical path? What would make the product feel instant? Sometimes small architectural changes have bigger impact than optimization.

## Driving Questions

* What makes the product feel slow to users?
* Where are the biggest bottlenecks in the critical user journeys?
* What's in the critical rendering path that shouldn't be?
* How large is the JavaScript bundle, and what's bloating it?
* What database queries are slow, and why?
* If we could make one thing 10x faster, what would have the most impact?
