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

## Radix UI (Mandatory)

If Radix has a primitive for it, you MUST use it. No exceptions. No custom implementations.
Any custom implementation of something Radix already provides is a bug.

## Bootstrap

Admin bootstrap via INITIAL_SUPERADMIN_EMAIL only. One-time, non-reentrant, non-bypassable.

## Platform-Led Integrations

Platform is source of truth. Third-party services sync FROM platform, never reverse.
All configuration in code. No manual third-party dashboard configuration.
Platform can switch providers without architectural change.

## Re-authentication

Sensitive actions require step-up re-authentication (password or email OTP).
Verified session state must be scoped, time-bound, never implicitly reused.

## Technologies

tRPC, Next.js (with Turbopack), Radix UI, next-intl, Drizzle,
Better Auth, Stripe, Upstash, Neon, Vercel,
Resend (email), Vercel Blob (storage),
AI SDK with OpenRouter provider,
Tailwind CSS (styling), @iconify-icon/react (icons),
Bun, Biome, Bun test,
Responsive Web Design.

---

Any ambiguity, inconsistency, incompleteness, or undefined behavior
must be treated as a bug, not a feature.

The system must withstand repeated review, rejection, refactor, and redesign,
and after every correction,
become simpler, more consistent, and closer to the correct model.

Ultrathink.
