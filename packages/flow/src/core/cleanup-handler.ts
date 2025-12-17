/**
 * Cleanup Handler
 * Manages graceful cleanup on exit and crash recovery
 * Handles process signals and ensures backup restoration
 */

import type { BackupManager } from './backup-manager.js';
import type { ProjectManager } from './project-manager.js';
import type { SessionManager } from './session-manager.js';

export class CleanupHandler {
  private sessionManager: SessionManager;
  private backupManager: BackupManager;
  private registered = false;
  private currentProjectHash: string | null = null;

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

    // Normal exit
    process.on('exit', async () => {
      await this.onExit();
    });

    // SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      await this.onSignal('SIGINT');
      process.exit(0);
    });

    // SIGTERM
    process.on('SIGTERM', async () => {
      await this.onSignal('SIGTERM');
      process.exit(0);
    });

    // Uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('\nUncaught Exception:', error);
      await this.onSignal('uncaughtException');
      process.exit(1);
    });

    // Unhandled rejections
    process.on('unhandledRejection', async (reason) => {
      console.error('\nUnhandled Rejection:', reason);
      await this.onSignal('unhandledRejection');
      process.exit(1);
    });
  }

  /**
   * Normal exit cleanup (with multi-session support)
   */
  private async onExit(): Promise<void> {
    if (!this.currentProjectHash) {
      return;
    }

    try {
      const { shouldRestore, session } = await this.sessionManager.endSession(
        this.currentProjectHash
      );

      if (shouldRestore && session) {
        // Last session - restore backup silently on normal exit
        await this.backupManager.restoreBackup(this.currentProjectHash, session.sessionId);
        await this.backupManager.cleanupOldBackups(this.currentProjectHash, 3);
      }
    } catch (_error) {
      // Silent fail on exit
    }
  }

  /**
   * Signal-based cleanup (SIGINT, SIGTERM, etc.) with multi-session support
   * Silent operation - no console output
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
      }
    } catch (_error) {
      // Silent fail
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
