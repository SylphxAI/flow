---
name: API Service (Hono + Effect)
description: Production-grade API conventions — Hono + hono-openapi + Effect-TS + Effect Schema, modular clean architecture, feature-first
---

# API Development — 2027 SOTA

Hono on Bun. Effect-TS for all business logic. Effect Schema as the single source of truth. Clean architecture, feature-first folders, end-to-end type safety.

## Folder Layout (feature-first)

```
src/
├── features/<feature>/
│   ├── domain/          # schema.ts (Effect Schema, SSOT), errors.ts (Data.TaggedError)
│   ├── application/     # repo.ts (Context.Tag interface), use-cases.ts (Effect programs)
│   ├── infrastructure/  # routes.ts (Hono + hono-openapi), repo.drizzle.ts (Layer.effect), layer.ts
│   └── ui/              # React (if full-stack)
├── shared/
│   ├── http/            # error-mapping, middleware, runtime helpers
│   ├── db/              # Drizzle client, transactions
│   └── observability/   # Pino, Effect Tracer, Metric
└── main.ts              # Layer.mergeAll(...) → bind to Hono → serve
```

Cross-feature: import only from `features/<feature>/index.ts` (published contract). Never reach into another feature's `domain/`, `application/`, or `infrastructure/`.

## Layer Responsibilities

| Layer | Owns | Forbidden |
|---|---|---|
| **domain** | Effect Schema, branded types, tagged errors, pure business invariants | Framework imports, I/O, `Promise`, `try/catch` |
| **application** | Use-cases as `Effect` programs, services declared as `Context.Tag` | HTTP, SQL, third-party SDKs, concrete impls |
| **infrastructure** | Hono routes, Drizzle repos, third-party adapters, `Layer` wiring | Business rules, validation logic |
| **ui** | React components, hooks, presentation | Direct DB / domain logic |

Dependencies point inward only: `infrastructure → application → domain`.

## Conventions

- **Validation at boundary** — `validator("json"|"param"|"query", Schema)` from `hono-openapi`, fed Effect Schema directly via Standard Schema. Domain receives parsed, branded values only.
- **Run Effects at the route** — `Effect.runPromise(useCase.pipe(Effect.catchTags({...}), Effect.provide(AppLayer)))`. Domain/application stay framework-free.
- **Error mapping** — one helper at `shared/http/errors.ts`: tagged-error name → HTTP response. Never inline.
- **Hono RPC** — chain handlers (`new Hono().get(...).post(...)`) for type inference. Split `hc` clients per feature, <100 routes each.
- **DB** — Drizzle for queries (typed, parameterised). Atlas for schema/migrations (`schema.sql` SSOT). Never `drizzle-kit`.
- **Transactions** — provide a `TxRepo` Layer scoped to the transaction; use-cases compose unaware.

## Cross-cutting (all via Effect)

| Concern | Mechanism |
|---|---|
| Tracing | `Effect.withSpan` + Effect Tracer → OpenTelemetry |
| Logging | Pino at infrastructure boundary, structured with trace id |
| Metrics | `Metric.counter` / `Metric.histogram` |
| Retries | `Effect.retry(Schedule.exponential("100 millis"))` |
| Timeouts | `Effect.timeout("5 seconds")` |
| Concurrency | `Effect.all(items, { concurrency: N })`, `Effect.forEach({ batching: true })` |
| Resources | `Effect.acquireRelease` — guaranteed cleanup |
| Auth | Hono middleware → resolves user → provides `CurrentUser` `Context.Tag` |

## Testing

- **Pure domain** → input → output, no harness needed
- **Application use-cases** → provide fake `Layer`s for dependencies (`Layer.succeed(UserRepo, fakeRepo)`); never mock modules
- **Time / random / retries** → `TestClock`, `TestRandom` for determinism, zero flake
- **Integration** → real Hono + real runtime + test DB Layer
- **Failure paths** → every tagged error has a regression test
- **E2E** → Playwright on critical flows

## Performance Targets

- API p95 < 200ms · DB p95 < 100ms
- Avoid N+1: batch via `Effect.forEach({ concurrency, batching: true })` or DataLoader Layer
- Cache hot reads via Valkey Layer + `Effect.cachedWithTTL`
- Cursor pagination, indexed FKs, prepared statements

## Anti-Patterns — Forbidden

- ❌ `try/catch` or raw `Promise` in domain or application
- ❌ Throwing for control flow
- ❌ Class-based services with hidden state (use `Context.Tag` + `Layer`)
- ❌ Inheritance — compose `Layer`s instead
- ❌ Module mocking in tests
- ❌ Cross-feature reach-in
- ❌ Re-defining a schema as a TS interface
- ❌ `drizzle-kit` migrations (use Atlas)
- ❌ `any`, non-boundary `as` casts
