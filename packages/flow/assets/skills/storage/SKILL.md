---
name: storage
description: File storage - uploads, CDN, blobs. Use when handling files.
---

# Storage Guideline

## Tech Stack

* **Storage**: Vercel Blob
* **Platform**: Vercel
* **Framework**: Next.js

## Non-Negotiables

* Uploads must be intent-based and server-verified
* No direct client uploads to permanent storage
* Server must validate blob ownership before attaching to resources
* Abandoned uploads must be cleanable

## Upload Flow

```
Client requests upload URL
        ↓
Server creates signed upload token
        ↓
Client uploads to Vercel Blob
        ↓
Server validates and attaches to resource
        ↓
Orphaned blobs cleaned periodically
```

## Context

File uploads are a common attack vector. Users upload things you don't expect. Files live longer than you plan. Storage costs accumulate quietly.

Vercel Blob is the SSOT for file storage. No custom implementations.

## Driving Questions

* Is all storage through Vercel Blob?
* Are uploads validated server-side?
* What happens to orphaned files?
* What file types do we accept, and should we?
* How much are we spending on storage?
