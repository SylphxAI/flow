/**
 * Tests for CleanupHandler
 * Covers: signal cleanup, crash recovery, orphaned project detection,
 * periodic cleanup gating, and session history pruning coordination
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
      sessionFile: path.join(flowHome, 'sessions', `${hash}.json`),
      backupsDir: path.join(flowHome, 'backups', hash),
      secretsDir: path.join(flowHome, 'secrets', hash),
      latestBackup: path.join(flowHome, 'backups', hash, 'latest'),
    }),
  };
}

function createMockSessionManager() {
  return {
    detectOrphanedSessions: vi.fn().mockResolvedValue(new Map()),
    endSession: vi.fn().mockResolvedValue({ shouldRestore: false, session: null }),
    recoverSession: vi.fn().mockResolvedValue(undefined),
    getActiveSession: vi.fn().mockResolvedValue(null),
    cleanupSessionHistory: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockBackupManager() {
  return {
    restoreBackup: vi.fn().mockResolvedValue(undefined),
    cleanupOldBackups: vi.fn().mockResolvedValue(undefined),
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
    it('should restore backup and clean up when last session ends', async () => {
      const session = { sessionId: 'session-1', projectPath: '/tmp/project' };
      mockSessionManager.endSession.mockResolvedValue({ shouldRestore: true, session });

      await handler.cleanup('abc123');

      expect(mockBackupManager.restoreBackup).toHaveBeenCalledWith('abc123', 'session-1');
      expect(mockBackupManager.cleanupOldBackups).toHaveBeenCalledWith('abc123', 3);
      expect(mockGitStash.popSettingsChanges).toHaveBeenCalledWith('/tmp/project');
      expect(mockSecrets.clearSecrets).toHaveBeenCalledWith('abc123');
    });

    it('should not restore when other sessions still active', async () => {
      mockSessionManager.endSession.mockResolvedValue({ shouldRestore: false, session: null });

      await handler.cleanup('abc123');

      expect(mockBackupManager.restoreBackup).not.toHaveBeenCalled();
      expect(mockGitStash.popSettingsChanges).not.toHaveBeenCalled();
      expect(mockSecrets.clearSecrets).not.toHaveBeenCalled();
    });
  });

  // --- recoverOnStartup() ---

  describe('recoverOnStartup()', () => {
    it('should recover orphaned sessions', async () => {
      const session = {
        sessionId: 'session-crashed',
        projectPath: '/tmp/crashed-project',
        projectHash: 'hash1',
      };
      const orphaned = new Map([['hash1', session]]);
      mockSessionManager.detectOrphanedSessions.mockResolvedValue(orphaned);

      await handler.recoverOnStartup();

      expect(mockBackupManager.restoreBackup).toHaveBeenCalledWith('hash1', 'session-crashed');
      expect(mockSessionManager.recoverSession).toHaveBeenCalledWith('hash1', session);
      expect(mockGitStash.popSettingsChanges).toHaveBeenCalledWith('/tmp/crashed-project');
      expect(mockSecrets.clearSecrets).toHaveBeenCalledWith('hash1');
      expect(mockBackupManager.cleanupOldBackups).toHaveBeenCalledWith('hash1', 3);
    });

    it('should handle multiple orphaned sessions independently', async () => {
      const session1 = { sessionId: 's1', projectPath: '/p1' };
      const session2 = { sessionId: 's2', projectPath: '/p2' };
      const orphaned = new Map([
        ['h1', session1],
        ['h2', session2],
      ]);
      mockSessionManager.detectOrphanedSessions.mockResolvedValue(orphaned);

      // Make first recovery fail
      mockBackupManager.restoreBackup
        .mockRejectedValueOnce(new Error('restore failed'))
        .mockResolvedValueOnce(undefined);

      await handler.recoverOnStartup();

      // Second session should still be recovered despite first failure
      expect(mockBackupManager.restoreBackup).toHaveBeenCalledTimes(2);
      expect(mockSessionManager.recoverSession).toHaveBeenCalledWith('h2', session2);
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
      mockSessionManager.getActiveSession.mockImplementation(async (hash: string) => {
        if (hash === activeHash) {
          return { projectHash: activeHash };
        }
        return null;
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
