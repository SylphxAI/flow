---
name: saas-review
description: Full-stack SaaS product review - architecture, billing, security, compliance, growth
agent: coder
---

# Global Subscription Web Product — Master Specification and Review Mandate

## 1) Mandate and Work Model

* Perform a complete end-to-end review across product, engineering, security, compliance, growth, operations, and UX.
* **Delegate work to multiple workers; you act as the final gate to improve quality.**
* Deliverables must be stated as **standards, constraints, and acceptance criteria**; avoid low-level implementation prescriptions unless required for correctness or compliance.
* **Single-pass delivery**: no roadmap, no phasing, no deferrals; deliver an integrated outcome that satisfies all requirements simultaneously.
* **Exploration required**: the review must not be limited to this document; identify additional improvements for competitiveness, completeness, usability, reliability, and monetization within fixed constraints.

## 2) Non-Negotiable Engineering Principles

* No workarounds, hacks, or TODOs.
* Feature-first with clean architecture; designed for easy extension; no "god files".
* Type-first, strict end-to-end correctness (**DB → API → UI**).
* Serverless-first and server-first; edge-compatible where feasible without sacrificing correctness, security, or observability.
* Mobile-first responsive design; desktop-second.
* Precise naming; remove dead/unused code.
* Upgrade all packages to latest stable; avoid deprecated patterns.

## 3) Fixed Platform, Stack, and Tooling (Locked)

* Platform: **Vercel**
* Framework: **Next.js** (SSR-first for indexable/discovery)
* API: **tRPC** for all internal application APIs
* i18n: **next-intl**
* DB: **Neon (Postgres)**
* ORM: **Drizzle**
* Auth: **better-auth**
* Payments: **Stripe**
* Email: **Resend**
* Observability: **Sentry**
* Analytics: **PostHog**
* Cache / rate limiting / workflows: **Upstash Redis + Upstash Workflows + QStash**
* Tooling baseline: **Bun**, **Biome**, **Bun test**
* Tag management: **GTM (marketing tags only)**

## 4) Architecture and Data Foundations

### 4.1 Boundaries, Server Enforcement, and Consistency Model (Hard Requirement)

* Define clear boundaries: domain rules, use-cases, integrations, UI.
* All authorization/entitlements are **server-enforced**; no client-trust.
* Runtime constraints (serverless/edge) must be explicit and validated.
* **Consistency model is mandatory for high-value state**: for billing, entitlements, ledger, admin privilege grants, and security posture, the system must define and enforce an explicit consistency model (source-of-truth, allowed delay windows, retry/out-of-order handling, and acceptable eventual consistency bounds).
* **Billing and access state machine is mandatory**: define and validate the mapping **Stripe state → internal subscription state → entitlements**, including trial, past_due, unpaid, canceled, refund, and dispute outcomes. UI must only present interpretable, non-ambiguous states derived from server-truth.
* **No dual-write (hard requirement)**: subscription/payment truth must be derived from Stripe-driven events; internal systems must not directly rewrite billing truth or authorize entitlements based on non-Stripe truth, except for explicitly defined admin remediation flows that are fully server-enforced and fully audited.
* **Server-truth is authoritative**: UI state must never contradict server-truth. Where asynchronous confirmation exists, UI must represent that state unambiguously and remain explainable.
* **Auditability chain is mandatory** for any high-value mutation: who/when/why, before/after state, and correlation to the triggering request/job/webhook must be recorded and queryable.

### 4.2 Drizzle Migrations (Non-Negotiable)

* Migration files must exist, be complete, and be committed.
* Deterministic, reproducible, environment-safe; linear/auditable history; no drift.
* CI must fail if schema changes are not represented by migrations.

### 4.3 Financial-Grade Balance System (Only if "balance/credits/wallet" exists)

* Any balance concept must be implemented as an **immutable ledger** (append-only source of truth), not a mutable balance field.
* Deterministic precision (no floats), idempotent posting, concurrency safety, transactional integrity, and auditability are required.
* Monetary flows must be currency-based and reconcilable with Stripe; credits (if used) must be governed as non-cash entitlements.

## 5) Internationalization, Routing, and Canonicalization (Keep Precise)

### 5.1 Supported Locales

`en`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `de`, `fr`, `pt-BR`, `it`, `nl`, `pl`, `tr`, `id`, `th`, `vi`

### 5.2 URL Strategy: Prefix Except Default

* English is default and non-prefixed.
* `/en/*` must not exist; permanently redirect to non-prefixed equivalent.
* All non-default locales are `/<locale>/...`.

### 5.3 Globalization Rules

* Intl formatting; explicit fallback rules.
* Missing translation keys must fail build.
* No hardcoded user-facing strings outside localization.

### 5.4 UGC Canonicalization

* Separate UI language from content language.
* Exactly one canonical URL per UGC resource determined by content language.
* No indexable locale-prefixed duplicates unless primary content is truly localized; otherwise redirect to canonical.
* Canonical/hreflang/sitemap must reflect only true localized variants.

## 6) Product Systems (Capabilities + Governance)

### 6.1 Membership and Account Security

* Membership is entitlement-driven and server-enforced.
* Provide a dedicated **Account Security** surface.
* **Account Security minimum acceptance**: session/device visibility and revocation; MFA/passkey management; linked identity provider management; key security event visibility (and export where applicable). All server-enforced and auditable.

### 6.2 Identity, Verification, and Sign-in

* SSO providers (minimum): **Google, Apple, Facebook, Microsoft, GitHub** (prioritize by audience).
* If provider env/secrets are missing, **hide** the login option (no broken/disabled UI).
* Allow linking multiple providers and safe unlinking; server-enforced and abuse-protected.
* Passkeys (WebAuthn) are first-class with secure enrollment/usage/recovery.
* Verification:

  * **Email verification is mandatory** baseline for high-impact capabilities.
  * **Phone verification is optional** and used as risk-based step-up (anti-abuse, higher-trust flows, recovery); consent-aware and data-minimizing.

### 6.3 Billing and Payments (Stripe)

* Support subscriptions and one-time payments as product needs require.
* **Billing state machine follows §4.1 mapping requirements**; UI must only surface explainable, non-ambiguous states aligned to server-truth.
* Webhooks must be idempotent, retry-safe, out-of-order safe, auditable; billing UI reflects server-truth state without ambiguity.
* **Webhook trust is mandatory (high-risk)**: webhook origin must be verified (signature verification and replay resistance). The Stripe **event id** must be used as the idempotency and audit correlation key; unverifiable events must be rejected and must trigger alerting.
* **Out-of-order behavior must be explicit**: all webhook handlers must define and enforce a clear out-of-order strategy (event ordering is not guaranteed even for the same subscription), and must use the §4.1 consistency model to define final-state decision rules.
* Tax/invoicing and refund/dispute handling must be behaviorally consistent with product UX and entitlement state.
* **Stripe pricing governance is mandatory (Stripe-first, not Dashboard-first)**:

  * Stripe is the system-of-record for products, prices, subscriptions, invoices, and disputes; internal systems must not contradict Stripe truth.
  * Pricing changes must be performed by creating new Stripe Prices and updating the "active sellable price" policy; historical prices must remain immutable for existing subscriptions unless an approved migration is executed.
  * Default pricing change policy is **grandfathering**: existing subscribers keep their current price; new customers use the currently active sellable price.
  * An operational-grade Pricing Admin must exist to manage creation of new Stripe Prices, activation/deactivation of sellable prices, and (optionally) controlled bulk subscription migrations; all actions must be governed by RBAC, step-up controls, and audit logs.
  * Stripe Dashboard is treated as monitoring/emergency access; non-admin Stripe changes must be detectable (drift), alertable, and remediable.

### 6.4 Admin Platform (Operational-Grade)

* Baseline: RBAC (least privilege), audit logs, feature flags governance, optional impersonation with safeguards and auditing.
* Admin bootstrap must not rely on file seeding:

  * Use a secure, auditable **first-login allowlist** for the initial SUPER_ADMIN.
  * Permanently disable bootstrap after completion.
  * All privilege grants must be server-enforced and recorded in the audit log.
  * The allowlist must be managed via secure configuration (environment/secret store), not code or DB seeding.
* **Configuration management is mandatory**:

  * All **non-secret** product-level configuration must be manageable via admin (server-enforced), with validation and change history.
  * Secrets/credentials are environment-managed only; admin may expose safe readiness/health visibility, not raw secrets.
* **Admin analytics and reporting are mandatory**:

  * Provide comprehensive dashboards/reports for business, growth, billing, referral, support, and security/abuse signals, governed by RBAC.
  * Reporting must be consistent with system-of-record truth (billing/webhooks, ledger, entitlements) and auditable when derived from privileged actions.
* **Admin operational management is mandatory**:

  * Tools for user/account management, entitlements/access management, lifecycle actions, and issue resolution workflows.
  * Actions affecting access, money/credits, or security posture require appropriate step-up controls and must be fully auditable; reversibility must follow domain rules.

### 6.5 Support and Communications

* Support/Contact surface must be discoverable, localized, WCAG AA, SEO-complete, privacy-safe, and auditable where relevant.
* Newsletter subscription/preferences must be consent-aware; unsubscribe enforcement must be reliable.

### 6.6 Referral (Anti-Abuse Baseline Required)

* Referral must be measurable, abuse-resistant, and governed:

  * attribution semantics, reward lifecycle governance (including revocation/clawbacks), anti-fraud, admin reporting/audit,
  * localized and instrumented.
* **Referral anti-fraud minimum baseline is mandatory**:

  * define a minimum set of risk signals and enforcement measures, including velocity controls, account/device linkage posture, risk-tiered enforcement, reward delay/hold/freeze, clawback conditions, and an auditable manual review/appeal posture where applicable.

## 7) UX, Design System, and Guidance

* Design-system driven UI (tokens), dark/light theme, WCAG AA, CLS-safe, responsive.
* Iconify; no emoji in UI content.
* Guidance is mandatory for all user-facing features and monetization flows: discoverable, clear, dismissible with re-entry, localized and measurable, governed by eligibility and frequency controls.

## 8) Web Platform: SEO, PWA, Performance

* SEO-first + SSR-first for indexable/discovery.
* Required: metadata + Open Graph + favicon; canonical; hreflang + x-default; schema.org; sitemap.xml; robots.txt.
* PWA: manifest, service worker with explicit cache correctness; push notifications using VAPID where applicable.
* **Service Worker caching boundary is mandatory**: service worker must not cache personalized/sensitive/authorized content. Authenticated and entitlement-sensitive routes must have explicit cache-control and SW rules, and must be validated by tests to prevent stale or unauthorized state exposure.
* Performance must be **measurable and regression-resistant**:

  * define and enforce performance budgets for key journeys,
  * define caching boundaries and correctness requirements across SSR/ISR/static and service worker behavior,
  * monitor Core Web Vitals and server latency; alert on regressions.

## 9) Growth System (Onboarding, Share/Viral, Retention)

* The review must produce a coherent, measurable growth system for activation, sharing/virality, and retention, aligned with compliance and anti-abuse constraints.
* Onboarding must be outcome-oriented, localized, accessible, and instrumented.
* Sharing/virality must be consent-aware, abuse-resistant, and measurable end-to-end.
* Retention must be intentionally engineered, monitored, and protected against regressions.

## 10) Trust, Safety, Security, Privacy, Compliance, and Operability

* **Behavioral consistency is required**: policy and disclosures must match actual behavior across UI, data handling, logging/observability, analytics, support operations, and marketing tags; mismatches are release-blocking.
* **Consent governance is mandatory (release-blocking)**:

  * Analytics (PostHog) and marketing/newsletter communications (Resend) must be governed by consent and user preferences.
  * Marketing tags (including GTM and Google Ads) must not load or fire without the appropriate consent.
  * Without consent, tracking and marketing sends must not occur, except for strictly necessary service communications.
  * Event schemas and attributes must follow data minimization, with explicit PII classification and handling rules.
* **Marketing attribution and conversions are governed (hard requirement)**:

  * GTM may be used **only** for marketing tags and attribution; it must not become the primary product analytics system (PostHog remains the product analytics source).
  * Conversions representing monetary value or entitlement changes must be **server-truth aligned**, **idempotent**, and **deduplicated**; client-side tags may exist for attribution but must not become the authoritative source of billing/entitlement truth.
* **PII and sensitive data controls apply everywhere (hard requirement)**:

  * PII rules apply to logs, Sentry, PostHog, support tooling, email systems, and marketing tags/conversion payloads.
  * A consistent scrubbing/redaction standard must exist, and must be covered by automated tests to prevent leakage to third parties.
* Data lifecycle must be explicit and enforceable:

  * define deletion/deactivation semantics, deletion propagation, export where applicable, DR/backup posture aligned with retention,
  * **define data classification, retention periods, deletion propagation to third-party processors, and explicit exceptions** (legal/tax/anti-fraud), and ensure external disclosures match behavior.
* Abuse/fraud posture (especially referral/UGC/support): define prevention and enforcement measures; risk signals trigger protective actions and step-up verification where appropriate.
* Account/session security management: session/device visibility + revocation, security event visibility, recovery governance (including support-assisted recovery) with strict audit logging; step-up for sensitive actions.
* **Async/workflows are governed (hard requirement)**:

  * define idempotency and deduplication posture,
  * define controlled retries/backoff,
  * **dead-letter handling must exist and be observable and operable**,
  * **safe replay must be supported**,
  * side-effects (email/billing/ledger/entitlements) must be governed such that they are either proven effectively-once or safely re-entrant without duplicated economic/security consequences.
* Release safety: define safe rollout posture with backward compatibility and rollback expectations for billing/ledger/auth changes.
* **Observability and alerting are mandatory (hard requirement)**:

  * structured logs and correlation IDs must exist end-to-end (request/job/webhook) with consistent traceability,
  * define critical-path SLO/SLI posture,
  * define actionable alerts for webhook failures, ledger/entitlement drift, authentication attacks, abuse spikes, and drift detection.
* **Configuration and secrets governance is mandatory**:

  * required configuration must fail-fast at build/startup,
  * strict environment isolation (dev/stage/prod),
  * rotation and incident remediation posture must be auditable and exercisable.
* **Drift detection must be remediable (hard requirement)**:

  * drift alerts must have a defined remediation playbook (automated fix or operator workflow),
  * each remediation must be auditable and support post-incident traceability.
* Security baseline:

  * OWASP Top 10:2025 taxonomy; OWASP ASVS (L2/L3) verification baseline.
  * Password UX masked + temporary reveal; no plaintext passwords in logs/returns/storage/telemetry.
  * MFA for Admin/SUPER_ADMIN; step-up for high-risk.
  * Risk-based anti-bot for auth and high-cost endpoints; integrate rate limits + consent gating.
  * Baseline controls: CSP/HSTS/headers, CSRF where applicable, Upstash-backed rate limiting, PII scrubbing, supply-chain hygiene, measurable security.
  * **Security controls must be verifiable**: CSP/HSTS/security headers and CSRF (where applicable) must be covered by automated checks or security tests and included in release gates.

## 11) Review Requirements: Explore Beyond the Spec

* Feature design review: define success criteria, journeys, state model, auth/entitlements, instrumentation; propose competitiveness improvements within constraints.
* Pricing/monetization review: packaging/entitlements, lifecycle semantics, legal/tax/invoice implications; propose conversion/churn improvements within constraints.
* Competitive research: features, extensibility, guidance patterns, pricing/packaging norms; convert insights into testable acceptance criteria.

## 12) Delivery Gates and Completion

* CI must block merges/deploys when failing:

  * Biome lint/format, strict TS typecheck, unit + E2E (**Bun test**), build,
  * migration integrity checks,
  * i18n missing-key checks,
  * **SEO/i18n/canonicalization verification** covering `/en/*` non-existence, hreflang/x-default, sitemap containing only true variants, UGC canonical redirects, and locale routing invariants,
  * **performance budget verification** for key journeys (including Core Web Vitals-related thresholds) with release-blocking regression detection,
  * **security verification** for CSP/HSTS/security headers and CSRF (where applicable),
  * **consent gating verification** for analytics/marketing tags/newsletter eligibility and firing rules.
* **All gates above must be enforced by automated tests or mechanized checks (non-manual); manual verification does not satisfy release gates.**
* Build/startup must fail-fast when required configuration/secrets are missing or invalid for the target environment.
* Operability gates must be met for release:

  * observability and alerting are configured for critical anomalies,
  * workflow dead-letter handling is operable, visible, and supports controlled replay.
* Complete only when all sections are satisfied without deferral, system is integrated/buildable/testable/deployable, and there are no TODOs/hacks/workarounds/dead/unused code.
