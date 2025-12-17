---
release: minor
---

### Features

- **cli**: Redesign CLI output with modern, minimalist interface
  - Single-line header: `flow {version} → {target}`
  - Consolidated status: `✓ Attached {n} agents, {n} commands, {n} MCP`
  - Silent operations by default (backup, cleanup, provider selection)
  - Upgrade notification: `↑ Flow {version} (next run)`

### Bug Fixes

- **auto-upgrade**: Remove auto-restart after Flow upgrade - new version used on next run instead
