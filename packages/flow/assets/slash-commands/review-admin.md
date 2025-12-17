---
name: review-admin
description: Review admin - RBAC, bootstrap, audit, operational tools
agent: coder
---

# Admin Platform Review

## Mandate

* Perform a **deep, thorough review** of the admin platform in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify operational gaps and safety improvements.

## Tech Stack

* **Framework**: Next.js
* **API**: tRPC
* **Database**: Neon (Postgres)

## Non-Negotiables

* Admin bootstrap must use secure allowlist, not file seeding; must be permanently disabled after first admin
* All privilege grants must be audited (who/when/why)
* Actions affecting money/access/security require step-up controls
* Secrets must never be exposed through admin UI

## Context

The admin platform is where operational power lives — and where operational mistakes happen. A well-designed admin reduces the chance of human error while giving operators the tools they need to resolve issues quickly.

Consider: what does an operator need at 3am when something is broken? What would prevent an admin from accidentally destroying data? How do we know if someone is misusing admin access?

## Driving Questions

* What would an operator need during an incident that doesn't exist today?
* Where could an admin accidentally cause serious damage?
* How would we detect if admin access was compromised or misused?
* What repetitive admin tasks should be automated?
* Where is audit logging missing or insufficient?
* What would make the admin experience both safer and faster?
