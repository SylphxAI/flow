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

## Review Scope

### PWA Requirements

* Manifest file complete and valid
* Service worker with explicit cache correctness
* Push notifications using VAPID where applicable

### Service Worker Caching Boundary (Mandatory)

* Service worker must not cache personalized/sensitive/authorized content
* Authenticated and entitlement-sensitive routes must have explicit cache-control and SW rules
* Must be validated by tests to prevent stale or unauthorized state exposure

### PWA Best Practices

* Installable (meets PWA criteria)
* Offline fallback page
* App icons (all sizes)
* Splash screen configured
* Theme color defined
* Start URL configured
* Display mode appropriate
* Cache versioning strategy
* Cache invalidation on deploy

## Verification Checklist

- [ ] Valid manifest.json
- [ ] Service worker registered
- [ ] SW doesn't cache auth content
- [ ] Cache-control headers correct
- [ ] Push notifications work (if applicable)
- [ ] Installable on mobile
- [ ] Offline fallback exists
- [ ] Cache invalidation tested
