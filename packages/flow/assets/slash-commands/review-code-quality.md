---
name: review-code-quality
description: Review code quality - linting, TypeScript, testing, CI
agent: coder
---

# Code Quality Review

## Mandate

* Perform a **deep, thorough review** of code quality in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.

## Review Scope

### Non-Negotiable Engineering Principles

* No workarounds, hacks, or TODOs.
* Feature-first with clean architecture; designed for easy extension; no "god files".
* Type-first, strict end-to-end correctness (**DB → API → UI**).
* Serverless-first and server-first; edge-compatible where feasible without sacrificing correctness, security, or observability.
* Mobile-first responsive design; desktop-second.
* Precise naming; remove dead/unused code.
* Upgrade all packages to latest stable; avoid deprecated patterns.

### Tooling Baseline

* **Bun** for runtime
* **Biome** for linting/formatting
* **Bun test** for testing
* Strict TypeScript

### CI Requirements

* Biome lint/format passes
* Strict TS typecheck passes
* Unit + E2E tests pass
* Build succeeds

### Code Quality Best Practices

* Consistent code style
* Meaningful variable/function names
* Single responsibility principle
* DRY (Don't Repeat Yourself)
* SOLID principles
* No circular dependencies
* Reasonable file sizes
* Clear module boundaries

## Verification Checklist

- [ ] Biome lint passes
- [ ] Biome format passes
- [ ] TypeScript strict mode
- [ ] No type errors
- [ ] Tests exist and pass
- [ ] Build succeeds
- [ ] No TODOs/hacks
- [ ] No dead code
- [ ] Packages up to date
