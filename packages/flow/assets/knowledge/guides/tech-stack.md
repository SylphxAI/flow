---
name: Tech Stack (2027 SOTA)
description: Opinionated stack — Effect-TS + Effect Schema (SSOT) + Hono + hono-openapi, modular clean architecture, feature-first, pure FP
---

# Technical Stack — 2027 SOTA

Production-ready, commercial-grade. Every layer designed for SSOT, SoC, composability, and end-to-end type safety. No workarounds, no stubs.

## Architecture Principles

**Modular Clean Architecture** — strict inward dependency:
```
infrastructure  →  application  →  domain
   (adapters)       (use-cases)     (pure)
```
- **domain/** — pure types, Effect Schema, business invariants. Zero framework deps.
- **application/** — use-cases as `Effect` programs, dependencies declared via `Context.Tag`.
- **infrastructure/** — Hono routes, Drizzle repositories, third-party adapters, wired as `Layer`s.
- **ui/** — React components, hooks, presentation logic.

**Feature-first layout** — organize by bounded context, not by technical layer:
```
src/features/
├── billing/
│   ├── domain/        # schema.ts, errors.ts, policies.ts
│   ├── application/   # use-cases.ts, services.ts (Context.Tag)
│   ├── infrastructure/ # routes.ts, repo.drizzle.ts, stripe.adapter.ts
│   └── ui/            # components, hooks
├── auth/
└── users/
```
Cross-feature communication via published contracts only — never reach across `features/*/` internals.

**Functional Programming everywhere:**
- Pure functions by default, immutable data, expressions over statements
- Side effects modelled as `Effect`, isolated at the infrastructure boundary
- Declarative pipelines via `pipe`, `Effect.gen`, `Match`

## Schema — Single Source of Truth

**Effect Schema** is the only place a shape is defined. Everything else is derived:

```ts
import { Schema } from "effect"

export const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+$/),
  Schema.brand("Email"),
)
export type Email = typeof Email.Type

export const User = Schema.Struct({
  id: UserId,
  email: Email,
  createdAt: Schema.Date,
})
export type User = typeof User.Type
```

Derived from this single definition:
- TypeScript types (`typeof User.Type`)
- HTTP request/response validators (`hono-openapi` accepts Effect Schema directly via Standard Schema)
- OpenAPI spec
- `hc` client types
- DB row decoder (`Schema.decodeUnknown`)
- Form validators (react-hook-form resolver)
- Env-var parsing

**Never** restate a shape in a TypeScript interface, manual type, or parallel Zod definition.

## Business Logic — Effect-TS

Every effectful path (I/O, async, error, dependency, resource) is an `Effect`. No raw `Promise` or `try/catch` in domain or application layers.

```ts
import { Effect, Context, Layer, Data } from "effect"

// Typed errors
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: UserId }> {}
class EmailTaken    extends Data.TaggedError("EmailTaken")<{ email: Email }> {}

// Service contract (in application layer)
class UserRepo extends Context.Tag("UserRepo")<UserRepo, {
  findByEmail: (email: Email) => Effect.Effect<User | null>
  insert:      (input: NewUser) => Effect.Effect<User>
}>() {}

// Use-case
export const createUser = (input: NewUser) =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const exists = yield* repo.findByEmail(input.email)
    if (exists) return yield* new EmailTaken({ email: input.email })
    return yield* repo.insert(input)
  })

// Wire in infrastructure
const UserRepoLive = Layer.effect(UserRepo, /* drizzle impl */)
```

- Errors are **values in the `E` channel** — handled exhaustively via `Effect.catchTags` / `Match`
- Dependencies are **values in the `R` channel** — provided by `Layer` at the edge
- Tests swap real Layers for fake ones — zero module mocking

## Stack

| Layer | Choice | Why |
|---|---|---|
| **Runtime** | Bun | Native TS, fast, single toolchain |
| **Framework** | Next.js 16+ App Router | RSC, streaming, edge-ready |
| **Schema (SSOT)** | Effect Schema | One definition → types, validators, OpenAPI, DB codecs |
| **Business logic** | Effect-TS | Typed errors, dependency injection, testability, composability |
| **HTTP** | Hono | Battle-tested, stable, Effect-compatible |
| **API contracts** | hono-openapi | Standard Schema — accepts Effect Schema directly |
| **Type-safe client** | `hc` (split per entity, <100 routes each) | End-to-end types without code generation |
| **Client data** | React Query | Server-state caching |
| **DB queries** | Drizzle ORM | Typed query builder; queries only |
| **DB schema/migrations** | Atlas | Declarative `schema.sql`/`.hcl` SSOT, automatic diffing |
| **DB** | Neon PostgreSQL | Serverless Postgres, branching |
| **Long-running** | Modal | Serverless containers |
| **Workflows** | Upstash Workflow | Durable execution |
| **Hosting** | Vercel | Next.js native |
| **Blob** | Vercel Blob | Integrated storage |
| **UI** | Base UI + Tailwind v4 (CSS-first) + Motion v12 | Headless primitives, atomic styling, animation |
| **Forms** | React Hook Form + Effect Schema resolver | SSOT validation |
| **Tables/Lists** | TanStack Table + TanStack Virtual | Virtualized at scale |
| **Auth** | Better Auth | Passkey-first, 2FA |
| **Email** | Resend | Modern, deliverable |
| **i18n** | Next-intl (per-feature locale files, never one big bundle) | Tree-shakable |
| **Logging** | Pino + Effect Tracer | Structured logs + native tracing |
| **AI** | AI SDK v6+ | Provider-agnostic |
| **Lint/Format** | Biome | One tool, fast |
| **Build** | Bunup | Zero-config |
| **Tests** | Bun test + TestClock/TestRandom | Deterministic, no flake |

## Type Safety

- `strict: true`, `noUncheckedIndexedAccess: true`
- Zero `any`. `as` only at parse boundaries (and only when `Schema.decodeUnknown` cannot express it)
- Branded types for IDs and domain values (`UserId`, `Email`, `Money`)
- Errors typed end-to-end: domain `TaggedError` → Effect `E` channel → mapped to HTTP at the boundary

## Anti-Patterns — Forbidden

- ❌ Parallel schemas (Zod + manual TS interface for the same shape)
- ❌ Raw `try/catch` in domain or application
- ❌ `any`, non-boundary `as` casts
- ❌ Module mocking in tests (use Effect Layers instead)
- ❌ Cross-feature reach-in (`import "../auth/internal/..."`)
- ❌ Drizzle-kit for migrations (use Atlas)
- ❌ Class-based services with hidden state (use `Context.Tag` + `Layer`)
- ❌ Inheritance hierarchies (compose via `Layer.merge`)
