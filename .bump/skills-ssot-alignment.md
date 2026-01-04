# Skills SSOT Alignment

Updated all skills to align with platform-led SSOT principles:

## Platform-Led Changes
- billing: Platform is source of truth, Stripe syncs FROM platform
- pricing: Platform defines prices, syncs to Stripe
- ledger: Platform ledger is source of truth
- data-modeling: Platform-led data flow

## Tech Stack Alignment
- uiux: Radix UI + UnoCSS (not Tailwind)
- admin: INITIAL_SUPERADMIN_EMAIL bootstrap
- auth: Better Auth as SSOT
- database: Drizzle as SSOT
- i18n: next-intl as SSOT, bundle strategy
- storage: Vercel Blob as SSOT

## Updates
- account-security: Added re-authentication flow
- observability: Simplified guidelines
