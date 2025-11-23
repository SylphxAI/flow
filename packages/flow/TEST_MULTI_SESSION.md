# Multi-Session Support Test Plan

## Implementation Summary

Multi-session support has been implemented with reference counting to allow multiple simultaneous sessions in the same workspace without conflicts.

### Key Changes

**SessionManager (`src/core/session-manager.ts`)**:
- Added multi-session fields to `Session` interface:
  - `refCount`: Number of active sessions
  - `activePids[]`: All active process IDs sharing this session
  - `isOriginal`: First session flag
  - `sharedBackupId`: Shared backup identifier
- `startSession()` now returns `{ session, isFirstSession }`
  - Checks for existing session and increments refCount if joining
  - First session creates backup, subsequent sessions join
- `endSession()` now returns `{ shouldRestore, session }`
  - Decrements refCount and removes current PID
  - Only restores when refCount reaches 0 (last session)
- `detectOrphanedSessions()` checks all PIDs and updates refCount

**CleanupHandler (`src/core/cleanup-handler.ts`)**:
- Updated all cleanup methods to use new session API
- `onExit()`: Uses `shouldRestore` flag from endSession
- `onSignal()`: Shows remaining session count if not last session
- `cleanup()`: Conditionally restores based on shouldRestore

**FlowExecutor (`src/core/flow-executor.ts`)**:
- `execute()` checks for existing session first
- Joining session: Skips backup/attach, shows "Joining existing session"
- First session: Creates backup, attaches Flow environment
- Shows active session count when joining

## Test Scenarios

### Scenario 1: Single Session (Baseline)
```bash
# Terminal 1
cd /path/to/project
sylphx-flow "test task"
# Should: Create backup → Attach → Run → Restore
```

**Expected**:
- ✅ Backup created in `~/.sylphx-flow/backups/{hash}/session-{timestamp}/`
- ✅ Session file created with refCount=1, activePids=[pid1]
- ✅ Flow environment attached
- ✅ On exit: Environment restored, backup cleaned up

### Scenario 2: Two Simultaneous Sessions
```bash
# Terminal 1
cd /path/to/project
sylphx-flow "task 1"
# Wait for "Flow environment ready"

# Terminal 2 (while T1 still running)
cd /path/to/project
sylphx-flow "task 2"
```

**Expected Terminal 1**:
- ✅ Creates backup
- ✅ Session file: refCount=1, activePids=[pid1]
- ✅ Attaches Flow

**Expected Terminal 2**:
- ✅ Shows "🔗 Joining existing session..."
- ✅ Session file updated: refCount=2, activePids=[pid1, pid2]
- ✅ Skips backup creation
- ✅ Skips attach (already attached)
- ✅ Shows "Joined session (2 active session(s))"

**Exit Terminal 1** (while T2 still running):
- ✅ Session file updated: refCount=1, activePids=[pid2]
- ✅ Shows "1 session(s) still running"
- ✅ Does NOT restore backup

**Exit Terminal 2** (last session):
- ✅ Session file deleted
- ✅ Environment restored from backup
- ✅ Old backups cleaned up
- ✅ Shows "Environment restored"

### Scenario 3: Three Sessions
```bash
# Terminal 1
sylphx-flow "task 1"

# Terminal 2
sylphx-flow "task 2"

# Terminal 3
sylphx-flow "task 3"
```

**Expected**:
- T1: Creates backup, refCount=1
- T2: Joins, refCount=2
- T3: Joins, refCount=3
- Exit T2: refCount=2, no restore
- Exit T1: refCount=1, no restore
- Exit T3: refCount=0, restore backup

### Scenario 4: Crash Recovery
```bash
# Terminal 1
sylphx-flow "task 1"

# Terminal 2
sylphx-flow "task 2"

# Kill T1 (Ctrl+C or kill -9)
# Session file should update: activePids=[pid2], refCount=1

# Next Flow run
sylphx-flow "task 3"
# Should detect crashed PID, update session
```

**Expected**:
- ✅ `detectOrphanedSessions()` checks all PIDs
- ✅ Removes crashed PID from activePids
- ✅ Updates refCount
- ✅ If refCount=0: Restore backup, mark as crashed
- ✅ If refCount>0: Update session file, continue

### Scenario 5: All Sessions Crash
```bash
# Terminal 1 & 2
sylphx-flow "task 1" & sylphx-flow "task 2" &

# Kill all (e.g., kill -9 on both PIDs)

# Next Flow run
sylphx-flow "task 3"
```

**Expected**:
- ✅ Shows "🔧 Recovering 1 crashed session(s)..."
- ✅ Restores backup
- ✅ Archives session to history
- ✅ Proceeds with new session

## Manual Testing Steps

1. **Verify session file structure**:
```bash
cat ~/.sylphx-flow/sessions/{project-hash}.json
# Should show: refCount, activePids[], isOriginal, sharedBackupId
```

2. **Check active PIDs**:
```bash
ps aux | grep sylphx-flow
# Verify PIDs match activePids in session file
```

3. **Verify backup not duplicated**:
```bash
ls -la ~/.sylphx-flow/backups/{project-hash}/
# Should only have ONE backup directory for multiple sessions
```

4. **Check cleanup on exit**:
```bash
# After last session exits
ls ~/.sylphx-flow/sessions/
# Should be empty (or not contain project-hash.json)

ls ~/.sylphx-flow/sessions/history/
# Should contain completed session
```

## Expected Logs

### First Session
```
💾 Creating backup...
🔐 Extracting secrets...
   ✓ Saved 2 MCP secret(s)
📦 Loading Flow templates...
🚀 Attaching Flow environment...
   ✓ Added: 3 agents, 2 commands, 1 MCP server
✓ Flow environment ready!
```

### Joining Session
```
🔗 Joining existing session...
   ✓ Joined session (2 active session(s))
✓ Flow environment ready!
```

### Exiting Non-Last Session (Ctrl+C)
```
⚠️  Interrupted by user, cleaning up...
🧹 Cleaning up...
   2 session(s) still running
```

### Exiting Last Session (Ctrl+C)
```
⚠️  Interrupted by user, cleaning up...
🧹 Cleaning up...
   Restoring environment...
✓ Environment restored
```

## Known Edge Cases

1. **Rapid consecutive starts**: Two sessions start before first writes session file
   - Mitigation: File system atomicity should handle this
   - Test: Start two sessions within milliseconds

2. **PID reuse**: OS reuses PID of crashed session
   - Mitigation: Check process name/command, not just PID
   - TODO: Add process name verification in `checkPIDRunning()`

3. **Session file corruption**: JSON corrupted mid-write
   - Mitigation: Treat as orphaned session, restore backup
   - Test: Manually corrupt session file

4. **Multiple projects simultaneously**: Different projects should be isolated
   - Expected: Each project has separate session file by hash
   - Test: Run Flow in two different directories

## Success Criteria

- ✅ Multiple sessions can run in same workspace simultaneously
- ✅ Only first session creates backup
- ✅ Only last session restores backup
- ✅ Crash recovery works with partial session failures
- ✅ Session file accurately tracks all active PIDs
- ✅ No backup duplication
- ✅ Environment correctly restored only when safe
- ✅ Clear user feedback for joining/leaving sessions
- ✅ Type checking passes
- ✅ No runtime errors in multi-session scenarios
