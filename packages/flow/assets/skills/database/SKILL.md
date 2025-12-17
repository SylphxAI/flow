---
name: database
description: Database - schema, indexes, migrations. Use when working with databases.
---

# Database Guideline

## Tech Stack

* **Database**: Neon (Postgres)
* **ORM**: Drizzle

## Non-Negotiables

* Migration files must exist, be complete, and be committed
* CI must fail if schema changes aren't represented by migrations
* No schema drift between environments

## Context

The database schema is the foundation everything else is built on. A bad schema creates friction for every feature built on top of it. Schema changes are expensive and risky — it's worth getting the design right.

Consider not just "does the schema work?" but "does this schema make the right things easy?" Are the relationships correct? Are we storing data in ways that will be painful to query? Are we missing constraints that would prevent bugs?

## Driving Questions

* If we were designing the schema from scratch, what would be different?
* Where are missing indexes causing slow queries we haven't noticed yet?
* What data relationships are awkward or incorrectly modeled?
* How does the schema handle data lifecycle (soft deletes, archival, retention)?
* What constraints are missing that would prevent invalid state?
* Where will the current schema hurt at 10x or 100x scale?
