---
name: review-data-architecture
description: Review data architecture - boundaries, consistency model, server enforcement
agent: coder
---

# Data Architecture Review

## Mandate

* Perform a **deep, thorough review** of data architecture in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for consistency, reliability, and scalability.

## Tech Stack

* **API**: tRPC
* **Framework**: Next.js
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Review Scope

### Boundaries, Server Enforcement, and Consistency Model (Hard Requirement)

* Define clear boundaries: domain rules, use-cases, integrations, UI.
* All authorization/entitlements are **server-enforced**; no client-trust.
* Runtime constraints (serverless/edge) must be explicit and validated.
* **Consistency model is mandatory for high-value state**: for billing, entitlements, ledger, admin privilege grants, and security posture, the system must define and enforce an explicit consistency model (source-of-truth, allowed delay windows, retry/out-of-order handling, and acceptable eventual consistency bounds).
* **Billing and access state machine is mandatory**: define and validate the mapping **Stripe state → internal subscription state → entitlements**, including trial, past_due, unpaid, canceled, refund, and dispute outcomes. UI must only present interpretable, non-ambiguous states derived from server-truth.
* **No dual-write (hard requirement)**: subscription/payment truth must be derived from Stripe-driven events; internal systems must not directly rewrite billing truth or authorize entitlements based on non-Stripe truth, except for explicitly defined admin remediation flows that are fully server-enforced and fully audited.
* **Server-truth is authoritative**: UI state must never contradict server-truth. Where asynchronous confirmation exists, UI must represent that state unambiguously and remain explainable.
* **Auditability chain is mandatory** for any high-value mutation: who/when/why, before/after state, and correlation to the triggering request/job/webhook must be recorded and queryable.

## Key Areas to Explore

* How well are domain boundaries defined and enforced?
* Where does client-side trust leak into authorization decisions?
* What consistency guarantees exist and are they sufficient?
* How does the system handle eventual consistency edge cases?
* What would break if a webhook is processed out of order?
