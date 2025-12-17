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

## Review Scope

### Drizzle Migrations (Non-Negotiable)

* Migration files must exist, be complete, and be committed.
* Deterministic, reproducible, environment-safe; linear/auditable history; no drift.
* CI must fail if schema changes are not represented by migrations.

### Database Best Practices

* Schema design follows normalization principles where appropriate
* Indexes exist for commonly queried columns
* Foreign key constraints are properly defined
* No orphaned tables or columns
* Proper use of data types (no stringly-typed data)
* Timestamps use consistent timezone handling

## Verification Checklist

- [ ] All migrations committed and complete
- [ ] No schema drift detected
- [ ] CI blocks on migration integrity
- [ ] Indexes cover common queries
- [ ] Foreign keys properly defined
- [ ] Data types appropriate
