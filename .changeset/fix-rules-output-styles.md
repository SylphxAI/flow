---
"@sylphx/flow": patch
---

Fix rules and output styles loading logic

- Fix output styles duplication: Only attach during runtime, not during attach phase
- Fix rules loading: Use intersection of agent frontmatter rules and globally enabled rules
- Remove deprecated command files (execute.ts, setup.ts, run-command.ts)
- Move loadAgentContent and extractAgentInstructions to agent-enhancer.ts
