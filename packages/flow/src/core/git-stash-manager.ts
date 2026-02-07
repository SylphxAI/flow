/**
 * Git Worktree Manager
 * Uses git update-index --skip-worktree to hide Flow's settings changes from git status
 * Prevents LLM from accidentally committing Flow's temporary changes
 *
 * Performance: All git operations are batched (single command for multiple files)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class GitStashManager {
  /**
   * Check if project is in a git repository
   */
  async isGitRepo(projectPath: string): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectPath });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all tracked files in settings directories (single git command)
   */
  async getTrackedSettingsFiles(projectPath: string): Promise<string[]> {
    try {
      // Single command covers both .claude and .opencode
      const { stdout } = await execAsync('git ls-files .claude .opencode', {
        cwd: projectPath,
      });
      return stdout
        .trim()
        .split('\n')
        .filter((f) => f);
    } catch {
      return [];
    }
  }

  /**
   * Mark settings files as skip-worktree before attach
   * Uses batched git command (single spawn for all files)
   */
  async stashSettingsChanges(projectPath: string): Promise<void> {
    const inGitRepo = await this.isGitRepo(projectPath);
    if (!inGitRepo) {
      return;
    }

    const files = await this.getTrackedSettingsFiles(projectPath);
    if (files.length === 0) {
      return;
    }

    try {
      // Batch all files in a single git command
      const quoted = files.map((f) => `"${f}"`).join(' ');
      await execAsync(`git update-index --skip-worktree ${quoted}`, { cwd: projectPath });
    } catch {
      // Silent fail — files might not exist or not be tracked
    }
  }

  /**
   * Unmark settings files as skip-worktree after restore
   * Detects flags directly from git index (crash-safe — no in-memory state dependency)
   * Uses batched git command (single spawn for all files)
   */
  async popSettingsChanges(projectPath: string): Promise<void> {
    const inGitRepo = await this.isGitRepo(projectPath);
    if (!inGitRepo) {
      return;
    }

    const flaggedFiles = await this.detectSkipWorktreeFiles(projectPath);
    if (flaggedFiles.length === 0) {
      return;
    }

    try {
      // Batch all files in a single git command
      const quoted = flaggedFiles.map((f) => `"${f}"`).join(' ');
      await execAsync(`git update-index --no-skip-worktree ${quoted}`, { cwd: projectPath });
    } catch {
      // Silent fail — files might have been deleted
    }
  }

  /**
   * Detect files with skip-worktree flag set in target config directories
   * Reads directly from git index — works even after crash recovery
   */
  private async detectSkipWorktreeFiles(projectPath: string): Promise<string[]> {
    try {
      // git ls-files -v shows skip-worktree files with 'S' prefix
      const { stdout } = await execAsync('git ls-files -v .claude .opencode', {
        cwd: projectPath,
      });
      return stdout
        .trim()
        .split('\n')
        .filter((line) => line.startsWith('S '))
        .map((line) => line.slice(2));
    } catch {
      return [];
    }
  }
}
