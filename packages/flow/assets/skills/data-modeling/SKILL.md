---
name: data-modeling
description: Data modeling - entities, relationships, schemas. Use when designing data structures.
---

# Data Modeling Guideline

## Tech Stack

* **API**: tRPC
* **Framework**: Next.js
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* All authorization must be server-enforced (no client-trust)
* Platform is source of truth for billing/entitlements (Stripe syncs FROM platform)
* UI must never contradict server-truth
* High-value mutations must have audit trail (who/when/why/before/after)

## Platform-Led Data Flow

```
Platform State (SSOT)
        ↓
  Third-party services sync FROM platform
        ↓
  Webhooks confirm sync success
        ↓
  Never reverse the flow
```

Platform defines products, prices, entitlements. External services reflect platform state.

## Context

Data architecture determines what's possible and what's painful. Good architecture makes new features easy; bad architecture makes everything hard. The question isn't "does it work today?" but "will it work when requirements change?"

Consider the boundaries between domains, the flow of data through the system, and the consistency guarantees at each step. Where are implicit assumptions that will break? Where is complexity hidden that will cause bugs?

## Driving Questions

* If we were designing this from scratch, what would be different?
* Where will the current architecture break as the product scales?
* What implicit assumptions are waiting to cause bugs?
* How do we know when state is inconsistent, and how do we recover?
* Where is complexity hiding that makes the system hard to reason about?
* What architectural decisions are we avoiding that we shouldn't?
