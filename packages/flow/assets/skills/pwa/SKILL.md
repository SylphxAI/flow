---
name: pwa
description: PWA - native app parity, offline-first, engagement. Use when building installable web apps.
---

# PWA Guideline

## Tech Stack

* **Framework**: Next.js
* **Service Worker**: Serwist (Next.js integration)
* **Platform**: Vercel

## Non-Negotiables

* Service worker must not cache personalized/sensitive/authorized content
* Cache invalidation on deploy must be correct (no stale content)
* Offline experience must be functional, not just a fallback page
* Installation prompt must be contextual (after value demonstrated)

## Native App Parity Checklist

### 🎯 Retention (High Priority)

| Capability | API | Purpose |
|------------|-----|---------|
| True offline | Cache API + localStorage | Full functionality without network |
| App icon badge | Badging API | Show unread/pending count |
| Local notifications | Notifications API | Scheduled reminders without server |
| App shortcuts | manifest.json `shortcuts` | Long-press quick actions |
| Push notifications | Web Push API | Server-triggered engagement |

### 🎨 Native Feel (Medium Priority)

| Capability | API | Purpose |
|------------|-----|---------|
| Pull-to-refresh | Touch events + CSS | Native refresh gesture |
| View transitions | View Transitions API | Smooth page navigation |
| Bottom sheets | CSS + touch gestures | Native modal pattern |
| Skeleton loading | CSS + React Suspense | Perceived performance |
| Swipe gestures | Touch events | Navigate between views |
| Haptic feedback | Vibration API | Tactile confirmation |
| Sound effects | Web Audio API | Audio feedback |

### 📱 Polish (Lower Priority)

| Capability | API | Purpose |
|------------|-----|---------|
| Wake lock | Screen Wake Lock API | Prevent sleep during activity |
| Orientation lock | Screen Orientation API | Lock portrait/landscape |
| Reduced motion | `prefers-reduced-motion` | Accessibility compliance |
| Picture-in-Picture | PiP API | Floating video/timer |
| Share | Web Share API | Native share sheet |

## Context

PWA goal: users forget they're in a browser. The gap between "website" and "app" is measured in micro-interactions — haptics, gestures, offline resilience, and engagement hooks.

A bad PWA is worse than no PWA. But a great PWA can match 90% of native with 10% of the effort.

## Driving Questions

* What breaks when the user goes offline mid-action?
* What would make users install this instead of bookmarking?
* Which native gestures (swipe, pull, long-press) are missing?
* What local notifications would drive daily engagement?
* Where does the app feel "webby" instead of native?
* What's the first thing users see when they open the installed app?
