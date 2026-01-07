---
name: data-modeling
description: Data modeling - entities, relationships, schemas. Use when designing data structures.
---

# Data Modeling Guideline

## Tech Stack

* **API**: tRPC
* **Framework**: Next.js (with Turbopack)
* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* All authorization must be server-enforced (no client-trust)
* Platform is source of truth — third-party services sync FROM platform
* UI must never contradict server-truth
* High-value mutations must have audit trail (who/when/why/before/after)

## Context

Data modeling is conceptual — entities, relationships, domain boundaries. Physical implementation (indexes, migrations, query performance) lives in `database`.

Consider: what are the real-world entities? How do they relate? What invariants must hold? What will break when requirements change?

## Driving Questions

* If we were designing this from scratch, what would be different?
* Where will the current model break as the product scales?
* What implicit assumptions are waiting to cause bugs?
* Where is complexity hiding that makes the system hard to reason about?
* What domain boundaries are we violating?
