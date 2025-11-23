# Upgrade Guide

Sylphx Flow includes built-in upgrade detection and automatic update capabilities.

## Auto-Detection on Startup

Every time you run Sylphx Flow, it automatically checks for available updates in the background. If an update is available, you'll see a notification like:

```
📦 Sylphx Flow update available: 1.8.1 → 1.9.0
   Run: sylphx-flow upgrade --auto
```

This check is non-intrusive and won't block your workflow. Use `--quick` mode to skip the check entirely.

## Manual Upgrade Check

Check for available updates without installing:

```bash
sylphx-flow upgrade --check
```

## Upgrade Commands

### Upgrade Sylphx Flow

Upgrade to the latest version:

```bash
# Interactive upgrade (manual installation required)
sylphx-flow upgrade

# Automatic installation via npm
sylphx-flow upgrade --auto
```

### Upgrade Target Platform

Upgrade Claude Code or other target platforms:

```bash
# Interactive upgrade
sylphx-flow upgrade --target

# Automatic installation via npm
sylphx-flow upgrade --target --auto
```

### Combined Upgrade

Upgrade both Sylphx Flow and target platform:

```bash
sylphx-flow upgrade --target --auto
```

## Options

- `--check` - Only check for updates, don't install
- `--auto` - Automatically install updates via npm (no manual steps)
- `--target` - Include target platform (Claude Code/OpenCode) upgrade
- `--verbose` - Show detailed installation output

## How It Works

1. **Version Detection**: Checks npm registry for latest published versions
2. **Comparison**: Compares installed version with latest available
3. **Notification**: Shows update availability with suggested command
4. **Installation**:
   - Without `--auto`: Updates config and shows manual install instructions
   - With `--auto`: Runs `npm install -g @sylphx/flow@latest` automatically

## Disabling Auto-Check

Use `--quick` mode to skip automatic update checks:

```bash
sylphx-flow --quick "your prompt here"
```

## Troubleshooting

### Auto-Install Fails

If `--auto` installation fails, run the manual command:

```bash
npm install -g @sylphx/flow@latest
```

### Version Mismatch

If you see version mismatches after upgrade, try:

```bash
# Re-sync components with latest templates
sylphx-flow --sync
```

### Offline Mode

Update checks require internet connection. If offline, checks will fail silently and won't block execution.

## Version Compatibility

Sylphx Flow follows semantic versioning:

- **Patch** (1.8.x): Bug fixes, safe to upgrade
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes, check migration guide

Always check CHANGELOG.md for breaking changes before upgrading major versions.
