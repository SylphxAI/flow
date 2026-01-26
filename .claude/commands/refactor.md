---
name: refactor
description: Deep refactoring - modularity, deduplication, cleanup
---

# Refactor: Deep Codebase Improvement

Systematically refactor the codebase for maximum quality.

## Targets

1. **Dead code** — remove all unused code, imports, variables, functions
2. **Duplication** — extract shared logic, eliminate copy-paste
3. **TODOs** — resolve or remove every TODO comment
4. **Modularity** — split large files, extract reusable modules
5. **Naming** — rename unclear variables, functions, files
6. **Types** — strengthen typing, remove `any`, add missing types
7. **Structure** — reorganize files into logical folders
8. **Dependencies** — remove unused deps, update outdated ones

## Process

### Phase 1: Scan

1. Find dead code: unused exports, unreachable code
2. Find duplication: similar code blocks, copy-paste patterns
3. Find TODOs: `grep -r "TODO" --include="*.ts" --include="*.tsx"`
4. Find large files: files > 300 lines
5. Find weak types: `any`, missing return types

### Phase 2: Refactor

For each issue found:
1. Plan the refactor
2. Make the change
3. Run tests to verify no regression
4. Commit atomically: `refactor: description`
5. Push immediately

### Phase 3: Verify

1. Run full test suite
2. Run type check
3. Run linter
4. Verify build succeeds

## Rules

* One logical change per commit
* Tests must pass after each refactor
* No behavior changes — refactor only
* If behavior change needed, separate commit

## Exit Condition

* Zero TODOs
* Zero dead code
* Zero duplication
* All tests pass
* All types strict
