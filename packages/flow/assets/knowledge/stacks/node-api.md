---
name: API Service (Hono + Effect)
description: Production-grade API — Hono + hono-openapi + Effect-TS + Effect Schema, modular clean architecture, feature-first
---

# API Development — 2027 SOTA

Hono on Bun. Effect-TS for all business logic. Effect Schema as the single source of truth. Clean architecture, feature-first folders, end-to-end type safety.

## Folder Layout (feature-first)

```
src/
├── features/
│   ├── users/
│   │   ├── domain/
│   │   │   ├── schema.ts        # Effect Schema — SSOT
│   │   │   └── errors.ts        # TaggedError classes
│   │   ├── application/
│   │   │   ├── repo.ts          # Context.Tag (interface)
│   │   │   └── use-cases.ts     # Effect programs
│   │   └── infrastructure/
│   │       ├── routes.ts        # Hono + hono-openapi
│   │       ├── repo.drizzle.ts  # Layer.effect(Repo, ...)
│   │       └── layer.ts         # Composed Layer
│   └── billing/...
├── shared/
│   ├── http/                    # error-mapping, middleware
│   ├── db/                      # Drizzle client, transactions
│   └── observability/           # Pino, Effect Tracer
└── main.ts                      # Compose AppLayer, bind Hono, listen
```

Cross-feature: import only from `features/<feature>/index.ts` (published contract). Never reach into `internal/`.

## Domain — pure types + schema

```ts
// features/users/domain/schema.ts
import { Schema } from "effect"

export const UserId = Schema.String.pipe(Schema.brand("UserId"))
export type UserId = typeof UserId.Type

export const Email = Schema.String.pipe(
  Schema.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  Schema.brand("Email"),
)
export type Email = typeof Email.Type

export const User = Schema.Struct({
  id: UserId,
  email: Email,
  createdAt: Schema.Date,
})
export type User = typeof User.Type

export const NewUser = Schema.Struct({ email: Email })
export type NewUser = typeof NewUser.Type
```

```ts
// features/users/domain/errors.ts
import { Data } from "effect"
export class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: UserId }> {}
export class EmailTaken    extends Data.TaggedError("EmailTaken")<{ email: Email }> {}
```

## Application — use-cases as Effect programs

```ts
// features/users/application/repo.ts
import { Context, Effect } from "effect"
import type { Email, NewUser, User, UserId } from "../domain/schema"

export class UserRepo extends Context.Tag("UserRepo")<UserRepo, {
  findById:    (id: UserId)    => Effect.Effect<User | null>
  findByEmail: (email: Email)  => Effect.Effect<User | null>
  insert:      (input: NewUser) => Effect.Effect<User>
}>() {}
```

```ts
// features/users/application/use-cases.ts
import { Effect } from "effect"
import { EmailTaken, UserNotFound } from "../domain/errors"
import { UserRepo } from "./repo"

export const createUser = (input: NewUser) =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const exists = yield* repo.findByEmail(input.email)
    if (exists) return yield* new EmailTaken({ email: input.email })
    return yield* repo.insert(input)
  })

export const getUser = (id: UserId) =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const user = yield* repo.findById(id)
    if (!user) return yield* new UserNotFound({ id })
    return user
  })
```

Note: dependencies are values in the `R` channel (`UserRepo`). Errors are values in the `E` channel (`EmailTaken`, `UserNotFound`). The compiler enforces exhaustive handling.

## Infrastructure — Hono + hono-openapi

```ts
// features/users/infrastructure/routes.ts
import { Hono } from "hono"
import { describeRoute, validator } from "hono-openapi"
import { Effect, Match } from "effect"
import { NewUser, UserId, User } from "../domain/schema"
import { createUser, getUser } from "../application/use-cases"
import { runWithApp } from "@/shared/http/runtime"
import { mapDomainError } from "@/shared/http/errors"

export const usersRoutes = new Hono()
  .post(
    "/",
    describeRoute({
      description: "Create user",
      responses: {
        201: { description: "Created", content: { "application/json": { schema: User } } },
        409: { description: "Email taken" },
      },
    }),
    validator("json", NewUser),                  // Effect Schema (Standard Schema)
    async (c) => runWithApp(c, createUser(c.req.valid("json")), {
      onSuccess: (user) => c.json(user, 201),
      onError: mapDomainError(c, {
        EmailTaken: (e) => c.json({ error: "EMAIL_TAKEN", email: e.email }, 409),
      }),
    })
  )
  .get(
    "/:id",
    validator("param", Schema.Struct({ id: UserId })),
    async (c) => runWithApp(c, getUser(c.req.valid("param").id), {
      onSuccess: (user) => c.json(user),
      onError: mapDomainError(c, {
        UserNotFound: () => c.json({ error: "NOT_FOUND" }, 404),
      }),
    })
  )
```

## Wiring — Layers

```ts
// features/users/infrastructure/repo.drizzle.ts
import { Effect, Layer, Schema } from "effect"
import { UserRepo } from "../application/repo"
import { User } from "../domain/schema"
import { Db } from "@/shared/db"

export const UserRepoLive = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const db = yield* Db
    return UserRepo.of({
      findById: (id) =>
        Effect.tryPromise(() => db.query.users.findFirst({ where: eq(users.id, id) }))
          .pipe(Effect.flatMap(Schema.decodeUnknown(Schema.NullOr(User)))),
      // ...
    })
  })
)
```

```ts
// main.ts
import { Hono } from "hono"
import { Layer } from "effect"
import { DbLive } from "./shared/db"
import { LoggerLive } from "./shared/observability"
import { UserRepoLive } from "./features/users/infrastructure/repo.drizzle"
import { usersRoutes } from "./features/users/infrastructure/routes"

export const AppLayer = Layer.mergeAll(DbLive, LoggerLive, UserRepoLive)

const app = new Hono().route("/users", usersRoutes)
export default { fetch: app.fetch, port: 3000 }
```

## Error Mapping (boundary)

```ts
// shared/http/errors.ts
import { Match } from "effect"

export const mapDomainError = <Tags extends string>(
  c: Context,
  handlers: Partial<Record<Tags, (e: any) => Response>>,
) => (error: { _tag: Tags }) =>
  (handlers[error._tag] ?? defaultHandler)(error)

const defaultHandler = (e: unknown) => /* log + 500 */
```

Domain/application **never** touch HTTP. The boundary translates tagged errors to status codes.

## Cross-cutting concerns

| Concern | Mechanism |
|---|---|
| Tracing | Effect's built-in `Tracer` — automatic span per `Effect.withSpan` |
| Logging | Pino at the infrastructure boundary, structured with trace id |
| Metrics | Effect `Metric` — counters, histograms |
| Retries | `Effect.retry(schedule)` with `Schedule.exponential` |
| Timeouts | `Effect.timeout("5 seconds")` |
| Concurrency | `Effect.all(effects, { concurrency: "unbounded" })` |
| Resources | `Effect.acquireRelease` — guaranteed cleanup |
| Auth | Hono middleware → puts user in `Context`, available via `Context.Tag` |

## Testing

```ts
import { Effect, Layer, TestClock } from "effect"
import { describe, it, expect } from "bun:test"
import { UserRepo } from "@/features/users/application/repo"
import { createUser } from "@/features/users/application/use-cases"

const fakeRepo = (state: { users: User[] }) =>
  Layer.succeed(UserRepo, UserRepo.of({
    findByEmail: (email) =>
      Effect.succeed(state.users.find((u) => u.email === email) ?? null),
    insert: (input) =>
      Effect.sync(() => {
        const u = { ...input, id: "u1" as UserId, createdAt: new Date() }
        state.users.push(u)
        return u
      }),
    // ...
  }))

it("rejects duplicate emails", async () => {
  const state = { users: [{ id: "u0", email: "a@b.c", createdAt: new Date() }] }
  const result = await Effect.runPromiseExit(
    createUser({ email: "a@b.c" as Email }).pipe(Effect.provide(fakeRepo(state)))
  )
  expect(result._tag).toBe("Failure")
})
```

- Pure domain → tested as pure functions
- Effect use-cases → swap real `Layer` for fake one (no module mocks)
- Time/random → `TestClock`, `TestRandom` for deterministic schedules and retries
- Integration → real Hono + real Effect runtime + test DB layer
- Every tagged error has a regression test

## Performance

| Target | Approach |
|---|---|
| API p95 < 200ms | Edge runtime where possible, parallel `Effect.all` |
| DB p95 < 100ms | Drizzle prepared statements, indexed FKs, cursor pagination |
| N+1 avoidance | Batch via `Effect.forEach({ concurrency, batching: true })` or DataLoader Layer |
| Cache | Redis Layer with `Effect.cached` / `Effect.cachedWithTTL` |
| Resilience | `Schedule.exponential` retries, `Effect.timeout`, circuit breaker via `Schedule` |

## Anti-Patterns — Forbidden

- ❌ `try/catch` in domain or application
- ❌ Raw `Promise.then/.catch` outside infrastructure adapters
- ❌ Throwing exceptions for control flow
- ❌ Class-based services with hidden state
- ❌ Inheritance — compose `Layer`s instead
- ❌ Module mocking in tests
- ❌ Cross-feature reach-in
- ❌ Re-defining a schema as a TS interface
- ❌ Drizzle-kit migrations (use Atlas)
