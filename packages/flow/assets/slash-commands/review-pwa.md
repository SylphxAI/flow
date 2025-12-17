---
name: review-pwa
description: Review PWA - offline experience, installation, engagement
agent: coder
---

# PWA Review

## Mandate

* Perform a **deep, thorough review** of PWA implementation in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify what would make the web experience feel native.

## Tech Stack

* **Framework**: Next.js
* **Platform**: Vercel

## Non-Negotiables

* Service worker must not cache personalized/sensitive/authorized content
* Cache invalidation on deploy must be correct (no stale content)

## Context

A PWA is an opportunity to deliver native-like experience without an app store. But a bad PWA is worse than no PWA — stale content, broken offline states, and confusing installation prompts erode trust.

Consider: what would make users want to install this? What should work offline? How do we handle the transition between online and offline gracefully?

## Driving Questions

* Would users actually want to install this as an app? Why or why not?
* What should the offline experience be, and what is it today?
* What happens when users go offline in the middle of something important?
* How do we handle cache invalidation without breaking the experience?
* What push notification opportunities exist that we're not using?
* What would make the installed experience better than the browser experience?
