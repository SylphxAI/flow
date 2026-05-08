# AI Architecture

Do not treat AI SDK, OpenAI Agents SDK, and Effect AI as interchangeable defaults. Choose by boundary.

## Boundary Choices

- Use Effect and pure domain services for business workflows, validation, retries, tracing, and dependency injection.
- Use the latest stable AI SDK for TypeScript/Next.js AI product surfaces that need provider abstraction, tool loops, UI streaming, or framework integration.
- Use OpenAI Responses API and Agents SDK patterns for OpenAI-native agent systems that need hosted tools, handoffs, tracing, session/state management, or production agent orchestration.
- Use `@effect/ai` for Effect-native provider-agnostic workflows when its current maturity fits the risk; verify current docs because the package has been marked experimental/alpha.

External AI SDKs may require schemas or async APIs that do not match the domain SSOT. Keep that mismatch at the infrastructure or framework boundary. Derive schemas from Effect Schema where supported; otherwise isolate the adapter shape, name it as an adapter, and do not let it become a second domain contract.

## Agentic Systems

Agentic systems need evals, tracing, and guardrails. Evaluate:

- Instruction following
- Tool selection
- Tool argument precision
- Output correctness
- Safety boundaries
- Handoff accuracy

Use multi-agent architecture when evals or clear task decomposition justify it. Multi-agent systems add nondeterminism and should not be added as ceremony.

Prefer OpenAI-hosted tools where they fit the workflow. Use custom function tools when you need to call your own systems, enforce domain-specific side effects, or expose internal business workflows.

For large tool catalogs, prefer tool search or scoped tool loading so the model receives only relevant tool definitions.

For long-running agents, use conversation/state compaction intentionally. Preserve completed actions, active assumptions, IDs, tool outcomes, unresolved blockers, and the next concrete goal.
