---
name: UI/UX Guidelines
description: Modern UI conventions — Base UI + Tailwind v4 CSS-first + Motion v12, token-driven, accessible, agent-friendly
---

# UI / UX — 2027 SOTA

Apply when designing or updating any product surface. Every interface ships with the same standards: token-driven, accessible-by-default, perceptually fluid, semantically named.

## Stack

- **Primitives** — **Base UI** (headless, accessible, behavior-only). Never shadcn/Radix/Headless UI/Mantine/MUI/Chakra.
- **Styling** — **Tailwind CSS v4, CSS-first**. `@import "tailwindcss"` + `@theme` in one stylesheet. **No `tailwind.config.js`.** Custom utilities via `@utility`, plugins via `@plugin`.
- **Animation** — **Motion v12**. No CSS keyframes for stateful animation. No Framer Motion (legacy name).
- **Icons** — Lucide (single source, tree-shaken).
- **Forms** — React Hook Form + Effect Schema resolver.
- **Tables / Lists** — TanStack Table + TanStack Virtual.

## Design Tokens — SSOT

All visual constants live in `@theme` as CSS custom properties. **Components reference tokens, never literals.**

```
--color-bg / --color-bg-subtle / --color-fg / --color-fg-muted
--color-accent / --color-accent-fg / --color-danger / --color-success
--radius-sm / --radius-md / --radius-lg
--space-1 … --space-12   (4px scale)
--font-sans / --font-mono
--shadow-sm / --shadow-md / --shadow-lg
--motion-fast / --motion-base / --motion-slow
```

- Same tokens drive **light/dark** and **brand variants** via CSS custom-property switching — no JS theme provider, no class soup.
- Color palettes in **OKLCH** (perceptually uniform, future-proof gamut).
- Hardcoded `#hex` / `rgb()` / arbitrary `px` values are **anti-patterns** — surface a token instead.

## Visual System

- **Color** — token-driven. Adaptive light/dark via `@media (prefers-color-scheme)` against the same `@theme` tokens. WCAG AA (≥4.5:1 body, ≥3:1 large text). One accent for primary CTAs.
- **Shape** — radii from `--radius-*`. Subtle elevation via `--shadow-*`. No mixing radii/shadows ad-hoc.
- **Typography** — fluid type scale (`clamp(...)`). Body 14–16px, line-height ≥1.5. Inter / Geist / SF Pro for UI; mono via `--font-mono`.
- **Spacing** — only the 4px scale. Never `p-[13px]`.
- **Layout** — `@container` queries first, viewport queries second. Components are responsive to *their* container, not the viewport.

## Motion

- Durations from `--motion-*` (fast 150ms / base 250ms / slow 400ms).
- Easing: spring or `cubic-bezier(0.2, 0.8, 0.2, 1)`. Never linear for UI motion.
- Respect `prefers-reduced-motion` everywhere — Motion v12 has built-in support; use it.
- Stateful animation (enter / exit / layout / shared element) → Motion. Decorative loops only → CSS.

## Interaction Patterns

- **Optimistic UI** for every mutation. Roll back on Effect failure.
- **Skeleton + streaming** for loads, not spinners. Tie to RSC Suspense / React Query placeholders.
- **Inline editing** over modals where possible.
- **Keyboard-first** — every action reachable without mouse. Visible `:focus-visible` rings on all interactive elements.
- **Undo over confirm** — destructive actions get 5s undo toast (Sonner) instead of confirm dialog.
- **Composer pinned** at viewport bottom for chat/conversational surfaces.

## Accessibility (non-negotiable)

- Semantic HTML first; ARIA only when semantics can't express it.
- Base UI handles roles / focus management / keyboard — don't override.
- All interactive elements ≥44×44px tap target.
- Form fields: visible label (never placeholder-as-label), error linked via `aria-describedby`, validation messages from Effect Schema.
- Test every flow with keyboard only. Run `axe` + Lighthouse a11y ≥95 in CI.

## Agent-First UI Conventions

- **Predictable, semantic class composition** — utility order follows a fixed convention (layout → spacing → color → state) so agents diff cleanly.
- **Component name = file name = export name.** No barrel renames.
- **Props use domain language** (`invoiceStatus`, not `variant`). Variants exposed as discriminated unions, not stringly-typed.
- **Generated component galleries** (Storybook / Ladle) — every primitive has a story, agents read stories to learn the API.
- **Schema-derived forms / tables / filters** — never hand-write CRUD UI; derive from Effect Schema.

## Validation Checklist

- [ ] Zero hardcoded colors / spacing / radii / shadows — all tokens
- [ ] Light + dark + reduced-motion all pass visually
- [ ] Keyboard-only flow works end-to-end
- [ ] axe / Lighthouse a11y ≥95
- [ ] Container queries used where component is reused at multiple sizes
- [ ] No CSS file outside global tokens + `@layer` extensions — utilities cover the rest
- [ ] Every animation respects `prefers-reduced-motion`

## Forbidden

- ❌ `tailwind.config.js` (use CSS `@theme`)
- ❌ `tailwind-merge` / `clsx` chains hiding intent — extract a Base UI primitive
- ❌ Inline `style={{...}}` for anything except dynamic position/transform values
- ❌ Hardcoded color / px / radius
- ❌ shadcn / Radix / Headless UI / Mantine / MUI / Chakra (Base UI is SSOT)
- ❌ Framer Motion (use Motion v12)
- ❌ CSS-in-JS runtime libs (Emotion / styled-components / Stitches)
- ❌ Placeholder-as-label, div-as-button, missing focus rings
