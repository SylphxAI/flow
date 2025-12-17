---
name: review-observability
description: Review observability - logging, tracing, alerting, debugging
agent: coder
---

# Observability Review

## Mandate

* Perform a **deep, thorough review** of observability in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify the production issues we can't debug today.

## Tech Stack

* **Error Tracking**: Sentry
* **Analytics**: PostHog
* **Platform**: Vercel

## Non-Negotiables

* Correlation IDs must exist end-to-end (request → job → webhook)
* Alerts must exist for critical failures (webhook failures, auth attacks, drift)

## Context

Observability is about answering questions when things go wrong. It's 3am, something is broken, users are complaining — can you figure out what happened? How fast?

Good observability makes debugging easy. Bad observability means you're guessing, adding log lines, redeploying, and hoping. Consider: what questions would you need to answer during an incident, and can you answer them today?

## Driving Questions

* If something breaks in production right now, how would we find out?
* What blind spots exist where errors go unnoticed?
* How long would it take to trace a user's request through the entire system?
* What alerts exist, and do they fire for the right things?
* Where do we have noise that's training people to ignore alerts?
* What production issue in the last month was hard to debug, and why?
