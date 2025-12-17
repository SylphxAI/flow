---
name: review-database
description: Review database - Drizzle migrations, schema drift, CI gates
agent: coder
---

# Database Review

## Mandate

* Perform a **deep, thorough review** of database architecture in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for performance, reliability, and maintainability.

## Tech Stack

* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Review Scope

### Drizzle Migrations (Non-Negotiable)

* Migration files must exist, be complete, and be committed.
* Deterministic, reproducible, environment-safe; linear/auditable history; no drift.
* CI must fail if schema changes are not represented by migrations.

## Key Areas to Explore

* Is the schema well-designed for the domain requirements?
* Are there missing indexes that could improve query performance?
* How are database connections pooled and managed?
* What is the backup and disaster recovery strategy?
* Are there any N+1 query problems or inefficient access patterns?
* How does the schema handle soft deletes, auditing, and data lifecycle?
