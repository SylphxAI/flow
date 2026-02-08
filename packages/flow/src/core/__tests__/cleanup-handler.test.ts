/**
 * Tests for CleanupHandler
 * Covers: cleanup flow, crash recovery, orphaned project detection,
 * periodic cleanup gating, finalize-after-restore ordering,
 * and legacy migration
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CleanupHandler } from '../cleanup-handler.js';

// --- Mock factories ---

function createMockProjectManager(flowHome: string) {
  return {
    getFlowHomeDir: () => flowHome,
    getProjectPaths: (hash: string) => ({
      sessionDir: path.join(flowHome, 'sessions', hash),
      backupRefFile: path.join(flowHome, 'sessions', hash, 'backup.json'),
      pidsDir: path.join(flowHome, 'sessions', hash, 'pids'),
      backupsDir: path.join(flowHome, 'backups', hash),
      secretsDir: path.join(flowHome, 'secrets', hash),
      latestBackup: path.join(flowHome, 'backups', hash, 'latest'),
    }),
    getActiveProjects: vi.fn().mockResolvedValue([]),
  };
}

function createMockSessionManager() {
  return {
    detectOrphanedSessions: vi.fn().mockResolvedValue(new Map()),
    releaseSession: vi.fn().mockResolvedValue({ shouldRestore: false, backupRef: null }),
    finalizeSessionCleanup: vi.fn().mockResolvedValue(undefined),
    isSessionActive: vi.fn().mockResolvedValue(false),
    cleanupSessionHistory: vi.fn().mockResolvedValue(undefined),
    getBackupRef: vi.fn().mockResolvedValue(null),
    acquireSession: vi.fn().mockResolvedValue({ isFirstSession: false, backupRef: null }),
  };
}

function createMockBackupManager() {
  return {
    restoreBackup: vi.fn().mockResolvedValue(undefined),
    cleanupOldBackups: vi.fn().mockResolvedValue(undefined),
    cleanupOrphanedRestores: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockGitStashManager() {
  return {
    popSettingsChanges: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockSecretsManager() {
  return {
    clearSecrets: vi.fn().mockResolvedValue(undefined),
  };
}

describe('CleanupHandler', () => {
  let tempDir: string;
  let flowHome: string;
  let handler: CleanupHandler;
  let mockProjectManager: ReturnType<typeof createMockProjectManager>;
  let mockSessionManager: ReturnType<typeof createMockSessionManager>;
  let mockBackupManager: ReturnType<typeof createMockBackupManager>;
  let mockGitStash: ReturnType<typeof createMockGitStashManager>;
  let mockSecrets: ReturnType<typeof createMockSecretsManager>;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-cleanup-test-'));
    flowHome = path.join(tempDir, '.sylphx-flow');
    fs.mkdirSync(path.join(flowHome, 'sessions'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'backups'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'secrets'), { recursive: true });

    mockProjectManager = createMockProjectManager(flowHome);
    mockSessionManager = createMockSessionManager();
    mockBackupManager = createMockBackupManager();
    mockGitStash = createMockGitStashManager();
    mockSecrets = createMockSecretsManager();

    handler = new CleanupHandler(
      mockProjectManager as any,
      mockSessionManager as any,
      mockBackupManager as any,
      mockGitStash as any,
      mockSecrets as any
    );
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // --- cleanup() ---

  describe('cleanup()', () => {
    it('should restore backup and finalize when last session ends', async () => {
      const backupRef = {
        sessionId: 'session-1',
        projectPath: '/tmp/project',
        backupPath: '/tmp/backup',
        target: 'claude-code',
      };
      mockSessionManager.releaseSession.mockResolvedValue({ shouldRestore: true, backupRef });

      await handler.cleanup('abc123');

      expect(mockBackupManager.restoreBackup).toHaveBeenCalledWith('abc123', 'session-1');
      // CRITICAL: finalize called AFTER restore
      expect(mockSessionManager.finalizeSessionCleanup).toHaveBeenCalledWith('abc123');
      expect(mockBackupManager.cleanupOldBackups).toHaveBeenCalledWith('abc123', 3);
      expect(mockGitStash.popSettingsChanges).toHaveBeenCalledWith('/tmp/project');
      expect(mockSecrets.clearSecrets).toHaveBeenCalledWith('abc123');
    });

    it('should call finalize AFTER restore (ordering)', async () => {
      const callOrder: string[] = [];
      mockSessionManager.releaseSession.mockResolvedValue({
        shouldRestore: true,
        backupRef: {
          sessionId: 's1',
          projectPath: '/tmp/p',
          backupPath: '/tmp/b',
          target: 'claude-code',
        },
      });
      mockBackupManager.restoreBackup.mockImplementation(async () => {
        callOrder.push('restore');
      });
      mockSessionManager.finalizeSessionCleanup.mockImplementation(async () => {
        callOrder.push('finalize');
      });

      await handler.cleanup('abc123');

      expect(callOrder).toEqual(['restore', 'finalize']);
    });

    it('should NOT call finalize if restore fails', async () => {
      mockSessionManager.releaseSession.mockResolvedValue({
        shouldRestore: true,
        backupRef: {
          sessionId: 's1',
          projectPath: '/tmp/p',
          backupPath: '/tmp/b',
          target: 'claude-code',
        },
      });
      mockBackupManager.restoreBackup.mockRejectedValue(new Error('restore failed'));

      // cleanup() will throw since restoreBackup throws
      await expect(handler.cleanup('abc123')).rejects.toThrow('restore failed');

      // finalize should NOT have been called
      expect(mockSessionManager.finalizeSessionCleanup).not.toHaveBeenCalled();
    });

    it('should not restore when other sessions still active', async () => {
      mockSessionManager.releaseSession.mockResolvedValue({ shouldRestore: false, backupRef: null });

      await handler.cleanup('abc123');

      expect(mockBackupManager.restoreBackup).not.toHaveBeenCalled();
      expect(mockSessionManager.finalizeSessionCleanup).not.toHaveBeenCalled();
      expect(mockGitStash.popSettingsChanges).not.toHaveBeenCalled();
      expect(mockSecrets.clearSecrets).not.toHaveBeenCalled();
    });
  });

  // --- recoverOnStartup() ---

  describe('recoverOnStartup()', () => {
    it('should recover orphaned sessions with finalize after restore', async () => {
      const backupRef = {
        sessionId: 'session-crashed',
        projectPath: '/tmp/crashed-project',
        backupPath: '/tmp/backup',
        target: 'claude-code',
      };
      const orphaned = new Map([['hash1', backupRef]]);
      mockSessionManager.detectOrphanedSessions.mockResolvedValue(orphaned);

      await handler.recoverOnStartup();

      expect(mockBackupManager.restoreBackup).toHaveBeenCalledWith('hash1', 'session-crashed');
      expect(mockSessionManager.finalizeSessionCleanup).toHaveBeenCalledWith('hash1');
      expect(mockGitStash.popSettingsChanges).toHaveBeenCalledWith('/tmp/crashed-project');
      expect(mockSecrets.clearSecrets).toHaveBeenCalledWith('hash1');
      expect(mockBackupManager.cleanupOldBackups).toHaveBeenCalledWith('hash1', 3);
    });

    it('should handle multiple orphaned sessions independently', async () => {
      const ref1 = { sessionId: 's1', projectPath: '/p1', backupPath: '/b1', target: 'claude-code' };
      const ref2 = { sessionId: 's2', projectPath: '/p2', backupPath: '/b2', target: 'claude-code' };
      const orphaned = new Map([
        ['h1', ref1],
        ['h2', ref2],
      ]);
      mockSessionManager.detectOrphanedSessions.mockResolvedValue(orphaned);

      // Make first recovery fail
      mockBackupManager.restoreBackup
        .mockRejectedValueOnce(new Error('restore failed'))
        .mockResolvedValueOnce(undefined);

      await handler.recoverOnStartup();

      // Second session should still be recovered despite first failure
      expect(mockBackupManager.restoreBackup).toHaveBeenCalledTimes(2);
      expect(mockSessionManager.finalizeSessionCleanup).toHaveBeenCalledWith('h2');
      // First session's finalize should NOT have been called (restore failed)
      expect(mockSessionManager.finalizeSessionCleanup).not.toHaveBeenCalledWith('h1');
    });

    it('should skip heavy cleanup when marker is fresh', async () => {
      // Create fresh marker (< 24h old)
      const markerPath = path.join(flowHome, '.last-cleanup');
      fs.writeFileSync(markerPath, new Date().toISOString());

      await handler.recoverOnStartup();

      // Session history and orphaned project cleanup should NOT run
      expect(mockSessionManager.cleanupSessionHistory).not.toHaveBeenCalled();
    });

    it('should run heavy cleanup when marker is stale', async () => {
      // Create stale marker (> 24h old)
      const markerPath = path.join(flowHome, '.last-cleanup');
      fs.writeFileSync(markerPath, '2020-01-01T00:00:00.000Z');
      // Set mtime to past
      const pastTime = new Date('2020-01-01T00:00:00.000Z');
      fs.utimesSync(markerPath, pastTime, pastTime);

      await handler.recoverOnStartup();

      expect(mockSessionManager.cleanupSessionHistory).toHaveBeenCalledWith(50);
    });

    it('should run heavy cleanup when marker does not exist', async () => {
      // No marker file — first run
      await handler.recoverOnStartup();

      expect(mockSessionManager.cleanupSessionHistory).toHaveBeenCalledWith(50);
    });

    it('should update marker after heavy cleanup', async () => {
      await handler.recoverOnStartup();

      const markerPath = path.join(flowHome, '.last-cleanup');
      expect(fs.existsSync(markerPath)).toBe(true);
    });

    it('should do nothing when no orphaned sessions and cleanup not needed', async () => {
      // Fresh marker
      const markerPath = path.join(flowHome, '.last-cleanup');
      fs.writeFileSync(markerPath, new Date().toISOString());

      await handler.recoverOnStartup();

      expect(mockBackupManager.restoreBackup).not.toHaveBeenCalled();
      expect(mockSessionManager.cleanupSessionHistory).not.toHaveBeenCalled();
    });
  });

  // --- Legacy migration ---

  describe('migrateLegacySessions (via recoverOnStartup)', () => {
    it('should migrate legacy session files with cleanupRequired=true', async () => {
      // Create a legacy session file
      const legacySession = {
        projectHash: 'abc123',
        projectPath: '/tmp/project',
        sessionId: 'session-legacy',
        pid: 999999,
        startTime: '2026-01-01T00:00:00.000Z',
        backupPath: '/tmp/backups/session-legacy',
        status: 'active',
        target: 'claude-code',
        cleanupRequired: true,
        isOriginal: true,
        sharedBackupId: 'session-legacy',
        refCount: 1,
        activePids: [999999],
      };
      fs.writeFileSync(
        path.join(flowHome, 'sessions', 'abc123.json'),
        JSON.stringify(legacySession)
      );

      // Fresh cleanup marker to skip heavy cleanup
      fs.writeFileSync(path.join(flowHome, '.last-cleanup'), new Date().toISOString());

      await handler.recoverOnStartup();

      // Legacy file should be gone
      expect(fs.existsSync(path.join(flowHome, 'sessions', 'abc123.json'))).toBe(false);

      // New directory structure should exist with backup.json
      const paths = mockProjectManager.getProjectPaths('abc123');
      expect(fs.existsSync(paths.backupRefFile)).toBe(true);

      const backupRef = JSON.parse(fs.readFileSync(paths.backupRefFile, 'utf-8'));
      expect(backupRef.sessionId).toBe('session-legacy');
      expect(backupRef.projectPath).toBe('/tmp/project');
    });

    it('should migrate legacy session files with cleanupRequired=false (no backup.json)', async () => {
      const legacySession = {
        sessionId: 'session-done',
        backupPath: '/tmp/backup',
        projectPath: '/tmp/project',
        target: 'claude-code',
        cleanupRequired: false,
        pid: 999999,
        startTime: '2026-01-01T00:00:00.000Z',
      };
      fs.writeFileSync(
        path.join(flowHome, 'sessions', 'def456.json'),
        JSON.stringify(legacySession)
      );

      fs.writeFileSync(path.join(flowHome, '.last-cleanup'), new Date().toISOString());

      await handler.recoverOnStartup();

      // Legacy file should be gone
      expect(fs.existsSync(path.join(flowHome, 'sessions', 'def456.json'))).toBe(false);

      // No backup.json should be created (cleanupRequired was false)
      const paths = mockProjectManager.getProjectPaths('def456');
      expect(fs.existsSync(paths.backupRefFile)).toBe(false);
    });
  });

  // --- Orphaned project cleanup ---

  describe('cleanupOrphanedProjects (via recoverOnStartup)', () => {
    it('should clean up projects whose paths no longer exist', async () => {
      // Create orphaned project data (backups dir exists, but project path is gone)
      const orphanHash = 'deadbeef12345678';
      const backupDir = path.join(flowHome, 'backups', orphanHash, 'session-1000');
      fs.mkdirSync(backupDir, { recursive: true });

      // Write manifest pointing to non-existent path
      const manifest = {
        sessionId: 'session-1000',
        projectPath: '/nonexistent/project/path',
        target: 'claude-code',
      };
      fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest));

      // Create secrets
      const secretsDir = path.join(flowHome, 'secrets', orphanHash);
      fs.mkdirSync(secretsDir, { recursive: true });
      fs.writeFileSync(path.join(secretsDir, 'mcp-env.json'), '{}');

      await handler.recoverOnStartup();

      // Orphaned data should be cleaned up
      expect(fs.existsSync(path.join(flowHome, 'backups', orphanHash))).toBe(false);
      expect(fs.existsSync(path.join(flowHome, 'secrets', orphanHash))).toBe(false);
    });

    it('should NOT clean up projects with active sessions', async () => {
      const activeHash = 'active12345678';
      const backupDir = path.join(flowHome, 'backups', activeHash, 'session-2000');
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(
        path.join(backupDir, 'manifest.json'),
        JSON.stringify({ projectPath: '/nonexistent', sessionId: 'session-2000' })
      );

      // Mock: this project has an active session
      mockSessionManager.isSessionActive.mockImplementation(async (hash: string) => {
        return hash === activeHash;
      });

      await handler.recoverOnStartup();

      // Should NOT be cleaned up (active session exists)
      expect(fs.existsSync(path.join(flowHome, 'backups', activeHash))).toBe(true);
    });

    it('should clean up backup dirs with no manifest', async () => {
      const orphanHash = 'nomanifest1234';
      const backupDir = path.join(flowHome, 'backups', orphanHash);
      fs.mkdirSync(backupDir, { recursive: true });
      // No session subdirectories, no manifest

      await handler.recoverOnStartup();

      expect(fs.existsSync(backupDir)).toBe(false);
    });

    it('should NOT clean up projects whose paths still exist', async () => {
      const validHash = 'validproject123';
      const backupDir = path.join(flowHome, 'backups', validHash, 'session-3000');
      fs.mkdirSync(backupDir, { recursive: true });

      // Point manifest to a path that exists (the temp dir itself)
      fs.writeFileSync(
        path.join(backupDir, 'manifest.json'),
        JSON.stringify({ projectPath: tempDir, sessionId: 'session-3000' })
      );

      await handler.recoverOnStartup();

      // Should NOT be cleaned up (project path exists)
      expect(fs.existsSync(path.join(flowHome, 'backups', validHash))).toBe(true);
    });
  });
});
