---
"@sylphx/flow": patch
---

perf: make startup instant with background version checking

- Version checks now use 24-hour cache, no network blocking on startup
- Background check updates cache for next run
- Removes 1.4s+ latency from `npm view` calls
