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

## Review Scope

### Financial-Grade Balance System (Only if "balance/credits/wallet" exists)

* Any balance concept must be implemented as an **immutable ledger** (append-only source of truth), not a mutable balance field.
* Deterministic precision (no floats), idempotent posting, concurrency safety, transactional integrity, and auditability are required.
* Monetary flows must be currency-based and reconcilable with Stripe; credits (if used) must be governed as non-cash entitlements.

### Ledger Requirements

* Append-only transaction log
* Double-entry bookkeeping where applicable
* Idempotent transaction posting (idempotency keys)
* Concurrency-safe balance calculations
* Audit trail for all mutations
* Reconciliation with external systems (Stripe)

## Verification Checklist

- [ ] Immutable ledger pattern used (not mutable balance)
- [ ] No floating point for money
- [ ] Idempotent posting implemented
- [ ] Concurrency safety verified
- [ ] Full audit trail exists
- [ ] Reconciliation with Stripe possible
