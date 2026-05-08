---
status: accepted
date: 2026-05-08
decision_drivers:
  - Agent-first development should not depend on tool-specific prompt drift.
  - Flow's product identity is a unified setup and orchestration layer, not a bag of per-tool config generators.
  - Codex, Claude Code, OpenCode, Cursor, and future tools need the same standards, skills, and workflows with only thin adapter differences.
---

# ADR 0001: Unified Agent OS

## Context

Flow exists to make agent-first software development feel coherent across tools. The user should not need to learn or maintain one prompt architecture for Codex, another for Claude Code, another for OpenCode, and another for Cursor.

The previous implementation moved the latest Codex prompts into `packages/flow/assets/codex/` and then split shared material into `packages/flow/assets/shared/`. That still preserved a tool-centric mental model: each target could grow its own prompt island, and shared assets were an afterthought.

That design is not strong enough for Flow's product goal.

## Decision

Flow has one canonical Agent OS:

```text
packages/flow/assets/agent-os/
  agents/
  standards/
  skills/
```

Tool-specific directories are runtime projection configuration only:

```text
packages/flow/assets/adapters/
  codex/
    projection.yaml
```

Adapters describe how a tool loads instructions, where runtime files are installed, and what syntax that tool supports. They are machine-readable projection rules, not second prompt files. They must not fork standards, skills, or workflows unless the difference is forced by the target runtime.

The Codex installer projects:

- `assets/agent-os/agents/builder.md` transformed by `assets/adapters/codex/projection.yaml` to `~/.codex/AGENTS.md`
- `assets/agent-os/standards/` to `~/.codex/standards/`
- `assets/agent-os/skills/` to `~/.codex/skills/`

Flow's main execution path and future Claude Code, OpenCode, Cursor, and other target support must follow the same pattern: target-specific projection, shared Agent OS core.

## Alternatives Considered

### Per-tool prompt directories

Rejected. This creates drift and forces users to reason about every target's prompt architecture.

### Dotfiles as the Codex source of truth

Rejected. Flow is the public setup and orchestration product. Dotfiles can be a private compatibility layer, but they should not own public agent behavior.

### Flow prompt library as loose source material

Rejected. A loose library is useful for references, but it is not enough for reproducible setup. Flow needs installable, inspectable, versioned Agent OS assets.

## Consequences

- Flow becomes the public SSOT for agent-first development behavior.
- Runtime targets stay thin and replaceable.
- Adding a new AI coding tool means adding an adapter, not rewriting the standards.
- Prompt quality improvements land once and project everywhere.
- Tool-specific unsupported syntax must stay inside machine-readable projection configuration or installer code.

## Acceptance Criteria

- Codex standards and skills come from `assets/agent-os`, not `assets/codex`.
- Builder identity comes from `assets/agent-os/agents/builder.md`, not a copied Codex `AGENTS.md`.
- Codex-specific files are limited to projection configuration.
- Flow runtime templates load agents, standards, and skills from `assets/agent-os`.
- The CLI exposes install and doctor commands for Codex projection.
- Documentation describes Flow as an Agent OS, not a Codex settings copier.
