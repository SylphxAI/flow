---
name: review-storage
description: Review storage - Vercel Blob upload governance, intent-based uploads
agent: coder
---

# Storage Review

## Mandate

* Perform a **deep, thorough review** of file storage and uploads in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify improvements for security, reliability, and cost efficiency.

## Tech Stack

* **Storage**: Vercel Blob
* **Platform**: Vercel

## Review Scope

### Vercel Blob Upload Governance (Hard Requirement)

* All uploads must be **intent-based and server-verified**.
* The client must upload to Vercel Blob first using short-lived, server-issued authorization (e.g., signed upload URL / token), then call a server finalize endpoint to persist the resulting Blob URL/key.
* The server must validate the Blob URL/key ownership and namespace, and must match it against the originating upload intent (who/what/where/expiry/constraints) before attaching it to any resource.
* The system must support safe retries and idempotent finalize; expired/abandoned intents must be cleanable and auditable.

## Key Areas to Explore

* How are uploads currently implemented and do they follow intent-based pattern?
* What security vulnerabilities exist in the upload flow?
* How are abandoned/orphaned uploads handled?
* What is the cost implication of current storage patterns?
* How does the system handle large files and upload failures?
* What content validation (type, size, malware) exists?
