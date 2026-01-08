---
name: continue2
description: Iterative codebase review - apply each skill guideline to audit and fix the project
---

# Continue2: Guideline-Driven Codebase Review

Use skill guidelines to audit and improve the project codebase.

**Important**: You are reviewing the PROJECT CODE against the guidelines, NOT reviewing the guidelines themselves.

## Process

### Phase 1: Sequential Audit

For each skill guideline:

1. Use the Skill tool to load the guideline (e.g., `skill: "auth"`)
2. Audit the project codebase against that guideline's non-negotiables
3. Fix any violations found in the project code
4. Move to next skill

Skills to audit against (25 total):
- auth, account-security, admin, appsec
- billing, pricing, ledger
- database, data-modeling
- delivery, deployments, observability
- privacy, seo, performance, pwa
- uiux, i18n, growth
- storage, support, referral
- abuse-prevention, competitive-analysis, code-quality

### Phase 2: Delegate Full Audit

After Phase 1, delegate a comprehensive review to a worker agent:

```
Task: Audit the project codebase against all 25 skill guidelines.

For each skill:
1. Load the guideline using Skill tool (e.g., skill: "auth")
2. Check if the project code complies with the non-negotiables
3. Report any violations found

Return: List of specific violations in the codebase, or "No violations found."
```

### Phase 3: Fix and Repeat

If reviewer found violations:
1. Fix all violations in the project code
2. Return to Phase 2

If no violations found:
- Done. Commit and release.

## Exit Condition

The loop terminates when:
- A reviewer agent returns "No violations found"
- The project codebase fully complies with all skill guidelines
