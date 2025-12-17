---
name: review-trust-safety
description: Review trust & safety - abuse prevention, moderation, user protection
agent: coder
---

# Trust & Safety Review

## Mandate

* Perform a **deep, thorough review** of trust and safety in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Review then Act**: identify issues, then **implement fixes directly**. Don't just report — fix.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Explore beyond the spec**: identify abuse vectors before bad actors find them.

## Tech Stack

* **Analytics**: PostHog
* **Database**: Neon (Postgres)
* **Workflows**: Upstash Workflows + QStash

## Non-Negotiables

* All enforcement actions must be auditable (who/when/why)
* Appeals process must exist for affected users
* Graduated response levels must be defined (warn → restrict → suspend → ban)

## Context

Trust & safety is about protecting users — from each other and from malicious actors. Every platform eventually attracts abuse. The question is whether you're prepared for it or scrambling to react.

Consider: what would a bad actor try to do? How would we detect it? How would we respond? What about the false positives — innocent users caught by automated systems? A good T&S system is effective against abuse AND fair to legitimate users.

## Driving Questions

* What would a motivated bad actor try to do on this platform?
* How would we detect coordinated abuse or bot networks?
* What happens when automated moderation gets it wrong?
* How do affected users appeal decisions, and is it fair?
* What abuse patterns exist that we haven't addressed?
* What would make users trust that we're protecting them?
