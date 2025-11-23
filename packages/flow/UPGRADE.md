# Upgrade Guide

Flow 2.0 includes **automatic upgrade before every session** with smart package manager detection. No more manual version management—Flow keeps itself and your AI CLI tools up to date.

## Auto-Upgrade on Every Execution

**Before each Flow session**, Flow automatically:

1. **Checks for Flow updates**: Compares installed version with npm registry
2. **Checks for AI CLI updates**: Verifies Claude Code, OpenCode, or Cursor versions
3. **Upgrades automatically**: Installs latest versions if available
4. **Detects package manager**: Uses npm, bun, pnpm, or yarn based on your environment

Example output:
```
🔄 Checking for updates...
✓ Flow 2.0.0 → 2.1.0 (latest)
✓ Claude Code 1.5.0 → 1.6.0 (latest)
📦 Installing updates...
✓ All tools upgraded

🚀 Starting Flow session...
```

This happens automatically. No flags needed, no configuration required.

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

## Philosophy: Always Latest

Flow 2.0 embraces the principle of **always running the latest stable versions**. This ensures:

- Latest features and improvements
- Security patches applied immediately
- Compatibility with newest AI models
- Bug fixes without manual intervention

Auto-upgrade cannot be disabled—it's core to Flow's philosophy of zero-friction excellence.

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
