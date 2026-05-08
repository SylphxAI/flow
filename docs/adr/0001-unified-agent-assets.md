---
status: accepted
date: 2026-05-08
decision_drivers:
  - Agent-first development should not depend on tool-specific prompt drift.
  - Flow's product identity is a unified setup and orchestration layer, not a bag of per-tool config generators.
  - Codex, Claude Code, OpenCode, Cursor, and future tools need the same standards, skills, and workflows with only thin adapter differences.
---

# ADR 0001: Unified Agent Assets

## Context

Flow exists to make agent-first software development feel coherent across tools. The user should not need to learn or maintain one prompt architecture for Codex, another for Claude Code, another for OpenCode, and another for Cursor.

The previous implementation moved the latest Codex prompts into `packages/flow/assets/codex/` and then split shared material into `packages/flow/assets/shared/`. That still preserved a tool-centric mental model: each target could grow its own prompt island, and shared assets were an afterthought.

That design is not strong enough for Flow's product goal.

## Decision

Flow has one canonical asset layer:

```text
packages/flow/assets/
  agents/
  standards/
  skills/
```

Tool-specific runtime projection directories are configuration only:

```text
packages/flow/assets/runtime-projections/
  codex/
    projection.yaml
```

Adapters describe how a tool loads instructions, where runtime files are installed, and what syntax that tool supports. They are machine-readable projection rules, not second prompt files. They must not fork standards, skills, or workflows unless the difference is forced by the target runtime.

The Codex installer projects:

- `assets/agents/builder.md` transformed by `assets/runtime-projections/codex/projection.yaml` to `~/.codex/AGENTS.md`
- `assets/standards/` to `~/.codex/standards/`
- `assets/skills/` to `~/.codex/skills/`

Flow's main execution path and future Claude Code, OpenCode, Cursor, and other target support must follow the same pattern: target-specific projection, shared canonical asset core.

## Alternatives Considered

### Per-tool prompt directories

Rejected. This creates drift and forces users to reason about every target's prompt architecture.

### Dotfiles as the Codex source of truth

Rejected. Flow is the public setup and orchestration product. Dotfiles can be a private compatibility layer, but they should not own public agent behavior.

### Flow prompt library as loose source material

Rejected. A loose library is useful for references, but it is not enough for reproducible setup. Flow needs installable, inspectable, versioned agent assets.

## Consequences

- Flow becomes the public SSOT for agent-first development behavior.
- Runtime targets stay thin and replaceable.
- Adding a new AI coding tool means adding an adapter, not rewriting the standards.
- Prompt quality improvements land once and project everywhere.
- Tool-specific unsupported syntax must stay inside machine-readable projection configuration or installer code.

## Acceptance Criteria

- Codex standards and skills come from `assets/standards` and `assets/skills`, not `assets/codex`.
- Builder identity comes from `assets/agents/builder.md`, not a copied Codex `AGENTS.md`.
- Codex-specific files are limited to projection configuration.
- Flow runtime templates load agents, standards, and skills from the canonical `assets/` directories.
- The CLI exposes install and doctor commands for Codex projection.
- Documentation describes Flow as the canonical source for agent assets and runtime projections, not a Codex settings copier.
