---
name: review-uiux
description: Review UI/UX - design system, tokens, accessibility, guidance
agent: coder
---

# UI/UX Review

## Mandate

* Perform a **deep, thorough review** of UI/UX in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify usability improvements and design inconsistencies.

## Tech Stack

* **Framework**: Next.js
* **Icons**: Iconify

## Review Scope

### UX, Design System, and Guidance

* Design-system driven UI (tokens)
* Dark/light theme support
* WCAG AA compliance
* CLS-safe (no layout shifts)
* Responsive design (mobile-first, desktop-second)
* Iconify for icons; no emoji in UI content

### Guidance Requirements

* Guidance is mandatory for all user-facing features and monetization flows:
  * Discoverable
  * Clear
  * Dismissible with re-entry
  * Localized and measurable
  * Governed by eligibility and frequency controls

## Key Areas to Explore

* How consistent is the design system across the application?
* What accessibility issues exist and affect real users?
* Where do users get confused or drop off in key flows?
* How does the mobile experience compare to desktop?
* What guidance/onboarding is missing for complex features?
* How does the dark/light theme implementation handle edge cases?
