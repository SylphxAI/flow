---
release: minor
package: @sylphx/flow
---

Performance, stability, and test coverage overhaul

**Performance:**
- Replace blocking `execSync('which')` with async `exec()` + `Promise.all()`
- Batch git operations (N shell spawns → 1 per operation)
- Parallelize I/O across startup path (`Promise.all` for mkdir, unlink, fs.cp)
- Skip heavy cleanup scans on startup when not needed (24h marker)

**Bug fixes:**
- Fix signal handler conflict causing storage accumulation (root cause: `process.exit(0)` preempted async cleanup)
- Fix skip-worktree flag leak on crash (read from git index instead of in-memory state)
- Fix secrets never cleared on session end
- Fix constructor ordering bug (`gitStashManager` used before initialized)
- Centralize all cleanup into CleanupHandler (signal, manual, crash recovery paths)

**Storage lifecycle:**
- Add orphaned project detection and cleanup
- Add session history pruning (keep last 50)
- Add periodic cleanup gating (at most once per 24h)

**Tests:**
- 30 → 81 tests (170% increase)
- New test suites: cleanup-handler, git-stash-manager, session-cleanup, secrets-manager

**Cleanup:**
- Remove 432 lines of dead code across 26 files
