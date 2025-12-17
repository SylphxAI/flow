---
"@sylphx/flow": patch
---

feat(commands): add /continue slash command

New command to scan for incomplete work and finish it:
- Parallel worker delegation for discovery
- Categories: TODOs, stubs, missing error handling, test gaps
- Prioritizes by severity, implements fixes directly
