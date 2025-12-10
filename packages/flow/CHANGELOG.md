# @sylphx/flow

## 2.4.1 (2025-12-10)

### 🐛 Bug Fixes

- **backup:** handle Windows symlink permission error ([8f1337f](https://github.com/SylphxAI/flow/commit/8f1337f6d1381ecceebc8751460a6cf710a62978))

## 2.4.0 (2025-12-09)

### ✨ Features

- **prompts:** add Following Conventions section to coder.md ([4352b13](https://github.com/SylphxAI/flow/commit/4352b1300b1308137bc6c6310b56e31a9af9f3ea))

### 🐛 Bug Fixes

- remove hardcoded references to deleted asset files ([a7ae02c](https://github.com/SylphxAI/flow/commit/a7ae02ce93d449d64cc8e4ac007359ba2799516c))

### ♻️ Refactoring

- **prompts:** simplify code-standards.md from 272 to 147 lines ([5bfa9c6](https://github.com/SylphxAI/flow/commit/5bfa9c6043a8d36f956a2d45061aafd1bf251c9f))
- **prompts:** simplify writer.md from 174 to 120 lines ([0b25de2](https://github.com/SylphxAI/flow/commit/0b25de2ec7477c730072bdeac18042c4087d11e1))
- **prompts:** simplify reviewer.md from 166 to 123 lines ([8c5e1b7](https://github.com/SylphxAI/flow/commit/8c5e1b733a448808533d29ac6d436c138af51915))
- **prompts:** simplify core.md from 348 to 188 lines ([ec4cbfd](https://github.com/SylphxAI/flow/commit/ec4cbfd2bf751c6ee6c0a0eab17f3a280d884d90))
- **prompts:** simplify coder.md from 330 to 128 lines ([c9569c3](https://github.com/SylphxAI/flow/commit/c9569c347b8925e95f1f5844cfa5434db4991a6d))

## 2.3.3 (2025-12-08)

### 🐛 Bug Fixes

- remove hardcoded references to deleted asset files ([a7ae02c](https://github.com/SylphxAI/flow/commit/a7ae02ce93d449d64cc8e4ac007359ba2799516c))
- **prompts:** restore missing content from original redesign ([17530f5](https://github.com/SylphxAI/flow/commit/17530f57a987daf7fa628ce7c2603bb018863aca))
- **prompts:** restore accidentally removed Critical Thinking and Forbidden sections ([68aabd4](https://github.com/SylphxAI/flow/commit/68aabd4bdd9276fc515891ce50c5f294a4897060))

## 2.3.3 (2025-12-08)

### 🐛 Bug Fixes

- **prompts:** restore missing content from original redesign ([17530f5](https://github.com/SylphxAI/flow/commit/17530f57a987daf7fa628ce7c2603bb018863aca))
- **prompts:** restore accidentally removed Critical Thinking and Forbidden sections ([68aabd4](https://github.com/SylphxAI/flow/commit/68aabd4bdd9276fc515891ce50c5f294a4897060))

## 2.3.2 (2025-12-08)

### ♻️ Refactoring

- **prompts:** redesign agent system for LLM era ([b391a31](https://github.com/SylphxAI/flow/commit/b391a313ea817043efb61ec4266c9b7b32ecb9db))

## 2.3.1 (2025-12-02)

### 🐛 Bug Fixes

- **upgrade:** fix auto-upgrade using wrong package manager ([a8a2b92](https://github.com/SylphxAI/flow/commit/a8a2b927534b7f92de48c77df25ee1e11d345380))

### 🔧 Chores

- migrate from vitest to bun test and fix doctor issues ([af35a27](https://github.com/SylphxAI/flow/commit/af35a27546786a99cbd475dae3f5cfb874ee8ab8))

## 2.3.0 (2025-12-02)

### ✨ Features

- **prompts:** add doc update requirements to coder modes ([c489f71](https://github.com/SylphxAI/flow/commit/c489f716d7415f1f077c9318f9cc5fc72fd097ed))
- **prompts:** add mode transition announcement to core rules ([19b18b0](https://github.com/SylphxAI/flow/commit/19b18b0adc49c6eb9da80e61ccdb2a8ce04ac425))

### 🐛 Bug Fixes

- **cli:** save provider selection to prevent repeated prompts ([757a6c9](https://github.com/SylphxAI/flow/commit/757a6c90620cc475f381d0c0a37bf20f1be32438))

### ♻️ Refactoring

- **prompts:** remove silent execution constraint from output style ([6fe64d3](https://github.com/SylphxAI/flow/commit/6fe64d322ac1f670f7fbb3a4d80d5b5ed2186267))

## 2.2.0 (2025-12-01)

### ✨ Features

- **prompts:** add Research-First Principle for mandatory investigation ([c9f6b41](https://github.com/SylphxAI/flow/commit/c9f6b41ade656fe5a7a2cb707704722623dc77d8))
- **prompts:** strengthen commit policy for proactive commits ([e445931](https://github.com/SylphxAI/flow/commit/e445931dc57f17dadedcf582381466412fd364f6))
- **cli:** add 'flow' command alias ([74c7976](https://github.com/SylphxAI/flow/commit/74c79765f10a7f5779991321235afabed18871b3))

## 2.1.11 (2025-11-29)

### 🐛 Bug Fixes

- **mcp:** remove --mcp-config flag, rely on project .mcp.json ([b11af31](https://github.com/SylphxAI/flow/commit/b11af31b1f31551e820e03d6a9404382656aef93))

## 2.1.10 (2025-11-28)

### 🐛 Bug Fixes

- **upgrade:** prevent recursive self-upgrade with env flag ([43416fa](https://github.com/SylphxAI/flow/commit/43416faabf18a6ba93c4c739a7fe1300aa63cb60))
- **upgrade:** re-exec process after self-upgrade ([d2111f8](https://github.com/SylphxAI/flow/commit/d2111f800eb91e0b377d4e434ccdb214d71a1d27))

## 2.1.9 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** use process.cwd() instead of undefined cwd variable ([aa99db0](https://github.com/SylphxAI/flow/commit/aa99db0a96bb333c38da3c73c325fddf124948d8))

## 2.1.8 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** explicitly pass --mcp-config flag to Claude Code ([fa955e9](https://github.com/SylphxAI/flow/commit/fa955e95b14bbbec3ebf7e93dab5ca959e9f012b))

## 2.1.7 (2025-11-28)

### 🐛 Bug Fixes

- **mcp:** approve MCP servers for Claude Code during attach ([19cdc3b](https://github.com/SylphxAI/flow/commit/19cdc3bea9df58bc9c1fe55242a8e2858c1303c1))

## 2.1.6 (2025-11-28)

### 🐛 Bug Fixes

- **settings:** respect saved MCP server enabled state ([8447cea](https://github.com/SylphxAI/flow/commit/8447cea1b2f46e49cfc1bd7e57e557307d072163))
- **mcp:** return default servers when no config exists ([bd6c588](https://github.com/SylphxAI/flow/commit/bd6c58819cdde8e31bd18cdc2f05c2c45e4f3d39))

### ♻️ Refactoring

- **mcp:** implement SSOT for server configuration ([e0b5ee0](https://github.com/SylphxAI/flow/commit/e0b5ee01d4952e825d81005465147ce39963bbd0))

### 🔧 Chores

- format package.json (tabs to spaces) ([305096a](https://github.com/SylphxAI/flow/commit/305096a9e276a3626415d76b8f313e95dc6daeff))

## 2.1.5 (2025-11-28)

### 🐛 Bug Fixes

- **settings:** use MCP_SERVER_REGISTRY instead of hardcoded list ([79fb625](https://github.com/SylphxAI/flow/commit/79fb625c27f58f7f62902314d92c205fdc84a06e))

### ♻️ Refactoring

- **settings:** extract checkbox configuration handler ([66303bb](https://github.com/SylphxAI/flow/commit/66303bb21a5281e5f358c69b8a6c143f3866fa76))
- **attach:** extract file attachment pure functions ([5723be3](https://github.com/SylphxAI/flow/commit/5723be3817804228014ceec8de27f267c990fbe8))
- **targets:** extract shared pure functions for MCP transforms ([0bba2cb](https://github.com/SylphxAI/flow/commit/0bba2cbc4a4233e0d63a78875346a2e9c341d803))

### 🔧 Chores

- remove dead cursor target references ([bf16f75](https://github.com/SylphxAI/flow/commit/bf16f759ec4705ddf0a763ea0ef6c778c91ccbbe))

## 2.1.4 (2025-11-28)

### ♻️ Refactoring

- **flow:** eliminate hardcoded target checks with Target interface ([1dc75f9](https://github.com/SylphxAI/flow/commit/1dc75f9d4936b51554b1d09bf8576f832ce131e9))

### 🔧 Chores

- apply @sylphx/doctor fixes for 100% health score ([ae55969](https://github.com/SylphxAI/flow/commit/ae5596924dab48675ff3100b40f67651e7ebe26f))
- remove unused api.types.ts re-export file ([ad8f6a6](https://github.com/SylphxAI/flow/commit/ad8f6a6b8dcad75d2c0201f2286e52adccb728c7))
- remove dead code and unused modules ([6eaa904](https://github.com/SylphxAI/flow/commit/6eaa90438dcb40f9508953e874bf8c04204ae017))

## 2.1.3

### Patch Changes

- f571de3: Fix rules and output styles loading logic

  - Fix output styles duplication: Only attach during runtime, not during attach phase
  - Fix rules loading: Use intersection of agent frontmatter rules and globally enabled rules
  - Remove deprecated command files (execute.ts, setup.ts, run-command.ts)
  - Move loadAgentContent and extractAgentInstructions to agent-enhancer.ts

## 2.1.2

### Patch Changes

- ad6ae71: Fix upgrade command not detecting Flow CLI version

  **Bug Fix:**

  The `sylphx-flow upgrade` command was incorrectly reading the version from project config file instead of the globally installed CLI package. This caused it to always report "All components are up to date" even when a newer version was available.

  **Changes:**

  - Fixed `getCurrentFlowVersion()` to read from the running CLI's package.json
  - Added fallback to check globally installed package version
  - Now correctly detects when Flow CLI needs updating

  **Before:**

  ```bash
  $ sylphx-flow upgrade
  ✓ All components are up to date  # Wrong!
  ```

  **After:**

  ```bash
  $ sylphx-flow upgrade
  Sylphx Flow: 2.1.1 → 2.1.2
  Upgrade to latest version? (Y/n)
  ```

## 2.1.1

### Patch Changes

- 8ae48d6: Fix singleFiles location and improve settings cleanup

  **Bug Fixes:**

  1. Fixed silent.md location bug - output style files were incorrectly written to project root instead of target config directory (.claude/ or .opencode/)

  2. Enhanced clearUserSettings to ensure complete cleanup in replace mode:
     - Now clears ALL user configuration including hooks, complete MCP config, rules, and singleFiles
     - Removes entire MCP section (not just servers) to properly clear user hooks
     - Added legacy cleanup to remove incorrectly placed files from project root

  This fixes the issue where user's hooks and MCP configs were still affecting execution even in replace mode (non-merge mode).

## 2.1.0

### Minor Changes

- 09608be: Auto-installation and auto-upgrade features

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

### Patch Changes

- cc065f2: Code cleanup and refactoring

  **Removed:**

  - All legacy config migration code (~70 lines)
  - OpenCode old directory cleanup logic (~16 lines)
  - Deprecated FileInstaller and MCPInstaller classes (~60 lines)
  - Unused deprecated exports (ALL_TARGETS, IMPLEMENTED_TARGETS)

  **Refactored:**

  - Migrated from class-based installers to functional API
  - opencode.ts: Direct function calls instead of class wrappers
  - claude-code.ts: Direct function calls instead of class wrappers

  **Improved:**

  - Removed ~179 lines of dead code
  - Cleaner functional API
  - Better code organization and modularity
  - Comprehensive JSDoc documentation
  - Consistent error handling patterns

  **Result:**

  - Zero technical debt
  - Zero deprecated code
  - Modern, maintainable codebase

- edb043c: Fix target selection logic to properly distinguish between three cases

  **Fixed:**

  - Target selection now correctly handles three distinct scenarios:
    1. User explicitly set "ask-every-time" → always prompt
    2. User has no setting (undefined/null) → allow auto-detect
    3. User has specific target → use that target

  **Improved:**

  - Better code clarity with explicit case handling
  - More predictable behavior for different user preferences
  - Enhanced logic comments for maintainability

## 2.0.0

### Major Changes

- aaadcaa: Settings-based configuration and improved user experience

  **New Features:**

  - **Settings management**: Configure agents, rules, and output styles via `sylphx-flow settings`
    - Select which agents are enabled
    - Set default agent to use
    - Enable/disable specific rules (core, code-standards, workspace)
    - Enable/disable output styles (silent)
  - **Settings-driven execution**: Flow respects your settings and only loads enabled components
  - **Config files**: All settings stored in `~/.sylphx-flow/` (settings.json, flow-config.json, provider-config.json, mcp-config.json)
  - **Git skip-worktree integration**: Flow automatically hides `.claude/` and `.opencode/` changes from git
    - Uses `git update-index --skip-worktree` to hide Flow's temporary modifications
    - Prevents LLM from seeing or committing Flow's settings changes
    - Automatically restores git tracking after execution
    - Works seamlessly with version-controlled settings

  **Breaking Changes:**

  - Removed `--quick` flag - no longer needed
  - Removed first-run setup wizard - configs are created automatically with sensible defaults
  - Agent loading now respects enabled rules and output styles from settings

  **Improvements:**

  - Config files are automatically initialized on first use with default values
  - Provider selection happens inline when needed (if set to "ask-every-time")
  - Fixed Ctrl+C handling to ensure settings are restored immediately
  - Simplified CLI options - only `--merge` flag for attach strategy
  - Default agent can be set in settings (falls back to 'coder' if not set)

  **Ctrl+C Fix:**
  When users press Ctrl+C during interactive prompts, the application now:

  - Catches the cancellation gracefully
  - Runs cleanup (restores backed-up settings)
  - Shows a friendly cancellation message
  - Exits cleanly

  Previously, pressing Ctrl+C would exit immediately without restoring settings, requiring recovery on the next run.

### Minor Changes

- 9fa65d4: Add automatic upgrade detection with smart package manager support

  - Auto-detect updates on startup with non-intrusive notifications
  - Enhanced `upgrade` command with `--auto` flag for automatic installation
  - Smart package manager detection (npm, bun, pnpm, yarn)
  - Version checking against npm registry for both Flow and target platforms
  - Package-manager-specific upgrade commands in notifications
  - New UPGRADE.md documentation with package manager support
  - Silent background checks that don't block execution
  - Support for both interactive and automatic upgrade flows
  - Comprehensive test coverage for package manager detection

## 1.8.2

### Patch Changes

- 9059450: Enhance Next Actions section with suggestions when no clear next step

  Updated completion report structure to include proactive suggestions in Next Actions section:

  - Remaining work (existing functionality)
  - Suggestions when no clear next step (new)

  Benefits:

  - Guides user on potential improvements
  - Provides proactive recommendations
  - Helps prevent "what's next?" moments
  - Encourages continuous iteration

  Example updated to show suggestion format: "Consider adding rate limiting, implement refresh token rotation, add logging for security events"

## 1.8.1

### Patch Changes

- ad56fc3: Add structured completion report format to prompts

  Added comprehensive 3-tier report structure to guide task completion reporting:

  **Tier 1 - Always Required:**

  - Summary, Changes, Commits, Tests, Documentation, Breaking Changes, Known Issues

  **Tier 2 - When Relevant:**

  - Dependencies, Tech Debt, Files Cleanup/Refactor, Next Actions

  **Tier 3 - Major Changes Only:**

  - Performance, Security, Migration, Verification, Rollback, Optimization Opportunities

  Benefits:

  - Forces LLM to remember completed work (must write report)
  - Provides reviewable, structured output
  - Prevents incomplete reporting
  - Consistent format across all tasks

  Includes detailed example for authentication refactoring showing proper usage of each section.

- a4b0b48: Fix broken imports and Ctrl+C handling

  - Fix Ctrl+C gracefully exits during target selection instead of showing stack trace
  - Restore accidentally deleted object-utils.ts file
  - Correct 16 broken relative import paths from refactor reorganization:
    - target-config.ts: Fix imports to config/, core/, services/ (5 paths)
    - sync-utils.ts: Fix imports to types, servers, paths (3 paths)
    - mcp-config.ts: Fix imports to config/, core/, target-config (4 paths)
    - target-utils.ts: Fix import to types (1 path)
    - execute.ts, setup.ts, flow-orchestrator.ts: Fix sync-utils paths (3 paths)

  All module resolution errors fixed. Application now runs successfully.

- 7e3a3a1: Refactor codebase for better modularity and maintainability

  - Split flow-command.ts into focused modules (1207 → 258 lines, 78% reduction)
  - Reorganize utils into feature-based directories (config, display, files, security)
  - Extract reusable utilities (version, banner, status, prompt resolution)
  - Create modular flow command structure in src/commands/flow/
  - Add JSONC parser utility for JSON with comments support
  - Update all imports to use new modular structure
  - Improve code organization and separation of concerns

## 1.8.0

### Minor Changes

- 8ed73f9: Refactor prompts with working modes and default behaviors

  Major improvements to agent prompts:

  - **Default Behaviors**: Add automatic actions section to core.md (commits, todos, docs, testing, research)
  - **Working Modes**: Implement unified mode structure across all agents
    - Coder: 5 modes (Design, Implementation, Debug, Refactor, Optimize)
    - Orchestrator: 1 mode (Orchestration)
    - Reviewer: 4 modes (Code Review, Security, Performance, Architecture)
    - Writer: 4 modes (Documentation, Tutorial, Explanation, README)
  - **MEP Compliance**: Improve Minimal Effective Prompt standard (What + When, not Why + How)
  - **Remove Priority Markers**: Replace P0/P1/P2 with MUST/NEVER for clarity
  - **Reduce Token Usage**: 13% reduction in total content (5897 → 5097 words)

  Benefits:

  - Clear triggers for automatic behaviors (no more manual reminders needed)
  - Unified mode structure across all agents
  - Better clarity on what to do when
  - No duplicated content between files
  - Improved context efficiency

## 1.7.0

### Minor Changes

- Add orphaned hooks detection and removal to sync command

  The sync command now properly detects and prompts for removal of hooks that exist locally but are not in the configuration. This ensures full synchronization between local settings and the Flow configuration.

  **New Features:**

  - Detects orphaned hooks in `.claude/settings.json`
  - Shows orphaned hooks in sync preview
  - Allows users to select which orphaned hooks to remove
  - Properly cleans up settings.json after removal

  **Breaking Changes:**

  - Internal API: `selectUnknownFilesToRemove()` now returns `SelectedToRemove` object instead of `string[]`

## 1.6.13

### Patch Changes

- 746d576: Fix missing chalk import in claude-code target causing ReferenceError in dry-run mode
- ea6aa39: fix(sync): display hooks configuration in sync preview

  When running `sylphx-flow --sync`, the sync preview now shows that hooks will be configured/updated. This makes it clear to users that hook settings are being synchronized along with other Flow templates.

  Previously, hooks were being updated during sync but this wasn't visible in the sync preview output, leading to confusion about whether hooks were being synced.

- 6ea9757: Test repository link in Slack notification

## 1.6.12

### Patch Changes

- 5873a9f: Test Slack notification double parse fix

## 1.6.11

### Patch Changes

- 5e170c7: Test Slack notification toJSON fix

## 1.6.10

### Patch Changes

- 2efbfe4: Test Slack notification forEach fix

## 1.6.9

### Patch Changes

- 2ecbdae: Fix Slack notification JSON parsing with temp file approach.
- 2634f30: Test temp file fix for Slack notification - should now display correct package name.

## 1.6.8

### Patch Changes

- 1fbd555: Final test: Slack notification with single-quoted string concatenation.

## 1.6.7

### Patch Changes

- 5b44829: Test Slack notification with heredoc fix - YAML quoting resolved.
- 197e4af: Test Slack notification with one-liner - YAML syntax issues resolved.

## 1.6.6

### Patch Changes

- 47c1d39: Test Slack notification with string concatenation fix - template literal escaping resolved.

## 1.6.5

### Patch Changes

- bfa33df: Test Slack notification with errexit fix - bash -e handling resolved.

## 1.6.4

### Patch Changes

- 02cc912: Test Slack notification with env var fix - shell escaping resolved.

## 1.6.3

### Patch Changes

- db58e6a: Test Slack notification with fixed workflow - should now display correct package name and version.

## 1.6.2

### Patch Changes

- a5e299d: Test Slack notification integration with upgraded publish workflow.

## 1.6.1

### Patch Changes

- 8c6fb07: Use full term "Pragmatic Functional Programming" instead of abbreviation "Pragmatic FP" for clarity and searchability.

## 1.6.0

### Minor Changes

- 4a025d0: Refactor code standards to pragmatic functional programming. Replace dogmatic FP rules with flexible, pragmatic approach following MEP principles.

  **Key Changes:**

  - Programming Patterns: Merge 4 rules into "Pragmatic FP" (-58% tokens). Business logic pure, local mutations acceptable, composition default but inheritance when natural.
  - Error Handling: Support both Result types and explicit exceptions (previously forced Result/Either).
  - Anti-Patterns: Remove neverthrow enforcement, allow try/catch as valid option.

  **Philosophy Shift:** From "pure FP always" to "pragmatic: use best tool for the job". More MEP-compliant (prompt not teach), more flexible, preserves all core values.

## 1.5.4

### Patch Changes

- dfd0264: Revise completion reporting prompts for MEP compliance. Removed over-explanation, teaching language, and redundancy. Changed from prescriptive "what to include" lists to directive triggers. Reduced silent.md from 53 to 38 lines (-28%). Follows MEP principle: prompt (trigger behavior) not teach (explain rationale).

## 1.5.3

### Patch Changes

- f6d55a7: Fix LLM silent completion behavior by clarifying when to report results. Updated silent.md, coder.md, and core.md to distinguish between during-execution silence (no narration) and post-completion reporting (always report what was accomplished, verification status, and what changed). This addresses the issue where agents would complete work without telling the user what was done.

## 1.5.2

### Patch Changes

- fbf8f32: Add Personality section with research-backed trait descriptors (Methodical Scientist, Skeptical Verifier, Evidence-Driven Perfectionist) to combat rash LLM behavior. Refactor Character section to be more MEP-compliant and modular. Research shows personality priming achieves 80% behavioral compliance and is the most effective control method.

## 1.5.1

### Patch Changes

- 76b3c84: Add Playwright MCP server as default pre-configured server for browser automation and testing capabilities

## 1.5.0

### Minor Changes

- 65c2446: Refactor all prompts with research-backed MEP framework. Adds priority markers (P0/P1/P2), XML structure for complex instructions, concrete examples, and explicit verification criteria. Based on research showing underspecified prompts fail 2x more often and instruction hierarchy improves robustness by 63%. All prompts now pass "intern on first day" specificity test while remaining minimal.

## 1.4.20

### Patch Changes

- d34613f: Add comprehensive prompting guide for writing effective LLM prompts. Introduces 5 core principles: pain-triggered, default path, immediate reward, natural integration, and self-interest alignment. This is a meta-level guide for maintainers, not for agents to follow.

## 1.4.19

### Patch Changes

- c7ce3ac: Fix workspace.md execution issues with realistic strategies

  Critical fixes:

  - Fixed cold start: Check exists → create if needed → read (was: read immediately, failing if missing)
  - Changed to batch updates: Note during work, update before commit (was: update immediately, causing context switching)
  - Realistic verification: Spot-check on read, full check before commit (was: check everything on every read)
  - Objective ADR criteria: Specific measurable conditions (was: subjective "can reverse in <1 day?")
  - Added concrete examples to all templates (was: generic placeholders causing confusion)

  Additional improvements:

  - Added SSOT duplication triggers (when to reference vs duplicate)
  - Added content boundary test (README vs context.md decision criteria)
  - Added detailed drift fix patterns with conditions
  - Expanded red flags list
  - Clarified update strategy with rationale

  Result: Executable, realistic workspace management that LLM agents can actually follow.

  Before: 265 lines with execution problems
  After: 283 lines (+7%) with all critical issues fixed, higher information density

## 1.4.18

### Patch Changes

- 156db14: Optimize rules and agents with MEP principles

  - Optimized core.md: removed duplicates, agent-specific content (222→91 lines, -59%)
  - Optimized code-standards.md: removed duplicates, kept unique technical content (288→230 lines, -20%)
  - Optimized workspace.md: applied MEP, added drift resolution (317→265 lines, -16%)
  - Optimized coder.md: added Git workflow section (157→169 lines)
  - Optimized orchestrator.md: condensed orchestration flow (151→120 lines, -21%)
  - Optimized reviewer.md: condensed review modes and output format (161→128 lines, -20%)
  - Optimized writer.md: condensed writing modes (174→122 lines, -30%)

  Overall reduction: 1,470→1,125 lines (-23%)

  All files now follow MEP (Minimal Effective Prompt) principles: concise, direct, trigger-based, no step-by-step, no WHY explanations.

## 1.4.17

### Patch Changes

- ef8463c: Refactor workspace.md rule to follow Minimal Effective Prompt principles. Reduced from 486 to 244 lines (50% reduction) by removing teaching, applying trigger-based outcomes, condensing templates, and trusting LLM capability.

## 1.4.16

### Patch Changes

- 54ad8ff: Fix agent enhancement by reading rules before transformation (CRITICAL):
  - Rules field was read AFTER transformation (which strips it for Claude Code)
  - Now reads rules from original content BEFORE transformation
  - Rules field correctly stripped in final output (Claude Code doesn't use it)
  - Fixes: only core.md was loaded, code-standards and workspace were ignored

## 1.4.15

### Patch Changes

- 638418b: Fix agent enhancement by preserving rules field in frontmatter (CRITICAL):
  - convertToClaudeCodeFormat was stripping the rules field
  - Enhancement logic needs rules field to know which rules to load
  - Now preserves rules array in transformed frontmatter
  - Fixes: only core.md was being loaded, code-standards and workspace were ignored

## 1.4.14

### Patch Changes

- 11abdf2: Add workspace.md rule to agent frontmatter:

  - Coder: added workspace (creates .sylphx/ documentation)
  - Reviewer: added workspace (checks workspace conventions)
  - Writer: added workspace (documents .sylphx/ patterns)
  - Orchestrator: kept core only (coordination, no file creation)

  Ensures workspace documentation rule is properly embedded in Claude Code agent files.

## 1.4.13

### Patch Changes

- 1d0ac4e: Add startup check for new templates:
  - Detects missing templates on startup (new templates not installed locally)
  - Shows notification with count of new agents/commands/rules
  - Prompts user to run --sync to install
  - Ignores unknown files (custom user files)
  - Non-blocking - just informational

## 1.4.12

### Patch Changes

- d88d280: Show missing templates in sync preview:
  - Added "Will install (new templates)" section
  - Users can now see which templates will be newly installed
  - Better visibility into what changes sync will make

## 1.4.11

### Patch Changes

- 22ddfb9: Fix sync to dynamically scan templates instead of hardcoding (CRITICAL):
  - Now scans assets/ directory at runtime for agents, slash commands, and rules
  - Prevents sync from breaking when templates change
  - Old commands (commit, context, explain, review, test) now correctly detected as unknown files
  - New commands (cleanup, improve, polish, quality, release) properly recognized as Flow templates

## 1.4.10

### Patch Changes

- 126de1e: Fix CI auto-publish workflow NPM authentication

## 1.4.9

### Patch Changes

- 4493ee0: Remove root assets directory and simplify publish flow:

  **Cleanup:**

  - Removed duplicate root assets/ directory (4080 lines)
  - packages/flow/assets/ is now single source of truth
  - Updated prepublishOnly to no-op (assets already in package)

  **Templates (now correctly published):**

  - Agents: coder, orchestrator, reviewer, writer (MEP optimized)
  - Rules: core, code-standards, workspace (MEP optimized + NEW)
  - Slash commands: cleanup, improve, polish, quality, release (NEW)
  - Output styles: silent (prevent report files)

  **Root cause:** Root assets/ was copied to package during publish, causing template sync issues.

## 1.4.6

### Patch Changes

- b4a5087: Restore MEP-optimized templates accidentally reverted in v1.3.0:

  **Agents (MEP optimized):**

  - Coder, Orchestrator, Reviewer, Writer - streamlined prompts with 40% token reduction

  **Rules (MEP optimized + new):**

  - core.md - universal rules with behavioral triggers
  - code-standards.md - shared quality standards
  - workspace.md - NEW: auto-create .sylphx/ workspace documentation

  **Slash Commands (complete replacement):**

  - Removed: commit, context, explain, review, test
  - Added: cleanup, improve, polish, quality, release
  - Essential workflows over granular utilities

  **Output Styles:**

  - silent.md - prevent agents from creating report files

  **Root cause:** Working on sync feature from stale branch without latest templates.

## 1.4.4

### Patch Changes

- 4de084e: Add comprehensive debug logging to trace sync file operations:

  - **Deletion verification**: Check file exists before/after unlink to verify actual deletion
  - **Installation logging**: Show force flag status, file paths, and write verification
  - **Force flag propagation**: Log when force mode is activated for agents and slash commands

  This diagnostic release helps identify why sync appears successful but git shows no changes.

## 1.4.3

### Patch Changes

- Fix sync not actually updating files (CRITICAL):
  - Installation was comparing content and skipping writes
  - Even after deletion, files weren't updated if content "matched"
  - Add force mode that always overwrites during sync
  - Sync now properly updates all files regardless of content

## 1.4.2

### Patch Changes

- Add visible deletion output during sync:
  - Show each file being deleted with checkmark
  - Display MCP servers being removed
  - Clear visual feedback of the full sync process
  - Users can now see exactly what's happening

## 1.4.1

### Patch Changes

- Fix rules scanning showing all project markdown files:
  - Skip rules scanning for Claude Code (rules embedded in agent files)
  - Only scan when target has explicit rulesFile config
  - Prevent scanning entire project directory

## 1.4.0

### Minor Changes

- Complete sync redesign with intelligent file categorization:
  - Categorize all files: agents, commands, rules, MCP servers
  - Separate Flow templates (auto-sync) from unknown files (user decides)
  - New flow: preview → select unknowns → summary → confirm → execute
  - Preserve user custom files by default (no accidental deletion)
  - Multi-select UI for unknown files
  - Clear visibility: what syncs, what's removed, what's preserved
  - Remove all Chinese text (English only)

## 1.3.1

### Patch Changes

- Redesign sync flow for better clarity:
  - Remove duplicate config files in preserved list
  - Show MCP check in preview upfront (not after confirmation)
  - Combined preview: templates + MCP servers + preserved files
  - Clear sections with emojis for easy scanning

## 1.3.0

### Minor Changes

- Enhanced --sync with MCP registry checking:
  - Detect servers not in Flow registry (removed or custom)
  - Interactive selection for removal
  - Clean removal from .mcp.json
  - Flow: sync templates → check MCP → remove selected

## 1.2.1

### Patch Changes

- Apply MEP principles to workspace documentation rule:
  - Condensed from verbose instructions to condition→action format
  - Removed step-by-step teaching and command examples
  - Embedded verification in directives
  - 31% reduction while maintaining clarity

## 1.2.0

### Minor Changes

- 2272596: Enhanced agent system prompts with Minimal Effective Prompt principles:

  - **Workflow Standards**: Added continuous atomic commits, semver discipline (minor-first), TypeScript release workflow with changeset + CI, and proactive pre-commit cleanup
  - **Research-First Mindset**: Enforced research before implementation to prevent outdated approaches
  - **Silent Mode Fix**: Prevented agents from creating report files to compensate for not speaking
  - **Proactive Cleanup**: Added mandatory pre-commit hygiene - refactor, remove unused code, delete outdated docs, fix tech debt
  - **MEP Refactor**: Refactored all prompts (coder, orchestrator, reviewer, writer, core, code-standards, silent) using Minimal Effective Prompt principles - trust LLM, WHAT+WHEN not HOW+WHY, condition→action format, ~40% token reduction

  Prime directive: Never accumulate misleading artifacts. Research is mandatory. Tests and benchmarks required (.test.ts, .bench.ts).

## 1.1.1

### Patch Changes

- 5b1adfb: Fix missing runtime dependencies in package.json

  Add missing dependencies that are required when the package is installed globally:

  - react and ink (for UI components)
  - drizzle-orm and @libsql/client (for database operations)
  - @modelcontextprotocol/sdk (for MCP features)
  - @lancedb/lancedb (for vector storage)
  - @huggingface/transformers (for tokenization)
  - chokidar (for file watching)
  - ignore (for gitignore parsing)
  - ai (for AI SDK features)

  This fixes the error: "Cannot find module 'react/jsx-dev-runtime'" when running sylphx-flow -v after global installation.

## 1.1.0

### Minor Changes

- 7fdb9f2: Simplify provider selection - always ask, never save defaults

  **Breaking Change**: Removed smart defaults for provider/agent selection

  **Before:**

  - Initial setup saved default provider
  - Runtime choices were automatically saved
  - Smart defaults applied on next run
  - Complex conditional logic with useDefaults flags

  **After:**

  - Initial setup only configures API keys
  - Always prompts for provider/agent each run
  - No automatic saving of runtime choices
  - Simple: want to skip prompts? Use `--provider` / `--agent` args

  **Migration:**
  Users who relied on saved defaults should now:

  - Use `--provider default --agent coder` in scripts
  - Or accept the prompt on each run

  **Example:**

  ```bash
  # Always prompts (new default behavior)
  sylphx-flow "your prompt"

  # Skip prompts with args
  sylphx-flow --provider default --agent coder "your prompt"
  ```

  This change reduces code complexity by 155 lines and makes behavior more predictable.

## 1.0.6

### Patch Changes

- 841929e: Include assets directory with agents, rules, and templates in npm package

## 1.0.5

### Patch Changes

- Fix Claude Code component detection - rules and output styles are included in agent files

## 1.0.4

### Patch Changes

- Fix false "missing components" warning by checking if directories contain files

## 1.0.3

### Patch Changes

- Publish source code instead of bundled dist to fix Unicode and native binding issues

## 1.0.2

### Patch Changes

- Fix missing dist directory in npm package by adding prepublishOnly script

## 1.0.0

### Major Changes

- 2ee21db: 🎉 **Sylphx Flow v1.0.0 - Production Release**

  Major release with autonomous loop mode, auto-initialization, and production-ready features.

  ## 🚀 Major Features

  ### Loop Mode - Autonomous Continuous Execution

  - **Revolutionary autonomous AI** that keeps working until you stop it
  - Zero wait time by default (task execution time is natural interval)
  - Optional wait time for polling scenarios: `--loop [seconds]`
  - Max runs limit: `--max-runs <count>`
  - Smart configuration: Saves provider/agent preferences automatically
  - **Platform Support**: Claude Code (full support), OpenCode (coming soon)

  ```bash
  # Continuous autonomous work
  sylphx-flow "process all github issues" --loop --target claude-code

  # With wait time and limits
  sylphx-flow "check for updates" --loop 300 --max-runs 20
  ```

  ### Auto-Initialization

  - **Zero configuration required** - setup happens automatically on first use
  - Smart platform detection (Claude Code, OpenCode)
  - Intelligent defaults that learn from your choices
  - Manual setup still available: `sylphx-flow --init-only`

  ### Template Synchronization

  - New `--sync` flag to synchronize with latest Flow templates
  - Updates agents, rules, output styles, and slash commands
  - Safe sync: Won't overwrite user customizations
  - Platform-specific sync: `--sync --target opencode`

  ### File Input Support

  - Load prompts from files: `sylphx-flow "@task.txt"`
  - No shell escaping issues
  - Perfect for complex, reusable instructions
  - Works with loop mode: `sylphx-flow "@prompt.md" --loop`

  ## ✨ Enhancements

  ### CLI Improvements

  - Simplified command structure - direct execution without subcommands
  - Better error messages and validation
  - Improved verbose output for debugging
  - Command printing in headless/loop mode

  ### Platform Support

  - **Claude Code**: Full support with headless execution
  - **OpenCode**: Full support (loop mode coming soon due to TTY requirements)
  - Auto-detection of target platform
  - Manual override: `--target claude-code` or `--target opencode`

  ### Branding & Documentation

  - Modern flow infinity symbol icon system
  - Comprehensive documentation with VitePress
  - Clear platform support matrix
  - Updated examples and guides

  ## 🐛 Bug Fixes

  - Fix targetId undefined in loop mode initialization
  - Remove problematic flags from OpenCode headless mode
  - Resolve init command never executing - agents now install properly
  - Fix ConfigDirectoryTypoError by cleaning up old 'commands' directory

  ## 📦 Package Configuration

  - Configured for npm publishing
  - Proper entry points and exports
  - Type definitions included
  - MIT license

  ## 🔄 Breaking Changes

  - Loop mode default interval changed from 60s to 0s (no wait time)
  - Command structure simplified (subcommands still work but not required)
  - Init/run commands consolidated into flow command

  ## 📚 Documentation

  - Complete rewrite emphasizing auto-initialization
  - Loop mode clearly marked as Claude Code only
  - New --sync flag documentation
  - Simplified getting started guide
  - Updated CLI commands reference

  ## 🙏 Migration Guide

  ### From pre-1.0 versions:

  ```bash
  # Old way
  sylphx-flow init
  sylphx-flow run "task"
  sylphx-flow run "task" --loop

  # New way (auto-initializes)
  sylphx-flow "task"
  sylphx-flow "task" --loop --target claude-code
  ```

  ### Loop mode interval:

  ```bash
  # Old default: 60s wait time
  sylphx-flow "task" --loop

  # New default: 0s wait time (immediate)
  sylphx-flow "task" --loop

  # If you want wait time, specify explicitly:
  sylphx-flow "task" --loop 60
  ```

  ## 🔗 Links

  - [Documentation](https://flow.sylphx.ai)
  - [GitHub Repository](https://github.com/sylphxltd/flow)
  - [Getting Started Guide](https://flow.sylphx.ai/guide/getting-started)

## 1.0.0

### Major Changes

- # 1.0.0 - Major Release

  Sylphx Flow 1.0.0 is a complete reimagination of AI-powered development workflow automation. This release represents months of refinement, optimization, and user feedback integration.

  ## 🚀 Major Features

  ### Loop Mode - Autonomous Continuous Execution

  Revolutionary loop mode that enables truly autonomous AI agents:

  - **Continuous execution** with automatic context preservation
  - **Zero wait time default** - task execution is the natural interval
  - **Smart continue mode** - auto-enables from 2nd iteration
  - **Graceful shutdown** - Ctrl+C handling with summaries
  - **Configurable wait times** for rate limiting or polling scenarios

  ```bash
  # Continuous autonomous work
  sylphx-flow "process all github issues" --loop

  # With wait time for polling
  sylphx-flow "check for new commits" --loop 300 --max-runs 20
  ```

  ### File Input Support

  Load prompts from files for complex, reusable instructions:

  - **@file syntax** - `@prompt.txt` or `@/path/to/prompt.txt`
  - **No shell escaping issues** - write natural language prompts
  - **Version control friendly** - commit prompts alongside code
  - **Works seamlessly with loop mode**

  ```bash
  # Use file input
  sylphx-flow "@task.txt" --loop --max-runs 10
  ```

  ### Smart Configuration System

  Intelligent defaults that learn from your choices:

  - **Auto-saves preferences** - provider, agent, target selections
  - **Smart defaults** - uses saved preferences automatically
  - **Selective override** - `--select-provider` / `--select-agent` flags
  - **Inline API key setup** - configure keys when selecting providers
  - **No repeated prompts** - set once, use forever

  ### OpenCode Integration

  Full support for OpenCode (Claude Code alternative):

  - **Auto-detection** of OpenCode installation
  - **Target-aware component checking**
  - **JSONC config parsing** for OpenCode's commented configs
  - **Directory structure adaptation** (singular vs plural naming)
  - **Automatic migration** from old directory structures

  ## 🔧 Major Improvements

  ### Flow Orchestrator Architecture

  Complete refactor for separation of concerns:

  - **Modular design** - clean separation of init/setup/launch phases
  - **State-driven decisions** - smart detection of project state
  - **Positive logic patterns** - explicit conditions instead of negative flags
  - **Component integrity** - automatic detection and repair of missing components

  ### Performance Optimizations

  - **Loop mode optimization** - setup once, execute repeatedly (no redundant checks)
  - **Parallel execution** - concurrent independent operations
  - **Smart caching** - reuse configuration across runs
  - **Reduced overhead** - streamlined initialization flow

  ### Developer Experience

  - **Better error messages** - actionable feedback with suggestions
  - **Progress indicators** - clear feedback during long operations
  - **Dry-run mode** - preview commands before execution
  - **Verbose mode** - detailed output for debugging
  - **Headless mode** - `-p` for non-interactive execution

  ## 🐛 Bug Fixes

  ### Critical Fixes

  - **Init command execution** - fixed Commander.js action() misuse that prevented initialization
  - **State detection timing** - only check components after target is known
  - **MCP detection** - proper JSONC parsing for OpenCode configs
  - **Directory naming** - fixed OpenCode command/commands mismatch
  - **Continue flag logic** - proper handling of conversation context

  ### OpenCode Specific

  - **YAML field compatibility** - removed unsupported fields (name, mode, rules)
  - **Automatic cleanup** - removes legacy directories to prevent crashes
  - **Config validation** - proper error handling for invalid configurations

  ### Memory & Settings

  - **Persistent settings** - fixed "re-prompt every run" issue
  - **Target-specific configs** - separate settings per platform
  - **Environment variables** - proper inheritance to spawned processes

  ## 📚 Documentation

  ### Comprehensive Guides

  - **LOOP_MODE.md** - Complete loop mode documentation (English)
  - **Updated help text** - clearer, more descriptive option descriptions
  - **Inline examples** - usage examples in help output
  - **Consistent terminology** - "wait time" instead of mixed "interval/cooldown"

  ### API Reference

  - Clear parameter descriptions
  - Recommended values for all options
  - When to use each feature
  - Troubleshooting guides

  ## ⚠️ Breaking Changes

  ### Configuration File Rename

  - Old: `.sylphx-flow/config.json`
  - New: `.sylphx-flow/settings.json`
  - Migration: Automatic on first run

  ### Default Behavior Changes

  - **Loop interval default**: 60s → 0s (immediate execution)
  - **Init logic**: Negative logic → Positive logic (explicit conditions)
  - **Provider selection**: Opt-in defaults → Smart defaults (auto-use saved)

  ### Removed Features

  - **Deprecated commands**: Old separate init/run commands (use integrated `flow` command)
  - **Complex loop strategies**: Removed over-engineered exit conditions (until-success, until-stable)

  ## 🔄 Migration Guide

  ### From 0.x to 1.0

  1. **Update package**:

  ```bash
  bun update @sylphx/flow
  ```

  2. **Config auto-migrates** on first run - no manual steps needed

  3. **Loop mode users**: If you were using `--loop 60`, consider removing the number for faster continuous execution:

  ```bash
  # Before (0.x)
  sylphx-flow "task" --loop 60

  # After (1.0 - faster)
  sylphx-flow "task" --loop

  # Or keep wait time if needed
  sylphx-flow "task" --loop 60
  ```

  4. **Provider/Agent selection**: No longer need `--use-defaults` - it's automatic now

  ## 🙏 Acknowledgments

  This release incorporates extensive user feedback and addresses real-world usage patterns. Thank you to all contributors and early adopters who helped shape this release.

  ## 📊 Stats

  - **50+ commits** since 0.3.0
  - **15+ major features** added
  - **20+ bug fixes**
  - **Full OpenCode support**
  - **10x faster loop execution** (setup overhead removed)
