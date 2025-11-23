---
"@sylphx/flow": minor
---

Add automatic upgrade detection and installation

- Auto-detect updates on startup with non-intrusive notifications
- Enhanced `upgrade` command with `--auto` flag for automatic npm installation
- Version checking against npm registry for both Flow and target platforms
- New UPGRADE.md documentation for upgrade workflows
- Silent background checks that don't block execution
- Support for both interactive and automatic upgrade flows
