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

**Effect Schema** is the only place a shape is defined. Derive everything else: TS types, `hono-openapi` validators (Standard Schema), OpenAPI spec, `hc` client contracts, DB codecs (`Schema.decodeUnknown`), form resolvers, env parsing. Brand IDs and domain values. **Never** restate a shape as a TS interface or a parallel Zod/TypeBox definition.

## Business Logic — Effect-TS

Every effectful path (I/O, async, error, dependency, resource) is an `Effect`. No raw `Promise` or `try/catch` in domain or application layers.

- **Errors** — tagged classes (`Data.TaggedError`) in the `E` channel, handled exhaustively via `Effect.catchTags` / `Match`
- **Dependencies** — services declared as `Context.Tag`, provided by `Layer` at the edge (`Effect.provide(AppLayer)`)
- **Composition** — `Effect.gen` for sequential, `Effect.all` for parallel, `pipe` for transformation
- **Resources** — `Effect.acquireRelease` for guaranteed cleanup
- **Tests** — swap real `Layer`s for fakes; never mock modules

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
| **DB** | Postgres | Standard SQL, mature ecosystem, Effect-compatible drivers |
| **Cache / KV** | Valkey | Open-source Redis fork — never use Redis since the relicense |
| **Long-running** | Modal | Serverless containers |
| **Workflows** | Upstash Workflow | Durable execution |
| **UI primitives** | Base UI | Headless, accessible, behavior-only — never shadcn/Radix/Mantine/MUI |
| **Styling** | Tailwind v4 (CSS-first) | `@theme` in CSS, no `tailwind.config.js`, design tokens as CSS vars, Lightning CSS, container queries, OKLCH |
| **Animation** | Motion v12 | All stateful animation; respects `prefers-reduced-motion` |
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
