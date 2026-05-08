# Engineering Standard

## Architecture

Use modular clean architecture with strict inward dependencies:

- `infrastructure -> application -> domain`
- Domain has no framework, HTTP, database, or UI dependencies.
- Application orchestrates use cases.
- Infrastructure adapts external systems.
- UI renders state and user workflows.
- Cross-feature access happens through published contracts only.

Published contracts include schemas, application ports, domain events, API clients, and documented package exports. Do not import another feature's domain internals, infrastructure internals, private UI components, or database helpers.

Prefer feature-first layout:

```text
src/features/<feature>/
  domain/
  application/
  infrastructure/
  ui/
```

Keep modules cohesive, explicit, and replaceable. Add abstractions only when they remove real complexity, protect a boundary, or encode a stable domain concept. Remove duplication on the second occurrence.

Keep state external and horizontally scalable. No in-memory session state, sticky-session assumptions, module-level mutable data stores, or hidden singletons. Use Postgres, Valkey, blob storage, queues, or another explicit durable system.

## Sources Of Truth

One concept has one authoritative definition.

- Effect Schema defines runtime shapes, TypeScript types, validators, OpenAPI contracts, form resolvers, env parsing, and boundary codecs.
- Atlas `schema.sql` or `.hcl` defines database shape and migrations.
- CSS `@theme` defines design tokens.
- `docs/adr/` stores architectural decisions.
- `MEMORY.md` stores durable project memory when the project uses file-based memory.
- Git history stores implementation history.

Do not create parallel TypeScript interfaces, Zod schemas, duplicate DB definitions, duplicate constants, hand-written OpenAPI contracts, or copied client types when they can derive from the source of truth. If a repo has a different explicit SSOT standard, follow it consistently and do not mix standards.

For greenfield TypeScript product work, prefer these sources of truth. In existing repositories, follow the repo's established SSOT unless the task explicitly includes migration.

## TypeScript And Effect

Use strict TypeScript with `strict: true` and `noUncheckedIndexedAccess`. Avoid `any`. Use branded types for IDs and domain values that carry invariants.

Use pure functions by default. Domain logic should be deterministic, immutable, referentially transparent, and easy to test without infrastructure.

Use Effect-TS for effectful domain and application logic:

- `Effect`, `Layer`, `Context.Tag`, `Schema`, `Stream`, `Schedule`, and `Match`
- Errors as `Data.TaggedError` values in the `E` channel
- Dependencies in the `R` channel
- Exhaustive expected-failure handling with `Effect.catchTags` or `Match`
- Retry, timeout, metrics, tracing, and resource lifecycles expressed through Effect primitives

Avoid raw `Promise`, `try/catch`, mutation, and module-level state in domain and application code. Prefer immutable data, declarative pipelines, and composition over inheritance.

Raw SDK promises, exceptions, and mutable clients may exist only inside infrastructure adapters or framework boundaries. Wrap them into Effect before entering application logic.

## Stack Defaults

Use the existing repo stack when it is deliberate and coherent. For new TypeScript product work, prefer:

- Runtime, build, lint: Bun, Bunup, Biome
- Framework: Next.js App Router and React Server Components
- Schema: Effect Schema
- Business logic: Effect-TS
- HTTP: Hono, hono-openapi, `hc`
- Client data: React Query
- Database queries: Drizzle ORM
- Database migrations: Atlas, never drizzle-kit
- Database: Postgres
- Cache/KV: Valkey
- UI primitives: Base UI
- Styling: Tailwind v4 CSS-first, OKLCH, container queries, no `tailwind.config.js`
- Animation: Motion v12 with reduced-motion support
- Icons: Lucide
- Forms: React Hook Form with an Effect Schema resolver
- Tables/lists: TanStack Table and TanStack Virtual
- Auth: Better Auth
- AI product UI and provider orchestration: latest stable AI SDK, verified before greenfield selection
- OpenAI-native agentic systems: Responses API and latest Agents SDK patterns
- Effect-native AI workflows: `@effect/ai` and provider packages when their maturity fits the production risk
- i18n: Next-intl with locale files split per feature
- Logging, tracing, metrics: Pino, Effect Tracer, Effect Metric

## Boundaries

For Hono APIs:

- Feed Effect Schema directly into `validator()` through Standard Schema.
- Run Effects at the route boundary.
- Map tagged domain/application errors to HTTP responses at the boundary.
- Log unknown defects with trace IDs and return structured 500 responses.
- Chain route handlers for type inference.
- Split `hc` clients by entity or bounded context before route sets grow large.

For database work:

- Use Atlas for schema and migrations.
- Use Drizzle for parameterized queries only.
- Add indexes for foreign keys and query paths.
- Prefer cursor pagination for growing collections.
- Keep operations idempotent where practical.

## Observability And Recovery

Design for horizontal scale and operational diagnosis:

- Structured JSON logs
- Trace IDs at external boundaries
- Metrics for important counters and latency
- Effect retry schedules and timeouts
- Transactional boundaries around state changes
- Idempotency for high-risk operations
- Health checks and clear failure modes
- Validation at every external boundary
- Least-privilege access
- Secrets only in environment variables or secret managers
- Structured error mapping with no swallowed failures

## Testing

Default ladder:

1. Unit tests for pure logic.
2. Type-level tests for contracts.
3. Integration tests with fake Layers.
4. Property-based tests for edge-heavy logic.
5. Contract validation with Effect Schema at boundaries.
6. Mutation tests where assertion quality matters.
7. Browser E2E for user-facing workflows.
8. Load tests for scale-sensitive paths.
9. Fault-injection tests for recovery behavior.
10. SAST/security checks for sensitive surfaces.

## Naming

Use names that reveal domain intent.

- `camelCase` for TypeScript values
- `PascalCase` for types/classes
- `snake_case` for database columns and env vars
- `kebab-case` for files, routes, and CLI flags
- Booleans are predicates: `isActive`, `hasAccess`, `canPublish`
- Functions are verbs
- Types and data are nouns
- Errors are tagged past-tense facts: `UserNotFound`, `EmailTaken`
- Avoid abbreviations except standard ones like `id`, `url`, and `ttl`
- Use symmetric verbs: `create/delete`, `enable/disable`, `start/stop`
- Same concept, same name everywhere

When a name is vague, inconsistent, incorrectly scoped, or exposes implementation instead of domain intent, treat it as a bug.
