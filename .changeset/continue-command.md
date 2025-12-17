---
"@sylphx/flow": minor
---

feat(commands): add /continue command and refactor /review system

New /continue command:
- Role-based simulation (User, Developer, Admin perspectives)
- Parallel worker delegation for discovery
- Closed-loop: invokes /review for deep dive, re-invokes itself until complete

Refactored review system:
- New unified /review <domain> with centralized mandate
- 25 review-xxx → guideline-xxx (pure domain knowledge)
- Supports multi-domain reviews: /review auth security
- LLM can read multiple guidelines in parallel
