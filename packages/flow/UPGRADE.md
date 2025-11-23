# Upgrade Guide

Sylphx Flow includes built-in upgrade detection and automatic update capabilities with **smart package manager detection**.

## Auto-Detection on Startup

Every time you run Sylphx Flow, it automatically checks for available updates in the background. If an update is available, you'll see a notification like:

```
📦 Sylphx Flow update available: 1.8.1 → 1.9.0
   Quick upgrade: sylphx-flow upgrade --auto
   Or run: bun install -g @sylphx/flow@latest
```

The upgrade command is automatically tailored to your detected package manager (npm, bun, pnpm, or yarn).

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

## Package Manager Detection

Sylphx Flow automatically detects which package manager you're using:

1. **From Environment** (`npm_config_user_agent`): Most reliable when running as npm script
2. **From Lock Files**: Checks for `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, or `package-lock.json`
3. **Default**: Falls back to `npm` if no detection method works

**Priority Order**: bun > pnpm > yarn > npm

### Supported Package Managers

| Package Manager | Global Install Command |
|----------------|------------------------|
| npm            | `npm install -g @sylphx/flow@latest` |
| bun            | `bun install -g @sylphx/flow@latest` |
| pnpm           | `pnpm install -g @sylphx/flow@latest` |
| yarn           | `yarn global add @sylphx/flow@latest` |

## How It Works

1. **Version Detection**: Checks npm registry for latest published versions
2. **Comparison**: Compares installed version with latest available
3. **Package Manager Detection**: Automatically detects npm/bun/pnpm/yarn
4. **Notification**: Shows update availability with package-manager-specific command
5. **Installation**:
   - Without `--auto`: Shows manual install command for your package manager
   - With `--auto`: Runs the appropriate install command automatically

## Disabling Auto-Check

Use `--quick` mode to skip automatic update checks:

```bash
sylphx-flow --quick "your prompt here"
```

## Troubleshooting

### Auto-Install Fails

If `--auto` installation fails, the error message will show the exact command to run manually. The command is tailored to your package manager:

```bash
# Example for bun users
bun install -g @sylphx/flow@latest

# Example for npm users
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
