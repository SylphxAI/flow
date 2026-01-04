---
name: database
description: Database - schema, indexes, migrations. Use when working with databases.
---

# Database Guideline

## Tech Stack

* **Database**: Neon (Postgres)
* **ORM**: Drizzle
* **Migrations**: Drizzle Kit

## Non-Negotiables

* Migration files must exist, be complete, and be committed
* CI must fail if schema changes aren't represented by migrations
* No schema drift between environments
* All queries through Drizzle (no raw SQL unless necessary)

## Schema Design

```typescript
// Drizzle schema is SSOT
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations explicit
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}))
```

## Context

The database schema is the foundation everything else is built on. A bad schema creates friction for every feature built on top of it. Schema changes are expensive and risky — get the design right.

Drizzle is the SSOT for database access. Type-safe, end-to-end.

## Driving Questions

* Is all database access through Drizzle?
* Are migrations complete and committed?
* What constraints are missing that would prevent invalid state?
* Where are missing indexes causing slow queries?
* How does the schema handle data lifecycle?
