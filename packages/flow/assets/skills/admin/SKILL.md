---
name: admin
description: Admin panel - RBAC, config, admin tools. Use when building admin UI.
---

# Admin Guideline

## Tech Stack

* **Framework**: Next.js
* **API**: tRPC
* **Database**: Neon (Postgres)
* **ORM**: Drizzle
* **Components**: Radix UI
* **Styling**: UnoCSS

## Bootstrap: Super Admin

Simplest possible approach:

```
INITIAL_SUPERADMIN_EMAIL=your@email.com
```

Flow:
1. Set env variable
2. Register with that email
3. Automatically elevated to super_admin
4. Done

Why singular:
- Only one initial super_admin needed
- They promote others via admin UI
- Simple = fewer bugs

The bootstrap must:
- Execute exactly once
- Be non-reentrant
- Not be bypassable
- Not become permanent logic dependency

## Non-Negotiables

* Admin bootstrap via INITIAL_SUPERADMIN_EMAIL only
* All privilege grants must be audited (who/when/why)
* Actions affecting money/access/security require step-up verification
* Secrets must never be exposed through admin UI
* MFA required for admin roles

## Role Hierarchy

```
super_admin
    ↓ (can promote to)
  admin
    ↓ (can manage)
  users
```

Only super_admin can:
- Promote users to admin
- Access system configuration
- View audit logs

## Context

The admin platform is where operational power lives — and where operational mistakes happen. A well-designed admin reduces human error while giving operators tools to resolve issues quickly.

## Driving Questions

* Is bootstrap using INITIAL_SUPERADMIN_EMAIL correctly?
* Can an admin accidentally cause serious damage?
* How would we detect admin access misuse?
* What repetitive admin tasks should be automated?
* Where is audit logging missing?
