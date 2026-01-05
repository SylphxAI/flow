---
name: uiux
description: UI/UX - design system, accessibility. Use when building interfaces.
---

# UI/UX Guideline

## Tech Stack

* **Framework**: Next.js (with Turbopack)
* **Components**: Radix UI
* **Styling**: Tailwind CSS
* **Icons**: @iconify-icon/react

## Radix UI Everywhere (Mandatory)

Radix UI is mandatory. If Radix has a primitive for it, you MUST use it.
No exceptions. No custom implementations. No alternative libraries.

Before building any interactive component, check Radix first.
If Radix provides it, use Radix. Period.

Radix primitives are the SSOT for:
- Dialogs, modals, sheets, drawers
- Dropdowns, menus, context menus
- Popovers, tooltips, hover cards
- Tabs, accordions, collapsibles
- Select, combobox, radio, checkbox, switch, toggle
- Sliders, progress, scroll areas
- Navigation menus, breadcrumbs
- Toasts, alerts, alert dialogs
- Avatar, aspect ratio, separator
- Forms, labels, toolbar
- Toggle groups, toggle buttons

Any custom implementation of something Radix already provides is a bug.
When similar UI problems arise, solve once with Radix, reuse everywhere.

## Non-Negotiables

* WCAG AA accessibility compliance
* Radix UI for all interactive components
* Tailwind CSS for styling
* @iconify-icon/react for all icons
* Responsive design for all viewports

## Context

UI/UX determines how users perceive and interact with the product. A great UI isn't just "correct" — it's delightful, intuitive, and makes complex tasks feel simple.

Radix provides accessible, unstyled primitives. Tailwind provides utility-first styling. @iconify-icon/react provides unified icon access. Together they enable consistent, accessible UI without reinventing components.

## Driving Questions

* Is every interactive component using Radix?
* Are we building custom components Radix already provides?
* Is the design consistent across the product?
* Where do users get confused or frustrated?
* What would make this experience genuinely delightful?
* How does the UI behave on mobile vs desktop?
