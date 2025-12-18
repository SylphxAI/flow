# Sylphx Flow Architecture

> **Last Updated:** 2025-01-18
> **Architecture Version:** v3.0 (CLI Orchestration Layer)

---

## Overview

Sylphx Flow is a **meta-CLI orchestration layer** that unifies multiple AI coding assistants (Claude Code, OpenCode, Cursor) behind a single interface. It auto-detects, auto-installs, auto-configures, and auto-upgrades underlying AI CLIs.

### Design Philosophy

**Orchestration, Not Replacement**
- Flow doesn't replace Claude Code or OpenCode — it orchestrates them
- One CLI, multiple backends
- Zero friction: auto-detect → auto-install → auto-configure → execute

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│  User                                                             │
│  $ sylphx-flow "implement authentication"                         │
└───────────────────┬───────────────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────────────┐
│  Sylphx Flow CLI (@sylphx/flow)                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Detect      │  │ Configure   │  │ Execute     │                │
│  │ Environment │→ │ Settings    │→ │ Target CLI  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                   │
│  Features:                                                        │
│  • Auto-detect installed CLIs                                     │
│  • Auto-install missing CLIs                                      │
│  • Auto-upgrade before execution                                  │
│  • Git skip-worktree protection                                   │
│  • Settings sync across projects                                  │
│  • MCP server management                                          │
│  • Agent/Rule/Output style configuration                          │
└───────────────────┬───────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
┌───────────┐ ┌───────────┐ ┌───────────┐
│ Claude    │ │ OpenCode  │ │ Cursor    │
│ Code      │ │           │ │ (MCP)     │
└───────────┘ └───────────┘ └───────────┘
```

---

## Package Structure

### Monorepo Layout

```
flow/
├── packages/
│   └── flow/                    # Main CLI package (@sylphx/flow)
│       ├── src/
│       │   ├── index.ts         # CLI entry point
│       │   ├── commands/        # CLI commands
│       │   ├── core/            # Core logic
│       │   ├── services/        # Business services
│       │   ├── targets/         # Target CLI adapters
│       │   ├── config/          # Configuration
│       │   ├── utils/           # Utilities
│       │   └── types/           # TypeScript types
│       └── assets/              # Static assets (agents, rules)
├── docs/                        # VitePress documentation
└── tests/                       # Test suite
```

### `@sylphx/flow` Package

**Purpose**: Unified CLI orchestration for AI coding assistants

**Key Directories:**

| Directory | Purpose |
|-----------|---------|
| `src/commands/` | CLI command definitions (flow, settings, upgrade, doctor) |
| `src/core/` | Core managers (session, project, target, cleanup, attach) |
| `src/services/` | Business logic (config, MCP, installer) |
| `src/targets/` | Target CLI adapters (Claude Code, OpenCode) |
| `src/config/` | Configuration schemas and defaults |
| `src/utils/` | Utilities (display, files, security, config) |
| `src/types/` | TypeScript type definitions |

---

## Core Components

### 1. Target System

**Location**: `src/targets/`, `src/core/target-manager.ts`, `src/core/target-resolver.ts`

Flow supports multiple AI CLI backends ("targets"):

```typescript
// Target interface (simplified)
interface Target {
  name: string;           // "claude-code" | "opencode"
  detect(): Promise<boolean>;
  install(): Promise<void>;
  execute(prompt: string, options: ExecuteOptions): Promise<void>;
  getConfigPath(): string;
}
```

**Supported Targets:**
- **Claude Code** (`src/targets/claude-code.ts`) - Anthropic's official CLI
- **OpenCode** (`src/targets/opencode.ts`) - Open source alternative

**Target Resolution Flow:**
```
1. Check if target is explicitly specified (--target flag)
2. Check user's default target preference (settings)
3. Auto-detect installed CLIs
4. If none found: prompt user to install one
```

### 2. Settings System

**Location**: `src/commands/settings/`, `src/services/global-config.ts`

Global settings stored in `~/.sylphx-flow/`:

```
~/.sylphx-flow/
├── settings.json          # General settings (default agent, target)
├── flow-config.json       # Agents, rules, output styles
├── provider-config.json   # AI provider settings
└── mcp-config.json        # MCP server configurations
```

**Settings Categories:**
- **Agents**: Enable/disable specialized agents (coder, writer, reviewer, orchestrator)
- **Rules**: Control coding standards and best practices
- **Output Styles**: Customize AI behavior (silent, verbose)
- **MCP Servers**: Extend capabilities (grep, context7, playwright)
- **Providers**: API keys and provider preferences

### 3. Agent System

**Location**: `src/core/agent-loader.ts`, `assets/agents/`

Specialized agents for different tasks:

| Agent | Purpose | Use Case |
|-------|---------|----------|
| **Builder** | Full-stack implementation | Default for most tasks |
| **Coder** | Feature implementation | Building new features |
| **Writer** | Documentation | API docs, guides |
| **Reviewer** | Code review | Security audits, PR reviews |
| **Orchestrator** | Complex multi-step | Architecture changes |

Agents are loaded from markdown files in `assets/agents/` and injected into the target CLI's system prompt.

### 4. Cleanup Handler

**Location**: `src/core/cleanup-handler.ts`

Ensures graceful cleanup on:
- Normal exit
- SIGINT (Ctrl+C)
- SIGTERM
- Uncaught exceptions

Cleanup actions:
1. Restore original config files
2. Remove git skip-worktree flags
3. Restore git stash if applicable
4. Clean up temporary files

### 5. Git Skip-Worktree Protection

**Location**: `src/core/git-stash-manager.ts`

When Flow modifies target CLI config files (`.claude/settings.json`, `.opencode/config.json`), it uses:
```bash
git update-index --skip-worktree <file>
```

This hides Flow's temporary modifications from `git status`, preventing accidental commits.

---

## Data Flow

### Execution Flow

```
User: sylphx-flow "implement auth" --agent coder
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 1. Parse CLI arguments                   │
│    - Extract prompt, options             │
│    - Handle @file.txt input              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 2. Resolve target                        │
│    - Check explicit --target flag        │
│    - Check default preference            │
│    - Auto-detect installed CLIs          │
│    - Prompt to install if none found     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 3. Check for updates                     │
│    - Flow version check                  │
│    - Target CLI version check            │
│    - Auto-upgrade if needed              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 4. Configure target                      │
│    - Backup original configs             │
│    - Apply Flow settings                 │
│    - Set git skip-worktree               │
│    - Inject agent/rules                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 5. Execute target CLI                    │
│    - Spawn claude/opencode process       │
│    - Stream output to user               │
│    - Wait for completion or Ctrl+C       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 6. Cleanup                               │
│    - Restore original configs            │
│    - Remove skip-worktree flags          │
│    - Report exit status                  │
└─────────────────────────────────────────┘
```

### Settings Application Flow

```
┌─────────────────────────────────────────┐
│ Global Settings (~/.sylphx-flow/)        │
│ ├── Default agent: builder               │
│ ├── Enabled rules: [core, code-standards]│
│ └── MCP servers: [grep, context7]        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Target Config Transform                  │
│ Flow settings → Claude Code format       │
│ Flow settings → OpenCode format          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Target Config Files (per-project)        │
│ .claude/settings.json                    │
│ .opencode/config.json                    │
└─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Bun | Fast startup, native TypeScript |
| **CLI Framework** | Commander.js | Battle-tested, excellent UX |
| **Prompts** | Inquirer.js | Rich interactive prompts |
| **Styling** | Chalk + Boxen + Gradient | Beautiful terminal output |
| **Spinners** | Ora | Progress indication |
| **Config** | YAML + JSONC | Human-readable configs |
| **Validation** | Zod | Type-safe schemas |
| **Package Manager** | Bun | Fast, integrated |
| **Build** | Bunup | Zero-config bundling |
| **Monorepo** | Turbo | Fast builds, caching |
| **Lint/Format** | Biome | Fast, unified tooling |

---

## Key Patterns

### 1. Target Adapter Pattern

Each AI CLI has an adapter that implements a common interface:

```typescript
// src/targets/claude-code.ts
export const claudeCodeTarget: Target = {
  name: 'claude-code',
  detect: async () => { /* check if claude is installed */ },
  install: async () => { /* npm install -g @anthropic-ai/claude-code */ },
  execute: async (prompt, options) => { /* spawn claude process */ },
  getConfigPath: () => '.claude/settings.json',
};
```

### 2. Functional Core

**Location**: `src/core/functional/`

Result types for error handling:
```typescript
type Result<T, E = Error> = Ok<T> | Err<E>;
type Option<T> = Some<T> | None;
```

### 3. Config Transform Pipeline

Settings are transformed through a pipeline:
```
Global Settings → Target-Specific Format → Per-Project Config
```

### 4. Cleanup Registration

Components register cleanup handlers:
```typescript
cleanupHandler.register(async () => {
  await restoreOriginalConfig();
  await removeSkipWorktree();
});
```

---

## Configuration

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEBUG` | Enable debug logging | `false` |
| `SYLPHX_FLOW_HOME` | Config directory | `~/.sylphx-flow` |
| `NO_COLOR` | Disable colors | `false` |

### Config Files

**Global** (`~/.sylphx-flow/`):
- `settings.json` - Default agent, target, update preferences
- `flow-config.json` - Enabled agents, rules, output styles
- `mcp-config.json` - MCP server configurations
- `provider-config.json` - AI provider API keys

**Per-Project** (managed by Flow):
- `.claude/settings.json` - Claude Code config (backed up, modified, restored)
- `.opencode/config.json` - OpenCode config (backed up, modified, restored)

---

## Security Considerations

### API Key Management
- Provider API keys stored in `~/.sylphx-flow/provider-config.json`
- File permissions: 600 (user-only)
- Never logged or transmitted

### Git Protection
- Config changes hidden via `git update-index --skip-worktree`
- Original files restored on exit
- Prevents accidental commits of Flow-specific settings

### Process Isolation
- Target CLIs spawned as child processes
- Flow doesn't modify target CLI binaries
- Clean separation of concerns

---

## Development

### Setup

```bash
# Clone and install
git clone https://github.com/sylphxltd/flow.git
cd flow
bun install

# Development
bun run dev:flow              # Watch mode
bun run packages/flow/src/index.ts "test prompt"

# Testing
bun run test                  # Run tests
bun run test:watch           # Watch mode

# Build
bun run build                 # Build all packages
```

### Adding a New Target

1. Create adapter in `src/targets/<target-name>.ts`
2. Implement `Target` interface
3. Register in `src/config/targets.ts`
4. Add config transform in `src/targets/shared/`
5. Test detection, installation, and execution

### Adding a New Agent

1. Create markdown file in `assets/agents/<agent-name>.md`
2. Add to agent registry in `src/config/constants.ts`
3. Add to settings UI in `src/commands/settings/`

---

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| CLI Startup | ~100ms | Bun native TS |
| Target Detection | ~50ms | File system checks |
| Config Transform | ~10ms | In-memory |
| Total Overhead | ~200ms | Before target CLI starts |

---

## Future Architecture

### Planned: Plugin System
- Third-party target adapters
- Custom agents via npm packages
- MCP server marketplace

### Planned: Team Sync
- Shared settings via git
- Team-wide defaults
- Organization policies

---

## See Also

- [PRODUCT.md](./PRODUCT.md) - Product vision and roadmap
- [README.md](./README.md) - User documentation
- [Loop Mode Guide](./packages/flow/LOOP_MODE.md) - Autonomous execution
- [MEP Guidelines](./MEP_GUIDELINES.md) - Minimal Effective Prompt design
