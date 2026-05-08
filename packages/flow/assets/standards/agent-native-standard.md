# Agent-Native Standard

## Product Design

Design systems as if agents are primary operators.

- Expose meaningful operations as typed tools, CLIs, APIs, or MCP surfaces.
- Use Effect Schema as the shared contract for tools, HTTP, forms, generated docs, tests, and clients when the repo standard allows it.
- Prefer generated UIs, SDKs, API references, fixtures, and validation from schemas over hand-maintained duplicates.
- Make state queryable: health, config, migrations, queues, jobs, traces, metrics, and domain events should be inspectable without tribal knowledge.
- Prefer deterministic workflows: reproducible builds, replayable migrations, idempotent jobs, stable seeds, content-addressed artifacts, and structured logs.
- Optimize for autonomous debugging: trace IDs, tagged errors, recovery paths, runbooks, and machine-readable failure details.
- Do not preserve bad design solely to minimize human review effort; constrain by correctness, risk, and scope rather than diff size.

## Documentation First

Agents do not share perfect memory. Durable written context is the coordination layer for parallel work, future sessions, and independent review.

For non-trivial features, architecture changes, migrations, AI workflows, public APIs, data models, or operational behavior, write the smallest useful durable specification before broad implementation:

- Goal and non-goals
- Users and workflows
- Domain vocabulary and invariants
- Contracts, schemas, tools, APIs, and events
- State, persistence, permissions, and failure modes
- Observability, rollout, migration, and recovery plan
- Acceptance criteria and validation plan

Prefer executable and machine-readable documentation over prose-only documents: Effect Schemas, typed tool contracts, ADR frontmatter, OpenAPI, examples, fixtures, tests, evals, and generated references.

Use docs to brief subagents. A subagent should not need hidden conversation context to understand the goal, constraints, and acceptance criteria.

## Test First

For behavior changes, use test-first or executable-spec-first when practical. Encode expected behavior, contracts, edge cases, and failure modes before or alongside implementation so agents can detect drift while coding.

Validation is an automation budget. Run the narrowest meaningful automated checks for the risk, parallelize where possible, and add tests when behavior, contracts, data, security, or user workflows change.

Bug fixes require root-cause closure: reproduce or explain the failure mode, fix the cause rather than the symptom, scan adjacent code for the same pattern, and harden tests or CI so the defect cannot silently recur.

## Delegation

For non-trivial work, default to subagents when the runtime provides them and work can be split cleanly. Fan out independent exploration, implementation, research, and review instead of serializing everything through one context.

Delegate concrete, bounded, non-overlapping tasks:

- Exploration across different modules or options
- Independent architecture, security, performance, a11y, or test review
- Parallel implementation across disjoint files or bounded contexts
- Current-docs research for competing libraries, APIs, or migration paths

Subagent briefs must be self-contained: goal, relevant files, constraints, ruled-out options, expected output, and length limit.

After meaningful implementation, use an independent reviewer subagent when available for architecture, correctness, security, test coverage, naming, and maintainability.

You remain accountable for the final decision, integration, and quality. Inspect results critically before relying on them.

## Memory

Use the project's existing memory convention for durable user preferences, architectural decisions, operational gotchas, environment constraints, naming conventions, external service assumptions, rejected approaches, and recurring project facts.

Write durable memory proactively when future agents need the fact. When the user says "remember this," write it immediately to the appropriate memory location. If no memory convention exists, create the smallest durable record that fits the project.
