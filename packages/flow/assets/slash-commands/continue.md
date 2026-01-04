---
name: continue
description: Trigger autonomous product iteration - think, improve, ship
---

# Continue

Continuously commit.

The entire system — not limited to data — must strictly obey a Single Source of Truth (SSOT) principle.
Every state, behavior, flow, permission, architecture decision, UI behavior, and side effect
must have exactly one authoritative source, one interpretation, and one correct path.

The system must be fully reason-able end to end.
There must be no implicit behavior, hidden assumptions, magic defaults, or silent fallbacks.

Continuously and repeatedly review, validate, and correct the entire system:
- Membership and identity correctness and completeness
- Consistency across state, permissions, flows, and lifecycle
- Architectural boundaries, modularity, and separation of responsibilities
- UI behavior matching system intent, state, and permissions
- Alignment with modern industry standards and best practices

No workarounds.
No hacks.
No temporary solutions.
No backward compatibility.
No deprecated logic.
No TODOs.
No dead code.
No unused code.
No incorrect or misleading code.

Every feature must be built intent-first:
- The correct model must exist before implementation
- No duplicated concepts, parallel truths, or shadow logic
- Any feature must be removable or refactorable without destabilizing the system

Continuously perform:
- Deduplication
- Refactoring
- Polishing
- Modularity enforcement
- Responsibility separation
- Architectural correction

The system must remain:
- Stateless
- Serverless-friendly
- Scalable
- Reasonable
- Testable
- Observable

All technologies must be used correctly, consistently, and idiomatically:
tRPC, Next.js, Radix UI, next-intl, Drizzle,
Better Auth, Stripe, Upstash, Neon, Vercel,
Resend (email), Vercel Blob (storage),
AI SDK with OpenRouter provider,
Iconify, Bun, Biome, Bun test,
Responsive Web Design.

Any identity or permission bootstrap (e.g. super admin):
- Must be defined via environment configuration
- Must execute exactly once in the system's lifetime
- Must be non-reentrant
- Must not be bypassable
- Must not become a permanent logic dependency

All sensitive operations require explicit re-authentication:
        Sensitive action triggered
                    ↓
            Check verified session
                    ↓
        Does the user have a password?
            ├─ Yes → Verify password
            └─ No  → Send email OTP (6 digits, 10-minute expiry)
                    ↓
            Verification succeeds
                    ↓
            Mark session as verified
                    ↓
        Allow scoped, time-bound sensitive actions
        (2FA setup, email change, account deletion, etc.)

The verified state must:
- Have explicit scope
- Have explicit expiration
- Never be implicitly reused
- Never be shared across sessions or contexts

Any ambiguity, inconsistency, incompleteness, or undefined behavior
must be treated as a bug, not a feature.

The system must withstand repeated review, rejection, refactor, and redesign,
and after every correction,
become simpler, more consistent, and closer to the correct model.

Ultrathink.
