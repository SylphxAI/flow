---
"@sylphx/flow": minor
---

Add automatic upgrade detection with smart package manager support

- Auto-detect updates on startup with non-intrusive notifications
- Enhanced `upgrade` command with `--auto` flag for automatic installation
- Smart package manager detection (npm, bun, pnpm, yarn)
- Version checking against npm registry for both Flow and target platforms
- Package-manager-specific upgrade commands in notifications
- New UPGRADE.md documentation with package manager support
- Silent background checks that don't block execution
- Support for both interactive and automatic upgrade flows
- Comprehensive test coverage for package manager detection
