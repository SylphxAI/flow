---
name: production-review
description: Use when the user asks for a review, audit, second pass, release readiness check, architecture review, security review, performance review, a11y review, naming review, or independent quality gate before merge or deployment.
metadata:
  short-description: Audit code and delivery readiness for production risk
---

# Production Review

Use this skill to find defects before customers do.

## Workflow

1. Identify the artifact under review and the production risk surface.
2. Read only the relevant standards:
   - `~/.codex/standards/engineering-standard.md` for architecture, schemas, Effect, APIs, data, security, observability, testing, and naming.
   - `~/.codex/standards/frontend-standard.md` for UI, accessibility, i18n, motion, and responsive behavior.
   - `~/.codex/standards/ai-architecture.md` for AI systems, evals, tracing, tools, guardrails, and provider choices.
   - `~/.codex/standards/delivery-standard.md` for PR, CI, merge, release, deploy, and production readiness.
3. Review from the boundary inward: contracts, data, permissions, failure modes, observability, then implementation details.
4. Treat naming, duplicated sources of truth, weak types, missing validation, stale comments, and awkward APIs as real defects.
5. For code review, prioritize bugs, regressions, security issues, data loss, scale failures, missing tests, and operational blind spots.
6. Do not edit files unless the user explicitly asks for fixes or the conversation clearly establishes implementation ownership.

## Output

Findings come first, ordered by severity, with precise file and line references when available.

Include:

- Severity and impact.
- Why it is a defect.
- The smallest durable fix direction.
- Open questions or assumptions.
- Residual risk and validation gaps.

If no findings are found, say that explicitly and state remaining review limits.
