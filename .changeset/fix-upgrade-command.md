---
"@sylphx/flow": patch
---

Fix upgrade command not detecting Flow CLI version

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
