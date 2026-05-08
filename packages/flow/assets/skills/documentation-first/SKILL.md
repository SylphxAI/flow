---
name: documentation-first
description: Use when a task introduces or changes a non-trivial feature, architecture decision, public API, data model, migration, AI workflow, operational behavior, or cross-agent plan. Creates the smallest useful durable spec, ADR, executable contract, or validation plan before broad implementation.
metadata:
  short-description: Create durable specs before broad implementation
---

# Documentation First

Use this skill to turn ambiguous work into durable, executable context before implementation.

## Workflow

1. Identify whether the task is trivial. If it is trivial, do not create ceremony.
2. Read `~/.codex/standards/agent-native-standard.md` when the work affects coordination, memory, delegation, tests, or delivery.
3. Read `~/.codex/standards/engineering-standard.md` when the work affects architecture, schemas, APIs, data, security, observability, or TypeScript/Effect boundaries.
4. Use the repository's existing doc convention. If none exists, create the smallest fitting artifact:
   - `docs/adr/NNNN-kebab-title.md` for architectural, stack, product, data, security, or operational decisions.
   - `docs/specs/YYYY-MM-DD-kebab-feature.md` for feature or workflow specifications.
   - Tests, schemas, fixtures, OpenAPI, tool contracts, or evals when executable documentation is clearer than prose.
5. Keep the artifact short enough to guide implementation, not replace it.

## Required Content

Include only sections that change implementation quality:

- Goal and non-goals
- Domain vocabulary and invariants
- Contracts, schemas, tools, APIs, events, and permissions
- State, persistence, migrations, failure modes, observability, rollout, and recovery
- Acceptance criteria and validation plan
- Decision, alternatives, and consequences for ADRs

## Rules

- Prefer machine-readable contracts over duplicated prose.
- Do not create parallel sources of truth.
- Do not document obvious code behavior.
- Use the document to brief subagents; it must stand without hidden conversation context.
