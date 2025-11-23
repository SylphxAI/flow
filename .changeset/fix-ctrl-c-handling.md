---
'@sylphx/flow': major
---

Settings-based configuration and improved user experience

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
