---
"@sylphx/flow": patch
---

Fix singleFiles location and improve settings cleanup

**Bug Fixes:**

1. Fixed silent.md location bug - output style files were incorrectly written to project root instead of target config directory (.claude/ or .opencode/)

2. Enhanced clearUserSettings to ensure complete cleanup in replace mode:
   - Now clears ALL user configuration including hooks, complete MCP config, rules, and singleFiles
   - Removes entire MCP section (not just servers) to properly clear user hooks
   - Added legacy cleanup to remove incorrectly placed files from project root

This fixes the issue where user's hooks and MCP configs were still affecting execution even in replace mode (non-merge mode).
