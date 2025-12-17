---
name: review-delivery
description: Review delivery - CI gates, automated verification, release safety
agent: coder
---

# Delivery Review

## Mandate

* Perform a **deep, thorough review** of delivery gates in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify what could go wrong in production that we're not catching.

## Tech Stack

* **CI**: GitHub Actions
* **Testing**: Bun test
* **Linting**: Biome
* **Platform**: Vercel

## Non-Negotiables

* All release gates must be automated (manual verification doesn't count)
* Build must fail-fast on missing required configuration
* CI must block on: lint, typecheck, tests, build
* `/en/*` must redirect (no duplicate content)
* Security headers (CSP, HSTS) must be verified by tests
* Consent gating must be verified by tests

## Context

Delivery gates are the last line of defense before code reaches users. Every manual verification step is a gate that will eventually fail. Every untested assumption is a bug waiting to ship.

The question isn't "what tests do we have?" but "what could go wrong that we wouldn't catch?" Think about the deploy that breaks production at 2am — what would have prevented it?

## Driving Questions

* What could ship to production that shouldn't?
* Where does manual verification substitute for automation?
* What flaky tests are training people to ignore failures?
* How fast is the feedback loop, and what slows it down?
* If a deploy breaks production, how fast can we detect and rollback?
* What's the worst thing that shipped recently that tests should have caught?
