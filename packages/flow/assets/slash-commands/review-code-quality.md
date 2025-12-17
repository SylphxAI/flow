---
name: review-code-quality
description: Review code quality - architecture, types, testing, maintainability
agent: coder
---

# Code Quality Review

## Mandate

* Perform a **deep, thorough review** of code quality in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify code that works but shouldn't exist in its current form.

## Tech Stack

* **Runtime**: Bun
* **Linting/Formatting**: Biome
* **Testing**: Bun test
* **Language**: TypeScript (strict)

## Non-Negotiables

* No TODOs, hacks, or workarounds in production code
* Strict TypeScript with end-to-end type safety (DB → API → UI)
* No dead or unused code

## Context

Code quality isn't about following rules — it's about making the codebase a place where good work is easy and bad work is hard. High-quality code is readable, testable, and changeable. Low-quality code fights you on every change.

Don't just look for rule violations. Look for code that technically works but is confusing, fragile, or painful to modify. Look for patterns that will cause bugs. Look for complexity that doesn't need to exist.

## Driving Questions

* What code would you be embarrassed to show a senior engineer?
* Where is complexity hiding that makes the codebase hard to understand?
* What would break if someone new tried to make changes here?
* Where are types lying (as any, incorrect generics, missing null checks)?
* What test coverage gaps exist for code that really matters?
* If we could rewrite one part of this codebase, what would have the highest impact?
