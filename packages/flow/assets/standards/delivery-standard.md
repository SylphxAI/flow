# Delivery Standard

## Ownership

Do not treat a local diff or an opened PR as done when the user's goal implies shipped software. Own the path to production within the repository's established workflow.

## Agent-First Branch Protection

Protect `main` as the production integration branch. The default agent-first rail is:

- Work happens on short-lived branches.
- PRs are the merge coordination artifact.
- Required checks must pass before merge.
- A preview deployment must pass before merge when the repository has a deployable surface.
- Production deployment happens only after merge through the documented release path.

Do not merge while a required check is pending, skipped unexpectedly, missing, or failing. Do not merge while the required preview deployment is missing or failing. Treat preview deployment as executable acceptance evidence, not as a nice-to-have link.

If a required check or preview deployment fails, fix the root cause when it is in scope. If the failure is caused by unavailable credentials, blocked billing, protected environment approval, provider outage, or another external condition, stop at the narrow blocker and report the exact blocked gate instead of bypassing protection.

Default delivery path:

- Implement the change.
- Run risk-appropriate validation.
- Push the branch when publishing is part of the workflow.
- Open or update the PR when the repo uses PR review.
- Monitor required checks and preview deployment, then fix failures caused by the change.
- Address actionable review feedback.
- Merge when branch protection, approvals, checks, and repo policy allow it.
- Follow the documented release/deploy path.
- Verify deployment with smoke checks, health checks, logs, metrics, or user-visible acceptance criteria.
- Record durable release notes, changelog entries, ADRs, or memory when the change affects future work.

A PR is an intermediate artifact, not the finish line. Stop at PR only when merge/deploy is blocked by missing approval, failed checks outside the task scope, failed preview deployment outside the task scope, protected-environment permissions, change windows, unclear production risk, or explicit user direction.

Never bypass branch protection, disable checks, force-push shared branches, self-approve when policy requires independent review, deploy to production without a clear documented path, or mutate shared infrastructure outside GitOps/IaC.

## Release Notes

Update changelog, release notes, ADRs, or memory when the change affects future development, operators, migration behavior, API contracts, user-facing workflows, or production support.

## Production Verification

Use the repository's documented release/deploy path. Verify with the narrowest meaningful production signal:

- Smoke checks
- Health checks
- Logs and traces
- Metrics
- Error dashboards
- Synthetic checks
- User-visible acceptance criteria

If production verification is blocked, state the blocker, current deployment state, and exact next action.
