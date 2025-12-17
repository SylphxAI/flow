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
* **Explore beyond the spec**: identify maintainability issues and technical debt.

## Tech Stack

* **Runtime**: Bun
* **Linting/Formatting**: Biome
* **Testing**: Bun test
* **Language**: TypeScript (strict)

## Review Scope

### Non-Negotiable Engineering Principles

* No workarounds, hacks, or TODOs.
* Feature-first with clean architecture; designed for easy extension; no "god files".
* Type-first, strict end-to-end correctness (**DB → API → UI**).
* Serverless-first and server-first; edge-compatible where feasible without sacrificing correctness, security, or observability.
* Mobile-first responsive design; desktop-second.
* Precise naming; remove dead/unused code.
* Upgrade all packages to latest stable; avoid deprecated patterns.

## Key Areas to Explore

* What areas of the codebase have the most technical debt?
* Where are types weak or using `any` inappropriately?
* What test coverage gaps exist for critical paths?
* What code patterns are inconsistent across the codebase?
* What dependencies are outdated or have known vulnerabilities?
* Where do "god files" or overly complex modules exist?
* What naming inconsistencies make the code harder to understand?
