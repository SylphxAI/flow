/**
 * Git Worktree Manager
 * Uses git update-index --skip-worktree to hide Flow's settings changes from git status
 * Prevents LLM from accidentally committing Flow's temporary changes
 */

import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class GitStashManager {
  private skipWorktreeFiles: string[] = [];

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
   * Get all tracked files in settings directories
   */
  async getTrackedSettingsFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];

    // Check .claude directory
    const claudeDir = path.join(projectPath, '.claude');
    if (existsSync(claudeDir)) {
      try {
        const { stdout } = await execAsync('git ls-files .claude', { cwd: projectPath });
        const claudeFiles = stdout
          .trim()
          .split('\n')
          .filter((f) => f);
        files.push(...claudeFiles);
      } catch {
        // Directory not tracked in git
      }
    }

    // Check .opencode directory
    const opencodeDir = path.join(projectPath, '.opencode');
    if (existsSync(opencodeDir)) {
      try {
        const { stdout } = await execAsync('git ls-files .opencode', { cwd: projectPath });
        const opencodeFiles = stdout
          .trim()
          .split('\n')
          .filter((f) => f);
        files.push(...opencodeFiles);
      } catch {
        // Directory not tracked in git
      }
    }

    return files;
  }

  /**
   * Mark settings files as skip-worktree before attach
   * This hides Flow's settings modifications from git status
   */
  async stashSettingsChanges(projectPath: string): Promise<void> {
    // Check if in git repo
    const inGitRepo = await this.isGitRepo(projectPath);
    if (!inGitRepo) {
      return;
    }

    // Get all tracked settings files
    const files = await this.getTrackedSettingsFiles(projectPath);
    if (files.length === 0) {
      return;
    }

    try {
      // Mark each file as skip-worktree
      for (const file of files) {
        try {
          await execAsync(`git update-index --skip-worktree "${file}"`, { cwd: projectPath });
          this.skipWorktreeFiles.push(file);
        } catch {
          // File might not exist or not tracked, skip it
        }
      }
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Unmark settings files as skip-worktree after restore
   * This restores normal git tracking
   */
  async popSettingsChanges(projectPath: string): Promise<void> {
    if (this.skipWorktreeFiles.length === 0) {
      return;
    }

    try {
      // Unmark each file
      for (const file of this.skipWorktreeFiles) {
        try {
          await execAsync(`git update-index --no-skip-worktree "${file}"`, { cwd: projectPath });
        } catch {
          // File might have been deleted, skip it
        }
      }

      this.skipWorktreeFiles = [];
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Reset state (for cleanup)
   */
  reset(): void {
    this.skipWorktreeFiles = [];
  }
}
