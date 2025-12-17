---
name: code-quality
description: Code quality - patterns, testing, maintainability. Use for code review.
---

# Code Quality Guideline

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
