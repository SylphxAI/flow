---
name: audit
description: Find all problems in the project - design, code, UX - and open issues
---

# Audit: Comprehensive Problem Discovery

Scan the entire project for issues. Find problems, don't fix them. Open GitHub issues for everything found.

**Rule: DO NOT fix anything. Only discover and document.**

## Scan Areas

### 1. Code Quality
- Dead code, unused imports, unused variables
- TODOs, FIXMEs, HACKs left in code
- `any` types, missing type safety
- Hardcoded values that should be config
- Console.logs, debug code in production
- Copy-paste duplication
- Functions > 50 lines, files > 300 lines
- Missing error handling
- Inconsistent naming conventions
- Outdated dependencies with known issues

### 2. Architecture
- Circular dependencies
- God objects/files doing too much
- Tight coupling between modules
- Missing abstractions
- Leaky abstractions
- Single points of failure
- Missing SSOT (multiple sources of truth)
- Inconsistent patterns across codebase

### 3. UI/UX Issues
- Confusing user flows
- Missing loading states
- Missing error states
- Missing empty states
- Inconsistent spacing/typography
- Non-responsive layouts
- Accessibility violations (contrast, keyboard nav)
- Missing feedback on user actions
- Unclear CTAs or labels
- Information overload

### 4. Product Design
- Unclear value proposition
- Friction in core user journey
- Missing onboarding guidance
- Features that don't serve business goals
- Confusing navigation structure
- Missing progressive disclosure
- Power user needs unmet
- Beginner barriers too high

### 5. Performance
- Slow page loads
- Unnecessary re-renders
- Large bundle sizes
- Missing lazy loading
- N+1 queries
- Missing caching opportunities
- Unoptimized images/assets

### 6. Security
- Exposed secrets or credentials
- Missing input validation
- XSS vulnerabilities
- CSRF vulnerabilities
- Insecure dependencies
- Missing rate limiting
- Overly permissive CORS

### 7. Developer Experience
- Missing or outdated documentation
- Unclear setup instructions
- Flaky or missing tests
- Slow CI/CD pipeline
- Missing type definitions
- Confusing folder structure

## Process

1. **Scan** each area systematically
2. **Document** every issue found with:
   - Clear description of the problem
   - Location (file, line, or area)
   - Impact (High/Medium/Low)
   - Category label
3. **DO NOT** attempt any fixes
4. **Open GitHub issues** for each problem found

## Issue Format

```bash
gh issue create --title "[Category] Brief description" --body "$(cat <<'EOF'
## Problem
What is wrong and where.

## Impact
Why this matters. What could go wrong.

## Evidence
Code snippets, screenshots, or specific locations.

## Suggested Category
- [ ] Bug
- [ ] Tech Debt
- [ ] UX Issue
- [ ] Performance
- [ ] Security
- [ ] Documentation
EOF
)" --label "audit"
```

## Output

After scanning, report:

### Summary
| Category | Issues Found | High | Medium | Low |
|----------|--------------|------|--------|-----|
| Code     | ...          | ...  | ...    | ... |
| UI/UX    | ...          | ...  | ...    | ... |
| ...      | ...          | ...  | ...    | ... |

### Issues Created
- #123 [Code] Description...
- #124 [UX] Description...
- ...

### Critical Issues (need immediate attention)
- ...

## Mindset

* Be thorough, not selective
* No issue is too small to document
* Assume nothing is perfect
* Fresh eyes find more problems
* The goal is awareness, not judgment
* Better to over-report than miss something
