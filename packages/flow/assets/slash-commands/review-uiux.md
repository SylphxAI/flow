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

### Design System Best Practices

* Consistent spacing scale
* Typography scale defined
* Color tokens (semantic, not hardcoded)
* Component library documented
* Motion/animation guidelines
* Error state patterns
* Loading state patterns
* Empty state patterns

## Verification Checklist

- [ ] Design tokens used consistently
- [ ] Dark/light theme works
- [ ] WCAG AA verified
- [ ] No CLS issues
- [ ] Mobile-first responsive
- [ ] No emoji in UI
- [ ] Guidance present on key flows
- [ ] Guidance is dismissible + re-entrable
