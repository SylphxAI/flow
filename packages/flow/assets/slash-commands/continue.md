---
name: continue
description: Continue incomplete work - finish features, fix bugs, complete TODOs
agent: coder
---

# Continue Incomplete Work

Scan codebase for incomplete work. Prioritize. Finish.

## Mandate

* Perform a **deep, thorough scan** of incomplete work in this codebase.
* **Delegate to multiple workers** to research different aspects in parallel; you act as the **final gate** to synthesize and verify quality.
* **Research then Act**: understand full scope first, then **implement fixes directly**. Don't just report — finish.
* **Single-pass delivery**: no deferrals; deliver complete implementation.
* **Be thorough**: incomplete work hides in comments, stubs, error messages, and "temporary" solutions.

## Incomplete Work Categories

### 1. Code Markers
- `TODO`, `FIXME`, `XXX`, `HACK`, `BUG`
- `@todo`, `@fixme` in doc comments
- `NotImplementedError`, `throw new Error('not implemented')`
- `console.log`, `console.warn` debug statements
- Commented-out code blocks

### 2. Stub Implementations
- Functions returning hardcoded values
- Empty catch blocks
- Methods with only `pass` or `return null`
- Placeholder return values (`return []`, `return {}`, `return 'TODO'`)

### 3. Missing Error Handling
- Unhandled promise rejections
- Missing try/catch around I/O operations
- Generic error messages ("Something went wrong")
- Missing input validation

### 4. Incomplete Features
- Dead code paths (unreachable conditions)
- Unused imports/exports
- Incomplete switch/case statements
- Missing else branches
- Partial implementations referenced but not called

### 5. Test Gaps
- `test.skip`, `it.skip`, `describe.skip`
- `@pytest.mark.skip`
- Empty test files
- Tests with only `expect(true).toBe(true)`
- Missing edge case tests

### 6. Documentation Debt
- Missing JSDoc/docstrings on public APIs
- Outdated README sections
- TODO comments in docs
- Missing CHANGELOG entries

## Execution Process

1. **Parallel Discovery** (delegate to workers):
   - Worker 1: Scan for code markers (TODO, FIXME, etc.)
   - Worker 2: Find stub implementations and placeholders
   - Worker 3: Identify missing error handling
   - Worker 4: Detect incomplete features and dead code
   - Worker 5: Find test gaps and skipped tests

2. **Synthesize & Prioritize**:
   - Collect all findings
   - Group by severity: Critical → High → Medium → Low
   - Critical: Security issues, data loss risks, broken features
   - High: User-facing bugs, incomplete core features
   - Medium: Code quality, missing tests
   - Low: Documentation, style issues

3. **Implement Fixes**:
   - Start with Critical items
   - Complete each fix fully before moving on
   - Run tests after each significant change
   - Commit atomically per logical fix

## Output Format

### Discovery Summary
```
## Incomplete Work Found

### Critical (X items)
- [ ] File:line - Description

### High (X items)
- [ ] File:line - Description

### Medium (X items)
- [ ] File:line - Description

### Low (X items)
- [ ] File:line - Description
```

### Progress Updates
```
✓ Fixed: [description] (file:line)
⚠ Blocked: [description] - needs [reason]
```

## Driving Questions

1. What are the highest-impact incomplete items blocking users?
2. Are there any security-related TODOs or incomplete validations?
3. What features are partially implemented but not functional?
4. Are there any "temporary" solutions that became permanent?
5. What tests are skipped and why?
