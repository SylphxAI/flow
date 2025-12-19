---
name: review
description: Review codebase by topic - /review <what to review>
args:
  - name: topic
    description: What to review (e.g., auth, security, "the login flow", "why it's slow")
    required: true
---

# Review: $ARGS

## Mandate

- **Think like the failure mode.** Security → attacker. Performance → slow network. Auth → confused user.
- **Delegate workers** for parallel research. You synthesize and verify.
- **Fix, don't report.** Implement solutions directly.

## Execution

1. **Load skills** — Use the Skill tool to load guidelines for relevant domains. Read the guidelines.

2. **Understand** — How is this implemented? Architecture, choices, tradeoffs.

3. **Find issues** — What violates the guidelines? What's wrong and why it matters?

4. **Fix** — Implement solutions directly.

## Output

```
## Review: [topic]

### Understanding
[Architecture, choices, tradeoffs]

### Issues
[What's wrong and why]

### Fixed
[Changes made]

### Remains
[Needs human decision]
```
