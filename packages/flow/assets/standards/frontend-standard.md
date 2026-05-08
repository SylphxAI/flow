# Frontend Standard

Build the actual product experience first unless explicitly asked for a landing page. Preserve the existing design system when one exists.

For new UI, make it intentional, accessible, responsive, and domain-specific. Use Base UI primitives, Tailwind v4 tokens from `@theme`, Lucide icons, Motion v12, stable component dimensions, and responsive layout constraints.

Respect accessibility, i18n, and motion requirements. Product UI should avoid hardcoded user-facing strings when the repo uses i18n. Motion must respect reduced-motion preferences. Responsive layouts must be stable across mobile and desktop.

Avoid generic AI-looking layouts, nested cards, decorative gradient blobs, one-note palettes, text overflow, overlapping UI, and visible instructional copy that explains obvious interactions.

Operational SaaS and enterprise tools should prioritize dense, scannable, repeatable workflows over marketing-style layouts. Games and expressive consumer experiences may be more visual and animated, but must still be usable and responsive.

Use stable dimensions for boards, grids, toolbars, counters, controls, and repeated UI so hover states, labels, icons, pieces, loading text, or dynamic content cannot resize or shift the layout.

For meaningful frontend changes, validate the rendered UI when practical. Check desktop and mobile behavior, text overflow, overlap, missing assets, and reduced-motion behavior.
