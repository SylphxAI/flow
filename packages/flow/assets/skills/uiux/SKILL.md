---
name: uiux
description: UI/UX - design system, accessibility. Use when building interfaces.
---

# UI/UX Guideline

## Tech Stack

* **Framework**: Next.js
* **Components**: Radix UI
* **Styling**: UnoCSS
* **Icons**: Iconify

## Radix UI Everywhere

Use Radix UI comprehensively. If Radix has a primitive for it, use it.
No custom implementations of solved problems.
No alternative component libraries.

Radix primitives are the SSOT for:
- Dialogs, modals, sheets
- Dropdowns, menus, context menus
- Popovers, tooltips, hover cards
- Tabs, accordions, collapsibles
- Select, combobox, radio, checkbox, switch
- Sliders, progress, scroll areas
- Navigation, breadcrumbs
- Toasts, alerts
- Avatar, aspect ratio, separator

When similar UI problems arise, solve once with Radix, then reuse.

## Non-Negotiables

* WCAG AA accessibility compliance
* Radix UI for all interactive components
* UnoCSS for styling (no Tailwind)
* Iconify for all icons
* Responsive design for all viewports

## Context

UI/UX determines how users perceive and interact with the product. A great UI isn't just "correct" — it's delightful, intuitive, and makes complex tasks feel simple.

Radix provides accessible, unstyled primitives. UnoCSS provides atomic styling. Together they enable consistent, accessible UI without reinventing components.

## Driving Questions

* Is every interactive component using Radix?
* Are we building custom components Radix already provides?
* Is the design consistent across the product?
* Where do users get confused or frustrated?
* What would make this experience genuinely delightful?
* How does the UI behave on mobile vs desktop?
