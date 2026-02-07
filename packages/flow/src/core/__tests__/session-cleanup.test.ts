/**
 * Tests for SessionManager cleanup functionality
 * Covers: cleanupSessionHistory, multi-session lifecycle
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

  describe('Session lifecycle', () => {
    it('should create and end a session', async () => {
      const projectPath = path.join(tempDir, 'project');
      fs.mkdirSync(projectPath, { recursive: true });

      const hash = projectManager.getProjectHash(projectPath);

      const { session, isFirstSession } = await sessionManager.startSession(
        projectPath,
        hash,
        'claude-code',
        '/tmp/backup',
        'session-test-1'
      );

      expect(isFirstSession).toBe(true);
      expect(session.projectPath).toBe(projectPath);
      expect(session.sessionId).toBe('session-test-1');
      expect(session.refCount).toBe(1);

      // Verify active session exists
      const active = await sessionManager.getActiveSession(hash);
      expect(active).not.toBeNull();
      expect(active?.sessionId).toBe('session-test-1');
    });

    it('should return null for non-existent session', async () => {
      const active = await sessionManager.getActiveSession('nonexistent');
      expect(active).toBeNull();
    });
  });
});
