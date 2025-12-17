---
"@sylphx/flow": minor
---

refactor: convert guidelines to Agent Skills (model-invoked)

Breaking change in asset structure:
- 25 guideline files moved from `slash-commands/guideline-xxx.md` to `skills/xxx/SKILL.md`
- Skills auto-activate based on context - no explicit invoke needed
- `/review` and `/continue` simplified - skills handle domain knowledge
- Fixes issue where LLM couldn't invoke slash commands properly
