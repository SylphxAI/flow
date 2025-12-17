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

## Review Scope

### Vercel Blob Upload Governance (Hard Requirement)

* All uploads must be **intent-based and server-verified**.
* The client must upload to Vercel Blob first using short-lived, server-issued authorization (e.g., signed upload URL / token), then call a server finalize endpoint to persist the resulting Blob URL/key.
* The server must validate the Blob URL/key ownership and namespace, and must match it against the originating upload intent (who/what/where/expiry/constraints) before attaching it to any resource.
* The system must support safe retries and idempotent finalize; expired/abandoned intents must be cleanable and auditable.

### Storage Best Practices

* No direct client-to-storage writes without server authorization
* Upload size limits enforced server-side
* File type validation (not just extension, actual content)
* Malware scanning if applicable
* Cleanup of orphaned/abandoned uploads
* CDN caching strategy defined

## Verification Checklist

- [ ] Intent-based upload flow implemented
- [ ] Server-issued short-lived authorization
- [ ] Server validates blob ownership before attach
- [ ] Idempotent finalize endpoint
- [ ] Abandoned uploads cleanable
- [ ] File type/size validation server-side
