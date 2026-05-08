---
name: delivery-owner
description: Use when the user asks to ship, publish, push, open a PR, merge, release, deploy, fix CI, address review feedback, or drive work end-to-end instead of stopping at a local diff or opened PR.
metadata:
  short-description: Drive work through review, CI, merge, release, and verification
---

# Delivery Owner

Use this skill when "done" means usable software, not merely a local diff.

## Workflow

1. Read `~/.codex/standards/delivery-standard.md`.
2. Inspect the repository's contribution, branch, release, deployment, and protection conventions.
3. Preserve unrelated user work and never bypass policy.
4. Implement or integrate the scoped change.
5. Run the narrowest risk-appropriate validation that is safe for the environment.
6. Commit, push, and open or update the PR when publishing is part of the repo workflow.
7. Monitor required checks and preview deployment, then fix failures caused by the change.
8. Address actionable review feedback.
9. Merge only when branch protection, approvals, required checks, preview deployment, and repo policy allow it.
10. Follow the documented release or deployment path.
11. Verify the deployed result with smoke checks, health checks, logs, metrics, or user-visible acceptance criteria.
12. Update changelog, release notes, ADRs, or memory when future operators need the fact.

## Stop Conditions

Stop and report the narrow blocker when progress requires:

- Credentials or environment access that is unavailable.
- Human approval, protected environment approval, payment, legal, or product direction.
- Destructive infrastructure, database, or VCS action.
- Failed checks outside the change scope.
- Failed or missing preview deployment outside the change scope.
- Unclear production risk or missing documented deployment path.

## Output

Report the final delivery state precisely: local only, branch pushed, PR open, merged, released, deployed, or production-verified. Include skipped validation and residual risk.
