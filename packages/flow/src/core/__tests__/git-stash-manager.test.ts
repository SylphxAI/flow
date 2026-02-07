/**
 * Tests for GitStashManager
 * Covers: batched git operations, crash-safe skip-worktree detection
 */

import { exec } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GitStashManager } from '../git-stash-manager.js';

const execAsync = promisify(exec);

describe('GitStashManager', () => {
  let tempDir: string;
  let manager: GitStashManager;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-git-test-'));
    manager = new GitStashManager();

    // Initialize git repo
    await execAsync('git init', { cwd: tempDir });
    await execAsync('git config user.email "test@test.com"', { cwd: tempDir });
    await execAsync('git config user.name "Test"', { cwd: tempDir });
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('isGitRepo()', () => {
    it('should detect git repository', async () => {
      expect(await manager.isGitRepo(tempDir)).toBe(true);
    });

    it('should return false for non-git directory', async () => {
      const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-nongit-'));
      try {
        expect(await manager.isGitRepo(nonGitDir)).toBe(false);
      } finally {
        fs.rmSync(nonGitDir, { recursive: true, force: true });
      }
    });
  });

  describe('getTrackedSettingsFiles()', () => {
    it('should return tracked .claude files', async () => {
      // Create and track .claude files
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');

      await execAsync('git add .claude/settings.json', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      const files = await manager.getTrackedSettingsFiles(tempDir);
      expect(files).toContain('.claude/settings.json');
    });

    it('should return empty for repos with no settings files', async () => {
      // Create an initial commit with unrelated file
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');
      await execAsync('git add README.md', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      const files = await manager.getTrackedSettingsFiles(tempDir);
      expect(files).toEqual([]);
    });

    it('should handle both .claude and .opencode files', async () => {
      // Create and track files in both directories
      const claudeDir = path.join(tempDir, '.claude');
      const opencodeDir = path.join(tempDir, '.opencode');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.mkdirSync(opencodeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');
      fs.writeFileSync(path.join(opencodeDir, 'config.json'), '{}');

      await execAsync('git add .claude .opencode', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      const files = await manager.getTrackedSettingsFiles(tempDir);
      expect(files).toContain('.claude/settings.json');
      expect(files).toContain('.opencode/config.json');
    });
  });

  describe('stashSettingsChanges() — batched', () => {
    it('should mark tracked files as skip-worktree in a single command', async () => {
      // Create and track multiple .claude files
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');
      fs.writeFileSync(path.join(claudeDir, 'config.json'), '{}');

      await execAsync('git add .claude', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      await manager.stashSettingsChanges(tempDir);

      // Verify skip-worktree flags are set
      const { stdout } = await execAsync('git ls-files -v .claude', { cwd: tempDir });
      const lines = stdout.trim().split('\n');
      const skippedFiles = lines.filter((l) => l.startsWith('S '));
      expect(skippedFiles.length).toBe(2);
    });

    it('should do nothing in non-git directory', async () => {
      const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-nongit-'));
      try {
        // Should not throw
        await manager.stashSettingsChanges(nonGitDir); // should not throw
      } finally {
        fs.rmSync(nonGitDir, { recursive: true, force: true });
      }
    });

    it('should do nothing when no tracked settings files exist', async () => {
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');
      await execAsync('git add README.md', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      await manager.stashSettingsChanges(tempDir); // should not throw
    });
  });

  describe('popSettingsChanges() — crash-safe', () => {
    it('should detect and remove skip-worktree flags from git index', async () => {
      // Setup: create tracked file and set skip-worktree
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');

      await execAsync('git add .claude', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });
      await execAsync('git update-index --skip-worktree .claude/settings.json', { cwd: tempDir });

      // Verify flag is set
      const { stdout: before } = await execAsync('git ls-files -v .claude', { cwd: tempDir });
      expect(before.trim()).toMatch(/^S /);

      // Pop should detect and remove the flag
      await manager.popSettingsChanges(tempDir);

      // Verify flag is removed
      const { stdout: after } = await execAsync('git ls-files -v .claude', { cwd: tempDir });
      expect(after.trim()).not.toMatch(/^S /);
    });

    it('should work without in-memory state (crash recovery scenario)', async () => {
      // Setup: create tracked file and set skip-worktree via raw git command
      // (simulating flags left by a crashed process — manager has no in-memory state)
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');

      await execAsync('git add .claude', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      // Set skip-worktree directly (not through our manager)
      await execAsync('git update-index --skip-worktree .claude/settings.json', { cwd: tempDir });

      // Create a FRESH manager instance (simulating restart after crash)
      const freshManager = new GitStashManager();

      // Should detect and remove the flag from git index
      await freshManager.popSettingsChanges(tempDir);

      const { stdout } = await execAsync('git ls-files -v .claude', { cwd: tempDir });
      expect(stdout.trim()).not.toMatch(/^S /);
    });

    it('should handle multiple flagged files in a single batch', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');
      fs.writeFileSync(path.join(claudeDir, 'config.json'), '{}');

      await execAsync('git add .claude', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      // Set skip-worktree on both files
      await execAsync('git update-index --skip-worktree .claude/settings.json .claude/config.json', { cwd: tempDir });

      await manager.popSettingsChanges(tempDir);

      // Both flags should be removed
      const { stdout } = await execAsync('git ls-files -v .claude', { cwd: tempDir });
      const skippedCount = stdout
        .trim()
        .split('\n')
        .filter((l) => l.startsWith('S ')).length;
      expect(skippedCount).toBe(0);
    });

    it('should do nothing when no skip-worktree flags exist', async () => {
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');
      await execAsync('git add README.md', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      await manager.popSettingsChanges(tempDir); // should not throw
    });

    it('should do nothing in non-git directory', async () => {
      const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-nongit-'));
      try {
        await manager.popSettingsChanges(nonGitDir); // should not throw
      } finally {
        fs.rmSync(nonGitDir, { recursive: true, force: true });
      }
    });
  });

  describe('Full stash/pop lifecycle', () => {
    it('should stash and pop without leaving artifacts', async () => {
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{}');

      await execAsync('git add .claude', { cwd: tempDir });
      await execAsync('git commit -m "init"', { cwd: tempDir });

      // Stash
      await manager.stashSettingsChanges(tempDir);

      // Modify the file (simulating Flow's changes)
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{"modified": true}');

      // File should NOT show in git status (skip-worktree hides it)
      const { stdout: status } = await execAsync('git status --porcelain', { cwd: tempDir });
      expect(status.trim()).toBe('');

      // Pop
      await manager.popSettingsChanges(tempDir);

      // File SHOULD now show in git status (flag removed)
      const { stdout: statusAfter } = await execAsync('git status --porcelain', { cwd: tempDir });
      expect(statusAfter.trim()).not.toBe('');
    });
  });
});
