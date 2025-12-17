---
"@sylphx/flow": patch
---

perf: simplify version check - no TTL, always background

- Remove 24-hour cache TTL
- Background check runs every time (always fresh for next run)
- All version info stored in ~/.sylphx-flow/versions.json
- Startup always instant, update notice on next run
