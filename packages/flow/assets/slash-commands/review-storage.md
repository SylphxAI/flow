---
name: review-storage
description: Review storage - uploads, file handling, security
agent: coder
---

# Storage Review

## Mandate

* Perform a **deep, thorough review** of file storage and uploads in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify security risks and cost optimization opportunities.

## Tech Stack

* **Storage**: Vercel Blob
* **Platform**: Vercel

## Non-Negotiables

* Uploads must be intent-based and server-verified (no direct client uploads to permanent storage)
* Server must validate blob ownership before attaching to resources
* Abandoned uploads must be cleanable

## Context

File uploads are a common attack vector. Users upload things you don't expect. Files live longer than you plan. Storage costs accumulate quietly. A well-designed upload system is secure, efficient, and maintainable.

Consider: what could a malicious user upload? What happens to files when the referencing entity is deleted? How does storage cost scale with usage?

## Driving Questions

* What could a malicious user do through the upload flow?
* What happens to orphaned files when entities are deleted?
* How much are we spending on storage, and is it efficient?
* What file types do we accept, and should we?
* How do we handle upload failures gracefully?
* What content validation exists (type, size, safety)?
