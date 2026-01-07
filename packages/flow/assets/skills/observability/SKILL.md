---
name: observability
description: Observability - logging, metrics, tracing. Use when adding monitoring.
---

# Observability Guideline

## Tech Stack

* **Error Tracking**: Sentry
* **Analytics**: PostHog
* **Platform**: Vercel

## Non-Negotiables

* Correlation IDs must exist end-to-end (request → job → webhook)
* Alerts must exist for critical failures
* Errors must be actionable, not noise

## Context

Observability is about answering questions when things go wrong. It's 3am, something is broken — can you figure out what happened? How fast?

PII protection in logs is enforced via `privacy`. This skill focuses on making debugging effective.

## Driving Questions

* If something breaks now, how would we find out?
* What blind spots exist where errors go unnoticed?
* How long to trace a request through the system?
* What alerts exist, and do they fire correctly?
* Where is noise training people to ignore alerts?
