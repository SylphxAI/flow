---
'@sylphx/flow': patch
---

Fix target selection logic to properly distinguish between three cases

**Fixed:**
- Target selection now correctly handles three distinct scenarios:
  1. User explicitly set "ask-every-time" → always prompt
  2. User has no setting (undefined/null) → allow auto-detect
  3. User has specific target → use that target

**Improved:**
- Better code clarity with explicit case handling
- More predictable behavior for different user preferences
- Enhanced logic comments for maintainability
