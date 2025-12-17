---
release: patch
---

### Improvements

- **cli**: Make CLI output truly minimal and modern
  - Remove all verbose status messages (backup, restore, session recovery)
  - Remove emoji icons (🔧, ✔) for cleaner output
  - Remove "Attached" and "Running" status lines
  - Silent git worktree operations
  - Silent crash recovery on startup
  - Only show header: `flow {version} → {target}`
