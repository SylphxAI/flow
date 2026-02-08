# Sylphx Flow — Memory

## Identity

**@sylphx/flow** — Meta-CLI orchestration layer for AI coding CLIs.
Flow doesn't replace AI CLIs, it orchestrates them.

## Architecture

1. Auto-detect environment (Claude Code / OpenCode)
2. Auto-install missing dependencies
3. Auto-upgrade before each session
4. Configure and execute target CLI
5. Graceful cleanup (restore configs, remove git skip-worktree)

## Project Structure

**Monorepo** with single package:
- `packages/flow/` — Main CLI package (@sylphx/flow)
  - `src/commands/` — CLI commands (flow, settings, upgrade)
  - `src/core/` — Core managers (session, target, cleanup, attach)
  - `src/services/` — Business logic (config, MCP, installer)
  - `src/targets/` — Target CLI adapters (Claude Code, OpenCode)
  - `src/config/` — Configuration schemas and defaults
  - `src/utils/` — Utilities
  - `assets/` — Static assets (agents, rules)

## Tech Stack Decisions

| Choice | Why |
|---|---|
| Bun (runtime + pkg mgr) | Native TypeScript, fast, single toolchain |
| Commander.js | CLI framework — mature, well-typed |
| Bunup | Zero-config build for Bun |
| Turbo | Monorepo task orchestration |
| Biome | Lint + format in one tool, fast |
| Zod v4 | Schema validation with TypeScript inference |

## Key Patterns

1. **Target Adapter Pattern** — Each AI CLI has an adapter implementing common interface
2. **Functional Core** — Result types for error handling
3. **Config Transform Pipeline** — Global settings → Target-specific format → Per-project config
4. **Cleanup Registration** — Components register cleanup handlers for graceful shutdown

## Git Protection

Flow uses `git update-index --skip-worktree` to hide temporary config changes from git status, preventing accidental commits.

## Settings

Global settings stored in `~/.sylphx-flow/`:
- `settings.json` — Default agent, target, update preferences
- `flow-config.json` — Enabled agents, rules, output styles
- `mcp-config.json` — MCP server configurations
- `provider-config.json` — AI provider API keys (permissions: 600)
