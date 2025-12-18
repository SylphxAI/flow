---
name: Code Standards
description: Technical standards for Coder and Reviewer agents
---

# CODE STANDARDS

## Structure

**Feature-first over layer-first**: Organize by functionality, not type.

<example>
✅ features/auth/{api, hooks, components, utils}
❌ {api, hooks, components, utils}/auth
</example>

**File size limits**: Component <250 lines, Module <300 lines. Larger → split.

---

## Programming Patterns

**Pragmatic Functional**:
- Business logic pure, local mutations acceptable
- Composition default, inheritance when natural (1 level max)
- Declarative when clearer, imperative when simpler

**Named args (3+ params)**: `update({ id, email, role })`

---

## Quality Principles

- **YAGNI**: Build what's needed now, not hypothetical futures
- **KISS**: Solution needs >3 sentences to explain → simplify
- **DRY**: Extract on 3rd duplication
- **Single Responsibility**: One reason to change per module
- **Dependency Inversion**: Depend on abstractions, not implementations

---

## Code Quality

**Naming**:
- Functions: verbs (getUserById, calculateTotal)
- Booleans: is/has/can (isActive, hasPermission)
- Classes: nouns (UserService, AuthManager)
- No abbreviations unless universal (req/res ok, usr/calc not ok)

**Type Safety**: Make illegal states unrepresentable. No `any` without justification. Handle null/undefined explicitly.

**Comments**: Explain WHY, not WHAT. TODOs forbidden (implement or delete).

**Testing**: Critical paths 100%. Business logic 80%+. Test names describe behavior.

---

## Security Standards

**Input Validation**: Validate at boundaries. Whitelist > blacklist. Use schema validation (Zod).

<example>
✅ const input = UserInputSchema.parse(req.body)
❌ const input = req.body // trusting user input
</example>

**Auth**: Required by default. Deny by default. Check permissions at every entry point.

**Data Protection**: Never log passwords, tokens, API keys, PII. Encrypt at rest. HTTPS only.

---

## Error Handling

**At Boundaries**: Catch and transform to Result types or domain errors.

**Logging**: Include context (userId, requestId). Actionable messages. Never mask failures.

<example>
✅ logger.error('Payment failed', { userId, orderId, error: err.message })
❌ logger.error('Error') // no context
</example>

**Retry**: Transient failures → exponential backoff. Permanent failures → fail fast.

---

## Performance Patterns

**Data Structure Selection**:
- Lookup by key → `Map` O(1)
- Membership check → `Set` O(1)
- Ordered iteration → `Array`

<example>
❌ array.find(x => x.id === id)  // O(n)
✅ map.get(id)                   // O(1)
</example>

**Query Optimization**: Avoid N+1. Use JOINs or batch queries.

**Algorithm Complexity**: O(n²) in hot paths → reconsider. Nested loops → use hash maps.

**When to Optimize**: Only with data. Profile first. Measure impact.

---

## Code Organization

**Extract function when**: 3rd duplication, >20 lines, >3 nesting levels.

**Extract module when**: >300 lines, multiple responsibilities.

**Simplicity Check**: Before every commit, ask "Can this be simpler?"
- Complexity must justify itself
- Abstraction before 2nd use case → premature

<example>
❌ Generic factory for single use case
✅ Direct instantiation, extract when 2nd case appears
</example>

---

## Code Smells

**Complexity**: Function >20 lines, >3 nesting, >5 parameters → refactor.

**Coupling**: Circular deps → redesign. Tight coupling to external APIs → add adapter.

**Data**: Mutable shared state → encapsulate. Magic numbers → named constants.

**Naming**: Generic names (data, info, utils) → be specific. Misleading → rename immediately.

---

## Data Handling

**Single Source of Truth**: Config → env + files. State → single store. Derived data → compute, don't duplicate.

**Data Flow**:
```
External → Validate → Transform → Domain Model → Storage
Storage → Domain Model → Transform → API Response
```

Never skip validation at boundaries.

---

## Git Workflow

**All commits are atomic.** One logical change per commit. Commit immediately after each unit of work.

**Never batch. Never wait.** Don't accumulate changes. Don't wait for user to say "commit".

**Commit triggers** — commit immediately when any of these complete:
- Feature added
- Bug fixed
- Refactor done
- Config changed
- Docs updated

**Format**: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

<example>
✅ Edit file → Commit → Edit next file → Commit
✅ feat(auth): add login endpoint
✅ fix(billing): handle webhook retry

❌ Edit 5 files → Commit all together
❌ Wait for user to say "commit"
❌ "WIP" commits
</example>
