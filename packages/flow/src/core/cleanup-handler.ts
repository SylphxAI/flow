/**
 * Cleanup Handler
 * Manages graceful cleanup on exit and crash recovery
 * Handles process signals and ensures backup restoration
 *
 * Centralized cleanup for all exit paths:
 * - Signal (SIGINT/SIGTERM) → onSignal() → restore + cleanup
 * - Manual (FlowExecutor.cleanup) → cleanup() → restore + cleanup
 * - Crash recovery (next startup) → recoverOnStartup() → restore + prune
 *
 * IMPORTANT: Node.js 'exit' event handlers MUST be synchronous.
 * We use SIGINT/SIGTERM handlers to perform async cleanup before exiting.
 * The 'exit' handler is only a last-resort sync cleanup.
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import createDebug from 'debug';
import type { BackupManager } from './backup-manager.js';
import type { GitStashManager } from './git-stash-manager.js';
import type { ProjectManager } from './project-manager.js';
import type { SecretsManager } from './secrets-manager.js';
import type { SessionManager } from './session-manager.js';

const debug = createDebug('flow:cleanup');

export class CleanupHandler {
  private projectManager: ProjectManager;
  private sessionManager: SessionManager;
  private backupManager: BackupManager;
  private gitStashManager: GitStashManager;
  private secretsManager: SecretsManager;
  private registered = false;
  private currentProjectHash: string | null = null;
  private cleanupInProgress = false;
  private cleanupCompleted = false;

  constructor(
    projectManager: ProjectManager,
    sessionManager: SessionManager,
    backupManager: BackupManager,
    gitStashManager: GitStashManager,
    secretsManager: SecretsManager
  ) {
    this.projectManager = projectManager;
    this.sessionManager = sessionManager;
    this.backupManager = backupManager;
    this.gitStashManager = gitStashManager;
    this.secretsManager = secretsManager;
  }

  /**
   * Register cleanup hooks for current project
   */
  registerCleanupHooks(projectHash: string): void {
    if (this.registered) {
      return;
    }

    this.currentProjectHash = projectHash;
    this.registered = true;

    // SIGINT (Ctrl+C) - perform async cleanup then exit
    process.on('SIGINT', () => {
      this.handleSignal('SIGINT', 0);
    });

    // SIGTERM - perform async cleanup then exit
    process.on('SIGTERM', () => {
      this.handleSignal('SIGTERM', 0);
    });

    // Uncaught exceptions - perform async cleanup then exit with error
    process.on('uncaughtException', (error) => {
      console.error('\nUncaught Exception:', error);
      this.handleSignal('uncaughtException', 1);
    });

    // Unhandled rejections - perform async cleanup then exit with error
    process.on('unhandledRejection', (reason) => {
      console.error('\nUnhandled Rejection:', reason);
      this.handleSignal('unhandledRejection', 1);
    });

    // 'exit' handler - SYNC ONLY, last resort
    // This catches cases where process.exit() was called without going through signals
    process.on('exit', () => {
      // If cleanup wasn't done via signal handlers, log warning
      // (We can't do async cleanup here - just flag it)
      if (!this.cleanupCompleted && this.currentProjectHash) {
        // Recovery will happen on next startup via recoverOnStartup()
        // This is the intended safety net for abnormal exits
      }
    });
  }

  /**
   * Handle signal with async cleanup
   * Ensures cleanup completes before process exit
   */
  private handleSignal(signal: string, exitCode: number): void {
    // Prevent double cleanup
    if (this.cleanupInProgress || this.cleanupCompleted) {
      process.exit(exitCode);
      return;
    }

    this.cleanupInProgress = true;

    // Perform async cleanup, then exit
    this.onSignal(signal).finally(() => {
      this.cleanupCompleted = true;
      process.exit(exitCode);
    });
  }

  /**
   * Async cleanup for signals and manual cleanup
   * Handles session end and backup restoration
   */
  private async onSignal(_signal: string): Promise<void> {
    if (!this.currentProjectHash) {
      return;
    }

    try {
      const { shouldRestore, session } = await this.sessionManager.endSession(
        this.currentProjectHash
      );

      if (shouldRestore && session) {
        await this.backupManager.restoreBackup(this.currentProjectHash, session.sessionId);
        await this.backupManager.cleanupOldBackups(this.currentProjectHash, 3);
        await this.gitStashManager.popSettingsChanges(session.projectPath);
        await this.secretsManager.clearSecrets(this.currentProjectHash);
      }
    } catch (error) {
      debug('signal cleanup failed:', error);
    }
  }

  /**
   * Recover on startup (for all projects)
   * Comprehensive cleanup: crashed sessions, stale data, history pruning
   * Silent operation - no console output
   *
   * Performance: Heavy cleanup scans (history pruning, orphaned project detection)
   * run at most once per day to avoid slowing down every startup.
   */
  async recoverOnStartup(): Promise<void> {
    // 1. Always recover orphaned sessions (from crashes) — fast when none exist
    const orphanedSessions = await this.sessionManager.detectOrphanedSessions();

    for (const [projectHash, session] of orphanedSessions) {
      try {
        await this.backupManager.restoreBackup(projectHash, session.sessionId);
        await this.sessionManager.recoverSession(projectHash, session);
        await this.gitStashManager.popSettingsChanges(session.projectPath);
        await this.secretsManager.clearSecrets(projectHash);
        await this.backupManager.cleanupOldBackups(projectHash, 3);
      } catch (error) {
        debug('startup recovery failed for session:', error);
      }
    }

    // 2. Heavy cleanup scans — only once per day
    if (await this.shouldRunPeriodicCleanup()) {
      try {
        await Promise.all([
          this.sessionManager.cleanupSessionHistory(50),
          this.cleanupOrphanedProjects(),
        ]);
      } catch (error) {
        debug('periodic cleanup failed:', error);
      }
      await this.updateCleanupTimestamp();
    }
  }

  /**
   * Check if periodic cleanup should run (at most once per 24 hours)
   */
  private async shouldRunPeriodicCleanup(): Promise<boolean> {
    const markerPath = path.join(this.projectManager.getFlowHomeDir(), '.last-cleanup');
    try {
      const stat = await fs.stat(markerPath);
      const hoursSinceLastCleanup = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
      return hoursSinceLastCleanup >= 24;
    } catch {
      return true;
    }
  }

  /**
   * Update the cleanup timestamp marker
   */
  private async updateCleanupTimestamp(): Promise<void> {
    const markerPath = path.join(this.projectManager.getFlowHomeDir(), '.last-cleanup');
    try {
      await fs.writeFile(markerPath, new Date().toISOString());
    } catch (error) {
      debug('failed to update cleanup timestamp:', error);
    }
  }

  /**
   * Manually cleanup a specific project session (with multi-session support)
   */
  async cleanup(projectHash: string): Promise<void> {
    const { shouldRestore, session } = await this.sessionManager.endSession(projectHash);

    if (shouldRestore && session) {
      // Last session - full restore and cleanup
      await this.backupManager.restoreBackup(projectHash, session.sessionId);
      await this.backupManager.cleanupOldBackups(projectHash, 3);
      await this.gitStashManager.popSettingsChanges(session.projectPath);
      await this.secretsManager.clearSecrets(projectHash);
    }
  }

  /**
   * Clean up data for projects whose paths no longer exist
   * Detects orphaned project hashes by checking if the original project path is accessible
   */
  private async cleanupOrphanedProjects(): Promise<void> {
    const allHashes = await this.getAllProjectHashes();

    for (const hash of allHashes) {
      // Skip projects with active sessions
      const activeSession = await this.sessionManager.getActiveSession(hash);
      if (activeSession) {
        continue;
      }

      // Try to find the project path from backup manifests
      const projectPath = await this.getProjectPathFromBackup(hash);
      if (!projectPath) {
        // No manifest — orphaned data with no way to trace origin
        await this.cleanupProjectData(hash);
        continue;
      }

      // If project path no longer exists, clean up
      if (!existsSync(projectPath)) {
        await this.cleanupProjectData(hash);
      }
    }
  }

  /**
   * Get all known project hashes from backups and secrets directories
   */
  private async getAllProjectHashes(): Promise<string[]> {
    const flowHome = this.projectManager.getFlowHomeDir();

    const scanDir = async (dir: string): Promise<string[]> => {
      if (!existsSync(dir)) {
        return [];
      }
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries.filter((e) => e.isDirectory()).map((e) => e.name);
      } catch (error) {
        debug('failed to scan directory %s: %O', dir, error);
        return [];
      }
    };

    // Scan both directories in parallel
    const [backupHashes, secretHashes] = await Promise.all([
      scanDir(path.join(flowHome, 'backups')),
      scanDir(path.join(flowHome, 'secrets')),
    ]);

    return [...new Set([...backupHashes, ...secretHashes])];
  }

  /**
   * Extract project path from the most recent backup manifest
   */
  private async getProjectPathFromBackup(projectHash: string): Promise<string | null> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    try {
      const entries = await fs.readdir(paths.backupsDir, { withFileTypes: true });
      const sessions = entries
        .filter((e) => e.isDirectory() && e.name.startsWith('session-'))
        .sort((a, b) => b.name.localeCompare(a.name)); // newest first

      if (sessions.length === 0) {
        return null;
      }

      const manifestPath = path.join(paths.backupsDir, sessions[0].name, 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
      return manifest.projectPath || null;
    } catch (error) {
      debug('failed to read backup manifest for %s: %O', projectHash, error);
      return null;
    }
  }

  /**
   * Remove all stored data for a project hash (backups, secrets, session file)
   */
  private async cleanupProjectData(projectHash: string): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Remove backups directory
    try {
      await fs.rm(paths.backupsDir, { recursive: true, force: true });
    } catch (error) {
      debug('failed to remove backups for %s: %O', projectHash, error);
    }

    // Remove secrets directory
    try {
      await fs.rm(paths.secretsDir, { recursive: true, force: true });
    } catch (error) {
      debug('failed to remove secrets for %s: %O', projectHash, error);
    }

    // Remove session file if exists
    try {
      await fs.unlink(paths.sessionFile);
    } catch {
      // Expected: file may not exist
    }
  }
}
