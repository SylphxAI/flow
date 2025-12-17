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

## Discovery Approach

### Phase 1: Code Analysis
Scan for explicit incomplete markers:
- `TODO`, `FIXME`, `XXX`, `HACK`, `BUG`, `@todo`
- `NotImplementedError`, `throw new Error('not implemented')`
- Stub implementations (hardcoded returns, empty catches, `pass`)
- `test.skip`, `it.skip`, empty test files
- Commented-out code, debug statements

### Phase 2: Role-Based Simulation

**👤 User Perspective** — Walk through every user-facing flow:
- Onboarding: Can a new user complete setup without confusion?
- Happy path: Does the core feature work end-to-end?
- Error states: What happens when things go wrong? Are messages helpful?
- Edge cases: Empty states, first-time use, account limits, expired sessions
- Accessibility: Keyboard nav, screen readers, color contrast
- Mobile/responsive: Does it work on all devices?

**🔧 Developer Perspective** — Evaluate DX and maintainability:
- Setup: Can someone clone and run in < 5 minutes?
- Documentation: Are APIs documented? Examples provided?
- Error messages: Do stack traces help identify root cause?
- Debugging: Are there logs at appropriate levels?
- Testing: Can tests run locally? Are mocks available?
- Dependencies: Any outdated, deprecated, or vulnerable packages?

**🛡️ Admin/Ops Perspective** — Consider operational readiness:
- Monitoring: Can you tell if the system is healthy?
- Logging: Is there enough info to debug production issues?
- Configuration: Can settings be changed without code deploy?
- Backup/Recovery: Can data be restored if something fails?
- Security: Are admin actions audited? Permissions enforced?
- Scaling: What happens under 10x load?

### Phase 3: Scenario Simulation

Run through these scenarios mentally or via code paths:

| Scenario | Questions to Answer |
|----------|---------------------|
| New user signup | Every step works? Validation clear? Email sent? |
| Returning user login | Session handling? Password reset works? |
| Core action fails | Error shown? User knows what to do? Data preserved? |
| Network offline | Graceful degradation? Retry logic? |
| Concurrent users | Race conditions? Locks? Optimistic updates? |
| Bad actor attempts | Input sanitized? Rate limited? Logged? |
| Admin intervention | Can support help user? Audit trail exists? |

## Execution Process

1. **Parallel Discovery** (delegate to workers):
   - Worker 1: Code markers & stubs (grep TODO, FIXME, placeholders)
   - Worker 2: User journey simulation (trace main flows, find dead ends)
   - Worker 3: Developer experience audit (setup, docs, error messages)
   - Worker 4: Ops readiness check (logging, monitoring, config)
   - Worker 5: Test coverage & edge cases (skipped tests, missing scenarios)

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

4. **Deep Dive with /review** (when needed):
   If issues cluster in a specific domain, invoke `/review <domain>` for thorough analysis:

   | Domain | When to Invoke |
   |--------|----------------|
   | `auth` | Auth flow issues, session bugs, SSO problems |
   | `security` | Validation gaps, injection risks, secrets exposure |
   | `billing` | Payment bugs, subscription issues, webhook failures |
   | `performance` | Slow pages, bundle bloat, unnecessary re-renders |
   | `database` | Schema issues, missing indexes, N+1 queries |
   | `observability` | Missing logs, no alerts, debugging blind spots |
   | `i18n` | Hardcoded strings, locale issues, RTL bugs |

   Full domain list: auth, account-security, privacy, billing, pricing, ledger, security, trust-safety, uiux, seo, pwa, performance, i18n, database, data-architecture, storage, observability, operability, delivery, growth, referral, support, admin, discovery, code-quality

5. **Loop: Re-invoke /continue**:
   After completing fixes, **invoke `/continue` again** to:
   - Verify fixes didn't introduce new issues
   - Discover issues that were hidden by previous bugs
   - Continue until no Critical/High items remain

   **Exit condition**: No Critical or High severity items found.

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
→ Deep dive: invoking /review [domain]
↻ Loop: re-invoking /continue
```

### Completion
```
## Continue Complete

✓ X issues fixed
⚠ X issues need manual intervention
→ Invoked /review for: [domains]

Next: [/continue again | no further action needed]
```

## Driving Questions

1. **User**: What flows break or confuse real users? Where do they get stuck?
2. **Developer**: What would frustrate someone onboarding to this codebase?
3. **Admin/Ops**: What would make a 3am incident harder to debug?
4. **Security**: What incomplete validation could be exploited?
5. **Quality**: What "temporary" solutions became permanent debt?
6. **Scale**: What works now but will break at 10x growth?
