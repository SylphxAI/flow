---
'@sylphx/flow': minor
---

Auto-installation and auto-upgrade features

**New Features:**

- **Auto-detection**: Automatically detects installed AI CLIs (Claude Code, OpenCode, Cursor)
- **Auto-installation**: If no AI CLI is detected, prompts user to select and installs it automatically
- **Auto-upgrade**: Before each Flow execution, automatically checks and upgrades Flow and target CLI to latest versions
- **Zero-friction setup**: New users can install Flow and start using it immediately without manual setup

**Implementation:**

- Created `TargetInstaller` service for detecting and installing AI CLI tools
- Created `AutoUpgrade` service for automatic version checking and upgrading
- Integrated both services into execution flow (`execute-v2.ts`)
- Smart package manager detection (npm, bun, pnpm, yarn)

**User Experience:**

Flow 2.0 now delivers on the promise of "One CLI to rule them all":

1. **First run**: User installs Flow → Flow detects no AI CLI → Prompts to select one → Installs it automatically
2. **Every run**: Flow checks for updates → Upgrades Flow and AI CLI to latest → Runs user's task

Example flow:
```
$ npm install -g @sylphx/flow
$ sylphx-flow "build my app"

🔍 Detecting installed AI CLIs...
⚠️  No AI CLI detected

? No AI CLI detected. Which would you like to use?
❯ Claude Code
  OpenCode
  Cursor

✓ Claude Code installed successfully

🔄 Checking for updates...
✓ Flow is up to date
✓ Claude Code is up to date

🚀 Starting Flow session...
```

**Philosophy:**

This implements Flow's core principle of "Transcendent Simplicity" - users don't need to know which AI CLI to use or how to install/upgrade it. Flow handles everything automatically.
