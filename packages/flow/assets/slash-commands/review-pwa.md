---
name: review-pwa
description: Review PWA - manifest, service worker, caching, push notifications
agent: coder
---

# PWA Review

## Mandate

* Perform a **deep, thorough review** of PWA implementation in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify engagement opportunities and offline capabilities.

## Tech Stack

* **Framework**: Next.js
* **Platform**: Vercel

## Review Scope

### PWA Requirements

* Manifest file complete and valid
* Service worker with explicit cache correctness
* Push notifications using VAPID where applicable

### Service Worker Caching Boundary (Mandatory)

* Service worker must not cache personalized/sensitive/authorized content
* Authenticated and entitlement-sensitive routes must have explicit cache-control and SW rules
* Must be validated by tests to prevent stale or unauthorized state exposure

## Key Areas to Explore

* Does the PWA meet installation criteria on all platforms?
* What is the offline experience and how can it be improved?
* How does the service worker handle cache invalidation on deploys?
* What push notification capabilities exist and how are they used?
* Are there any caching bugs that expose stale or unauthorized content?
* How does the PWA experience compare to native app expectations?
