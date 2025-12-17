---
name: review-admin
description: Review admin - RBAC, bootstrap, config management, feature flags
agent: coder
---

# Admin Platform Review

## Mandate

* Perform a **deep, thorough review** of the admin platform in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* Deliverables must be stated as **findings, gaps, and actionable recommendations**.
* **Single-pass delivery**: no deferrals; deliver a complete assessment.
* **Explore beyond the spec**: identify operational improvements and safety enhancements.

## Tech Stack

* **Framework**: Next.js
* **API**: tRPC
* **Database**: Neon (Postgres)

## Review Scope

### Admin Platform (Operational-Grade)

* Baseline: RBAC (least privilege), audit logs, feature flags governance, optional impersonation with safeguards and auditing.

### Admin Bootstrap (Critical)

* Admin bootstrap must not rely on file seeding:
  * Use a secure, auditable **first-login allowlist** for the initial SUPER_ADMIN.
  * Permanently disable bootstrap after completion.
  * All privilege grants must be server-enforced and recorded in the audit log.
  * The allowlist must be managed via secure configuration (environment/secret store), not code or DB seeding.

### Configuration Management (Mandatory)

* All **non-secret** product-level configuration must be manageable via admin (server-enforced), with validation and change history.
* Secrets/credentials are environment-managed only; admin may expose safe readiness/health visibility, not raw secrets.

### Admin Analytics and Reporting (Mandatory)

* Provide comprehensive dashboards/reports for business, growth, billing, referral, support, and security/abuse signals, governed by RBAC.

### Admin Operational Management (Mandatory)

* Tools for user/account management, entitlements/access management, lifecycle actions, and issue resolution workflows.
* Actions affecting access, money/credits, or security posture require appropriate step-up controls and must be fully auditable.

## Key Areas to Explore

* How secure is the admin bootstrap process?
* What RBAC gaps exist that could lead to privilege escalation?
* How comprehensive is the audit logging for sensitive operations?
* What admin workflows are missing or painful?
* How does impersonation work and what safeguards exist?
* What visibility do admins have into system health and issues?
