---
"@sylphx/flow": patch
---

perf: cache target CLI current version

- Target current version (`claude --version`) now cached
- Removes 0.5s blocking call on startup
- All version checks now instant from 24-hour cache
