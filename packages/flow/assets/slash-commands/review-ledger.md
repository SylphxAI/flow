---
name: review-ledger
description: Review ledger - financial-grade balance system, immutable ledger
agent: coder
---

# Ledger Review

## Mandate

* Perform a **deep, thorough review** of any balance/credits/wallet system in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for accuracy, auditability, and reconciliation.

## Tech Stack

* **Payments**: Stripe
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Review Scope

### Financial-Grade Balance System (Only if "balance/credits/wallet" exists)

* Any balance concept must be implemented as an **immutable ledger** (append-only source of truth), not a mutable balance field.
* Deterministic precision (no floats), idempotent posting, concurrency safety, transactional integrity, and auditability are required.
* Monetary flows must be currency-based and reconcilable with Stripe; credits (if used) must be governed as non-cash entitlements.

## Key Areas to Explore

* Is there a balance/credits system and how is it implemented?
* If mutable balances exist, what are the risks and how to migrate to immutable ledger?
* How does the system handle concurrent transactions?
* What is the reconciliation process with Stripe?
* How are edge cases handled (refunds, disputes, partial payments)?
* What audit trail exists for financial mutations?
