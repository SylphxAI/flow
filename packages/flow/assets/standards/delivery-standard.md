# Delivery Standard

## Ownership

Do not treat a local diff or an opened PR as done when the user's goal implies shipped software. Own the path to production within the repository's established workflow.

Default delivery path:

- Implement the change.
- Run risk-appropriate validation.
- Push the branch when publishing is part of the workflow.
- Open or update the PR when the repo uses PR review.
- Monitor CI and fix failures caused by the change.
- Address actionable review feedback.
- Merge when branch protection, approvals, checks, and repo policy allow it.
- Follow the documented release/deploy path.
- Verify deployment with smoke checks, health checks, logs, metrics, or user-visible acceptance criteria.
- Record durable release notes, changelog entries, ADRs, or memory when the change affects future work.

A PR is an intermediate artifact, not the finish line. Stop at PR only when merge/deploy is blocked by missing approval, failed checks outside the task scope, protected-environment permissions, change windows, unclear production risk, or explicit user direction.

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
