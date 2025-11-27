/**
 * Cleanup Handler
 * Manages graceful cleanup on exit and crash recovery
 * Handles process signals and ensures backup restoration
 */

import chalk from 'chalk';
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
      console.log(chalk.yellow('\n⚠️  Interrupted by user, cleaning up...'));
      await this.onSignal('SIGINT');
      process.exit(0);
    });

    // SIGTERM
    process.on('SIGTERM', async () => {
      console.log(chalk.yellow('\n⚠️  Terminated, cleaning up...'));
      await this.onSignal('SIGTERM');
      process.exit(0);
    });

    // Uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error(chalk.red('\n✗ Uncaught Exception:'));
      console.error(error);
      await this.onSignal('uncaughtException');
      process.exit(1);
    });

    // Unhandled rejections
    process.on('unhandledRejection', async (reason) => {
      console.error(chalk.red('\n✗ Unhandled Rejection:'));
      console.error(reason);
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
   */
  private async onSignal(_signal: string): Promise<void> {
    if (!this.currentProjectHash) {
      return;
    }

    try {
      console.log(chalk.cyan('🧹 Cleaning up...'));

      const { shouldRestore, session } = await this.sessionManager.endSession(
        this.currentProjectHash
      );

      if (shouldRestore && session) {
        // Last session - restore environment
        console.log(chalk.cyan('   Restoring environment...'));
        await this.backupManager.restoreBackup(this.currentProjectHash, session.sessionId);
        console.log(chalk.green('✓ Environment restored'));
      } else if (!shouldRestore && session) {
        // Other sessions still running
        console.log(chalk.yellow(`   ${session.refCount} session(s) still running`));
      }
    } catch (error) {
      console.error(chalk.red('✗ Cleanup failed:'), error);
    }
  }

  /**
   * Recover on startup (for all projects)
   * Checks for orphaned sessions from crashes
   */
  async recoverOnStartup(): Promise<void> {
    const orphanedSessions = await this.sessionManager.detectOrphanedSessions();

    if (orphanedSessions.size === 0) {
      return;
    }

    console.log(chalk.cyan(`\n🔧 Recovering ${orphanedSessions.size} crashed session(s)...\n`));

    for (const [projectHash, session] of orphanedSessions) {
      console.log(chalk.dim(`   Project: ${session.projectPath}`));

      try {
        // Restore backup
        await this.backupManager.restoreBackup(projectHash, session.sessionId);

        // Clean up session
        await this.sessionManager.recoverSession(projectHash, session);

        console.log(chalk.green('   ✓ Environment restored\n'));
      } catch (error) {
        console.error(chalk.red('   ✗ Recovery failed:'), error);
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
