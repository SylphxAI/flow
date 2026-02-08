/**
 * Tests for SessionManager — PID-based session management
 * Covers: acquireSession, releaseSession, detectOrphanedSessions,
 * finalizeSessionCleanup, cleanupSessionHistory
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectManager } from '../project-manager.js';
import { SessionManager } from '../session-manager.js';

describe('SessionManager', () => {
  let tempDir: string;
  let flowHome: string;
  let projectManager: ProjectManager;
  let sessionManager: SessionManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-session-test-'));
    flowHome = path.join(tempDir, '.sylphx-flow');

    // Create required directories
    fs.mkdirSync(path.join(flowHome, 'sessions', 'history'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'backups'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'secrets'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'templates'), { recursive: true });

    projectManager = new ProjectManager();
    // Override flowHomeDir to use temp
    (projectManager as any).flowHomeDir = flowHome;

    sessionManager = new SessionManager(projectManager);
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // --- acquireSession ---

  describe('acquireSession()', () => {
    it('should detect first session via atomic mkdir', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);

      const result = await sessionManager.acquireSession(hash, projectPath, 'claude-code', {
        sessionId: 'session-1',
        backupPath: '/tmp/backup',
      });

      expect(result.isFirstSession).toBe(true);
      expect(result.backupRef).not.toBeNull();
      expect(result.backupRef?.sessionId).toBe('session-1');
      expect(result.backupRef?.createdByPid).toBe(process.pid);

      // Verify PID file was written
      const paths = projectManager.getProjectPaths(hash);
      const pidFile = path.join(paths.pidsDir, `${process.pid}.json`);
      expect(fs.existsSync(pidFile)).toBe(true);

      // Verify backup.json was written
      expect(fs.existsSync(paths.backupRefFile)).toBe(true);
    });

    it('should detect join when pids/ already exists', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);
      const paths = projectManager.getProjectPaths(hash);

      // Pre-create pids/ directory and backup.json (simulating first session)
      fs.mkdirSync(paths.pidsDir, { recursive: true });
      const backupRef = {
        sessionId: 'session-existing',
        backupPath: '/tmp/backup',
        projectPath,
        target: 'claude-code',
        createdAt: new Date().toISOString(),
        createdByPid: 99999,
      };
      fs.writeFileSync(paths.backupRefFile, JSON.stringify(backupRef));

      // Second process joins
      const result = await sessionManager.acquireSession(hash, projectPath, 'claude-code');

      expect(result.isFirstSession).toBe(false);
      expect(result.backupRef?.sessionId).toBe('session-existing');

      // Verify our PID file was written
      const pidFile = path.join(paths.pidsDir, `${process.pid}.json`);
      expect(fs.existsSync(pidFile)).toBe(true);
    });

    it('should handle race condition (mkdir EEXIST)', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);
      const paths = projectManager.getProjectPaths(hash);

      // Pre-create the session dir but NOT pids/
      fs.mkdirSync(paths.sessionDir, { recursive: true });

      // First call creates pids/
      const result1 = await sessionManager.acquireSession(hash, projectPath, 'claude-code', {
        sessionId: 'session-race',
        backupPath: '/tmp/backup',
      });
      expect(result1.isFirstSession).toBe(true);

      // Second call should get EEXIST and join
      const result2 = await sessionManager.acquireSession(hash, projectPath, 'claude-code');
      expect(result2.isFirstSession).toBe(false);
    });
  });

  // --- releaseSession ---

  describe('releaseSession()', () => {
    it('should return shouldRestore=true when last PID', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);

      // Acquire session
      await sessionManager.acquireSession(hash, projectPath, 'claude-code', {
        sessionId: 'session-1',
        backupPath: '/tmp/backup',
      });

      // Release — we're the only PID
      const result = await sessionManager.releaseSession(hash);

      expect(result.shouldRestore).toBe(true);
      expect(result.backupRef?.sessionId).toBe('session-1');
    });

    it('should return shouldRestore=false when other alive PIDs exist', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);
      const paths = projectManager.getProjectPaths(hash);

      // Acquire session
      await sessionManager.acquireSession(hash, projectPath, 'claude-code', {
        sessionId: 'session-1',
        backupPath: '/tmp/backup',
      });

      // Simulate another alive process (PID 1 is always alive on Unix)
      fs.writeFileSync(
        path.join(paths.pidsDir, '1.json'),
        JSON.stringify({ pid: 1, startTime: new Date().toISOString() })
      );

      // Release — PID 1 is still alive
      const result = await sessionManager.releaseSession(hash);

      expect(result.shouldRestore).toBe(false);
    });

    it('should clean dead PID files during release', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });
      const hash = projectManager.getProjectHash(projectPath);
      const paths = projectManager.getProjectPaths(hash);

      // Acquire session
      await sessionManager.acquireSession(hash, projectPath, 'claude-code', {
        sessionId: 'session-1',
        backupPath: '/tmp/backup',
      });

      // Simulate a dead process (PID that doesn't exist)
      fs.writeFileSync(
        path.join(paths.pidsDir, '999999.json'),
        JSON.stringify({ pid: 999999, startTime: new Date().toISOString() })
      );

      // Release — should clean dead PID file
      const result = await sessionManager.releaseSession(hash);

      // Dead PID file should be cleaned
      expect(fs.existsSync(path.join(paths.pidsDir, '999999.json'))).toBe(false);
      // Only our PID was alive, and we removed it — shouldRestore
      expect(result.shouldRestore).toBe(true);
    });
  });

  // --- detectOrphanedSessions ---

  describe('detectOrphanedSessions()', () => {
    it('should detect orphaned sessions (backup.json + no alive PIDs)', async () => {
      const hash = 'orphanedproject1';
      const paths = projectManager.getProjectPaths(hash);

      // Create session dir with backup.json and dead PID
      fs.mkdirSync(paths.pidsDir, { recursive: true });
      const backupRef = {
        sessionId: 'session-orphan',
        backupPath: '/tmp/backup',
        projectPath: '/tmp/project',
        target: 'claude-code',
        createdAt: new Date().toISOString(),
        createdByPid: 999999,
      };
      fs.writeFileSync(paths.backupRefFile, JSON.stringify(backupRef));
      fs.writeFileSync(
        path.join(paths.pidsDir, '999999.json'),
        JSON.stringify({ pid: 999999 })
      );

      const orphaned = await sessionManager.detectOrphanedSessions();

      expect(orphaned.size).toBe(1);
      expect(orphaned.has(hash)).toBe(true);
      expect(orphaned.get(hash)?.sessionId).toBe('session-orphan');
    });

    it('should NOT detect sessions with alive PIDs as orphaned', async () => {
      const hash = 'activeproject1';
      const paths = projectManager.getProjectPaths(hash);

      // Create session dir with backup.json and alive PID (PID 1)
      fs.mkdirSync(paths.pidsDir, { recursive: true });
      fs.writeFileSync(
        paths.backupRefFile,
        JSON.stringify({
          sessionId: 'session-active',
          backupPath: '/tmp/backup',
          projectPath: '/tmp/project',
          target: 'claude-code',
          createdAt: new Date().toISOString(),
          createdByPid: 1,
        })
      );
      fs.writeFileSync(
        path.join(paths.pidsDir, '1.json'),
        JSON.stringify({ pid: 1 })
      );

      const orphaned = await sessionManager.detectOrphanedSessions();

      expect(orphaned.size).toBe(0);
    });

    it('should clean stale session dirs without backup.json', async () => {
      const hash = 'staleproject1';
      const paths = projectManager.getProjectPaths(hash);

      // Create session dir without backup.json
      fs.mkdirSync(paths.pidsDir, { recursive: true });

      const orphaned = await sessionManager.detectOrphanedSessions();

      expect(orphaned.size).toBe(0);
      // Stale directory should be cleaned up
      expect(fs.existsSync(paths.sessionDir)).toBe(false);
    });
  });

  // --- finalizeSessionCleanup ---

  describe('finalizeSessionCleanup()', () => {
    it('should remove session directory and archive to history', async () => {
      const hash = 'finalize1';
      const paths = projectManager.getProjectPaths(hash);

      // Create session with backup.json
      fs.mkdirSync(paths.pidsDir, { recursive: true });
      fs.writeFileSync(
        paths.backupRefFile,
        JSON.stringify({
          sessionId: 'session-finalize',
          backupPath: '/tmp/backup',
          projectPath: '/tmp/project',
          target: 'claude-code',
          createdAt: new Date().toISOString(),
          createdByPid: process.pid,
        })
      );

      await sessionManager.finalizeSessionCleanup(hash);

      // Session dir should be gone
      expect(fs.existsSync(paths.sessionDir)).toBe(false);

      // History file should exist
      const historyPath = path.join(flowHome, 'sessions', 'history', 'session-finalize.json');
      expect(fs.existsSync(historyPath)).toBe(true);
      const archived = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      expect(archived.status).toBe('completed');
      expect(archived.sessionId).toBe('session-finalize');
    });
  });

  // --- getBackupRef ---

  describe('getBackupRef()', () => {
    it('should return null for non-existent session', async () => {
      const ref = await sessionManager.getBackupRef('nonexistent');
      expect(ref).toBeNull();
    });

    it('should return backup ref when exists', async () => {
      const hash = 'reftest1';
      const paths = projectManager.getProjectPaths(hash);

      fs.mkdirSync(paths.sessionDir, { recursive: true });
      fs.writeFileSync(
        paths.backupRefFile,
        JSON.stringify({
          sessionId: 'session-ref',
          backupPath: '/tmp/backup',
          projectPath: '/tmp/project',
          target: 'claude-code',
          createdAt: new Date().toISOString(),
          createdByPid: 1234,
        })
      );

      const ref = await sessionManager.getBackupRef(hash);
      expect(ref?.sessionId).toBe('session-ref');
    });
  });

  // --- isSessionActive ---

  describe('isSessionActive()', () => {
    it('should return false when no backup.json', async () => {
      const active = await sessionManager.isSessionActive('nonexistent');
      expect(active).toBe(false);
    });

    it('should return true when backup.json exists and alive PIDs', async () => {
      const hash = 'active1';
      const paths = projectManager.getProjectPaths(hash);

      fs.mkdirSync(paths.pidsDir, { recursive: true });
      fs.writeFileSync(paths.backupRefFile, JSON.stringify({ sessionId: 'test' }));
      // PID 1 is always alive
      fs.writeFileSync(path.join(paths.pidsDir, '1.json'), JSON.stringify({ pid: 1 }));

      const active = await sessionManager.isSessionActive(hash);
      expect(active).toBe(true);
    });

    it('should return false when backup.json exists but no alive PIDs', async () => {
      const hash = 'dead1';
      const paths = projectManager.getProjectPaths(hash);

      fs.mkdirSync(paths.pidsDir, { recursive: true });
      fs.writeFileSync(paths.backupRefFile, JSON.stringify({ sessionId: 'test' }));
      // Dead PID
      fs.writeFileSync(path.join(paths.pidsDir, '999999.json'), JSON.stringify({ pid: 999999 }));

      const active = await sessionManager.isSessionActive(hash);
      expect(active).toBe(false);
    });
  });

  // --- cleanupSessionHistory (unchanged) ---

  describe('cleanupSessionHistory()', () => {
    it('should keep only last N session history files', async () => {
      const historyDir = path.join(flowHome, 'sessions', 'history');

      // Create 10 history files with incrementing timestamps
      for (let i = 1; i <= 10; i++) {
        const filename = `session-${1000 + i}.json`;
        fs.writeFileSync(path.join(historyDir, filename), JSON.stringify({ sessionId: `session-${1000 + i}` }));
      }

      // Keep last 3
      await sessionManager.cleanupSessionHistory(3);

      const remaining = fs.readdirSync(historyDir).filter((f) => f.endsWith('.json'));
      expect(remaining.length).toBe(3);

      // Most recent files should remain
      expect(remaining).toContain('session-1010.json');
      expect(remaining).toContain('session-1009.json');
      expect(remaining).toContain('session-1008.json');

      // Older files should be deleted
      expect(remaining).not.toContain('session-1001.json');
    });

    it('should do nothing when fewer files than limit', async () => {
      const historyDir = path.join(flowHome, 'sessions', 'history');

      // Create 2 files
      fs.writeFileSync(path.join(historyDir, 'session-100.json'), '{}');
      fs.writeFileSync(path.join(historyDir, 'session-200.json'), '{}');

      // Keep last 50
      await sessionManager.cleanupSessionHistory(50);

      const remaining = fs.readdirSync(historyDir).filter((f) => f.endsWith('.json'));
      expect(remaining.length).toBe(2);
    });

    it('should handle empty history directory', async () => {
      // No files in history
      await sessionManager.cleanupSessionHistory(50); // should not throw
    });

    it('should handle missing history directory', async () => {
      // Remove history dir
      fs.rmSync(path.join(flowHome, 'sessions', 'history'), { recursive: true });

      await sessionManager.cleanupSessionHistory(50); // should not throw
    });

    it('should ignore non-JSON files', async () => {
      const historyDir = path.join(flowHome, 'sessions', 'history');

      // Create mix of files
      fs.writeFileSync(path.join(historyDir, 'session-1.json'), '{}');
      fs.writeFileSync(path.join(historyDir, 'session-2.json'), '{}');
      fs.writeFileSync(path.join(historyDir, '.gitkeep'), '');
      fs.writeFileSync(path.join(historyDir, 'notes.txt'), 'some notes');

      await sessionManager.cleanupSessionHistory(1);

      // Only 1 JSON file should remain, non-JSON untouched
      const remaining = fs.readdirSync(historyDir);
      const jsonFiles = remaining.filter((f) => f.endsWith('.json'));
      expect(jsonFiles.length).toBe(1);
      expect(jsonFiles[0]).toBe('session-2.json');

      // Non-JSON files still exist
      expect(remaining).toContain('.gitkeep');
      expect(remaining).toContain('notes.txt');
    });
  });
});
