---
'@sylphx/flow': patch
---

Code cleanup and refactoring

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
