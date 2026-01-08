---
name: continue2
description: Iterative guideline review - review each, delegate critique, repeat until perfect
---

# Continue2: Iterative Guideline Review

Review all skill guidelines until perfection.

## Process

### Phase 1: Sequential Review

Review each skill guideline one by one:

1. Use the Skill tool to load the skill (e.g., `skill: "auth"`)
2. Evaluate against criteria (below)
3. Fix any issues found
4. Move to next skill

Skills to review (25 total):
- auth, account-security, admin, appsec
- billing, pricing, ledger
- database, data-modeling
- delivery, deployments, observability
- privacy, seo, performance, pwa
- uiux, i18n, growth
- storage, support, referral
- abuse-prevention, competitive-analysis, code-quality

### Phase 2: Delegate to Reviewer

After completing Phase 1, delegate a full review to a worker agent:

```
Task: Review all 25 skill guidelines for issues.

Use the Skill tool to load each skill (e.g., skill: "auth", skill: "billing", etc.)

Check for:
- Overlapping responsibilities between skills
- Missing cross-references where skills relate
- Inconsistent formatting or structure
- Missing SSOT designations where needed
- Tutorial-style content (HOW) instead of requirements (WHAT)
- Vague or unverifiable non-negotiables

Return: List of specific issues found, or "No issues found."
```

### Phase 3: Fix and Repeat

If reviewer found issues:
1. Fix all reported issues
2. Return to Phase 2

If reviewer found no issues:
- Done. Commit and release.

## Evaluation Criteria

Each skill must have:

**Structure**:
- YAML frontmatter (name, description)
- Tech Stack section (if applicable)
- Non-Negotiables section
- Context section (with cross-references to related skills)
- Driving Questions section

**Content Quality**:
- Requirements state WHAT, not HOW
- Non-negotiables are verifiable (can be checked)
- Context clarifies boundaries with related skills
- No code examples or templates
- No tutorial-style explanations

**Consistency**:
- Tech stack entries follow pattern: `* **Component**: Technology`
- Next.js always includes `(with Turbopack)`
- Cross-references use backtick format: `lives in \`skill-name\``
- SSOT is designated where concepts overlap

## Exit Condition

The loop terminates when:
- A reviewer agent returns "No issues found"
- Or explicitly: no overlaps, no missing cross-refs, no formatting issues, no HOW content
