---
release: minor
---

Add comprehensive SaaS review command suite with parallel worker delegation.

- `/saas-admin`: Admin platform review (RBAC, bootstrap, config, feature flags, ops)
- Updated `/saas-review`: All 8 workers run in parallel (domains + discovery)
- Clarified Task tool delegation pattern for worker spawning
