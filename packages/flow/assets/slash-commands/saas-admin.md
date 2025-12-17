---
name: saas-admin
description: SaaS admin platform review - RBAC, bootstrap, config, feature flags, ops
agent: coder
---

# Admin Platform Review

## Scope

Review admin systems: RBAC, bootstrap flow, configuration management, feature flags governance, operational tooling, and impersonation.

## Specification

### Access Control (RBAC)

* **Least privilege principle**: Users get minimum permissions needed.
* Role hierarchy with clear inheritance.
* Permission granularity (resource-level, action-level).
* All authorization is **server-enforced**; no client-trust.
* Role changes require appropriate privilege level and are audited.

### Admin Bootstrap (Hard Requirement)

* Admin bootstrap must **not rely on file seeding**.
* Use a secure, auditable **first-login allowlist** for the initial SUPER_ADMIN.
* **Permanently disable bootstrap** after completion — no re-entry.
* All privilege grants must be server-enforced and recorded in the audit log.
* The allowlist must be managed via **secure configuration (environment/secret store)**, not code or DB seeding.

### Configuration Management

* All **non-secret** product-level configuration must be manageable via admin (server-enforced).
* Configuration changes require **validation and change history**.
* Secrets/credentials are **environment-managed only**; admin may expose safe readiness/health visibility, not raw secrets.
* Support for environment-specific overrides (dev/staging/prod).
* Rollback capability for configuration changes.

### Feature Flags Governance

* Gradual rollout support (percentage-based, user segment-based).
* A/B testing integration where applicable.
* **Audit trail** for all flag changes (who/when/why).
* Emergency **kill switches** for rapid disable.
* Flag lifecycle management (created → active → deprecated → removed).
* Server-enforced evaluation; no client-side flag source-of-truth.

### Operational Management

* **User/account management tools**:
  * Search, view, edit user profiles
  * Account status management (active, suspended, banned)
  * Manual verification/unverification

* **Entitlements/access management**:
  * View and modify user entitlements
  * Grant/revoke access with audit trail
  * Bulk operations with safeguards

* **Lifecycle actions**:
  * Account suspension/reactivation
  * Data export (for user requests)
  * Account deletion with proper cascade

* **Issue resolution workflows**:
  * Support ticket integration
  * Action history per user
  * Notes and annotations

* **Step-up controls** for sensitive actions:
  * Actions affecting money/credits require MFA
  * Actions affecting security posture require MFA
  * Destructive actions require confirmation + reason

### Impersonation

* Impersonation allowed **with explicit safeguards**:
  * Requires elevated privilege level
  * Time-limited sessions (auto-expire)
  * Full audit logging (start, actions, end)
  * Clear indicator in UI during impersonation
  * Cannot impersonate higher-privilege users
* All actions during impersonation attributed to both impersonator and target.
* Optional: Visible indicator to impersonated user that session was accessed.

### Admin Audit Logging

* **All admin actions must be auditable**:
  * Who performed the action
  * When (timestamp with timezone)
  * What action was taken
  * Why (required reason for sensitive actions)
  * Before/after state for mutations
  * Correlation to session/request
* Audit logs must be:
  * Immutable (append-only)
  * Queryable and filterable
  * Exportable for compliance
  * Retained per data retention policy

## Domain Discovery

After reviewing compliance with spec, explore improvements:

* **Admin UX**: Is the admin panel efficient for common tasks? Keyboard shortcuts? Bulk actions?
* **Self-service vs admin**: What admin actions could be self-service for users?
* **Automation**: What repetitive admin tasks could be automated? Scheduled jobs?
* **Alerting**: Should certain admin actions trigger alerts? (e.g., mass deletions)
* **Delegation**: Can some admin tasks be delegated to lower roles safely?
* **Mobile admin**: Is there a need for mobile admin access? How to secure?

## Domain Gates

* [ ] RBAC implemented with least privilege
* [ ] Bootstrap flow is secure and one-time only
* [ ] Config changes are validated and audited
* [ ] Feature flags have full audit trail
* [ ] Sensitive actions require step-up (MFA)
* [ ] Impersonation is time-limited and fully logged
* [ ] All admin actions are auditable
* [ ] Audit logs are immutable and queryable
* [ ] No hardcoded admin credentials anywhere
* [ ] Admin endpoints are rate-limited
