/**
 * Cleanup Handler
 * Manages graceful cleanup on exit and crash recovery
 * Handles process signals and ensures backup restoration
 *
 * IMPORTANT: Node.js 'exit' event handlers MUST be synchronous.
 * We use SIGINT/SIGTERM handlers to perform async cleanup before exiting.
 * The 'exit' handler is only a last-resort sync cleanup.
 */

import type { BackupManager } from './backup-manager.js';
import type { ProjectManager } from './project-manager.js';
import type { SessionManager } from './session-manager.js';

export class CleanupHandler {
  private sessionManager: SessionManager;
  private backupManager: BackupManager;
  private registered = false;
  private currentProjectHash: string | null = null;
  private cleanupInProgress = false;
  private cleanupCompleted = false;

  constructor(
    projectManager: ProjectManager,
    sessionManager: SessionManager,
    backupManager: BackupManager
  ) {
    this.projectManager = projectManager;
    this.sessionManager = sessionManager;
    this.backupManager = backupManager;
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
      }
    } catch (_error) {
      // Silent fail - recovery will happen on next startup
    }
  }

  /**
   * Recover on startup (for all projects)
   * Checks for orphaned sessions from crashes
   * Silent operation - no console output
   */
  async recoverOnStartup(): Promise<void> {
    const orphanedSessions = await this.sessionManager.detectOrphanedSessions();

    if (orphanedSessions.size === 0) {
      return;
    }

    for (const [projectHash, session] of orphanedSessions) {
      try {
        await this.backupManager.restoreBackup(projectHash, session.sessionId);
        await this.sessionManager.recoverSession(projectHash, session);
      } catch (_error) {
        // Silent fail - don't interrupt startup
      }
    }
  }

  /**
   * Manually cleanup a specific project session (with multi-session support)
   */
  async cleanup(projectHash: string): Promise<void> {
    const { shouldRestore, session } = await this.sessionManager.endSession(projectHash);

    if (shouldRestore && session) {
      // Last session - restore environment
      await this.backupManager.restoreBackup(projectHash, session.sessionId);
      await this.backupManager.cleanupOldBackups(projectHash, 3);
    }
  }
}
