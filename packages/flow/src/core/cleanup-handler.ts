/**
 * Cleanup Handler
 * Manages graceful cleanup on exit and crash recovery
 *
 * Centralized cleanup for all exit paths:
 * - Signal (SIGTERM) → onSignal() → release + restore + finalize
 * - Manual (FlowExecutor.cleanup) → cleanup() → release + restore + finalize
 * - Crash recovery (next startup) → recoverOnStartup() → restore + finalize
 *
 * SIGINT is NOT handled — the child process (claude-code) handles its own Ctrl+C.
 * Suppression is done in execute-v2.ts around the child spawn.
 *
 * CRITICAL: backup.json is deleted AFTER restore succeeds (via finalizeSessionCleanup),
 * ensuring orphan detection always works even if the process dies mid-cleanup.
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
   * Register cleanup hooks for current project.
   * SIGINT is intentionally NOT handled — child handles Ctrl+C.
   */
  registerCleanupHooks(projectHash: string): void {
    if (this.registered) {
      return;
    }

    this.currentProjectHash = projectHash;
    this.registered = true;

    // SIGTERM — perform async cleanup then exit
    process.on('SIGTERM', () => {
      this.handleSignal('SIGTERM', 0);
    });

    // Uncaught exceptions — perform async cleanup then exit with error
    process.on('uncaughtException', (error) => {
      console.error('\nUncaught Exception:', error);
      this.handleSignal('uncaughtException', 1);
    });

    // Unhandled rejections — perform async cleanup then exit with error
    process.on('unhandledRejection', (reason) => {
      console.error('\nUnhandled Rejection:', reason);
      this.handleSignal('unhandledRejection', 1);
    });

    // 'exit' handler — SYNC ONLY, last resort safety net
    process.on('exit', () => {
      // If cleanup wasn't done via signal handlers, orphan recovery
      // will happen on next startup via recoverOnStartup()
    });
  }

  /**
   * Handle signal with async cleanup.
   * Ensures cleanup completes before process exit.
   */
  private handleSignal(signal: string, exitCode: number): void {
    // Prevent double cleanup
    if (this.cleanupInProgress || this.cleanupCompleted) {
      process.exit(exitCode);
      return;
    }

    this.cleanupInProgress = true;

    this.onSignal(signal).finally(() => {
      this.cleanupCompleted = true;
      process.exit(exitCode);
    });
  }

  /**
   * Async cleanup for signals.
   * Release session → restore if last → finalize AFTER restore.
   */
  private async onSignal(_signal: string): Promise<void> {
    if (!this.currentProjectHash) {
      return;
    }

    try {
      const { shouldRestore, backupRef } = await this.sessionManager.releaseSession(
        this.currentProjectHash
      );

      if (shouldRestore && backupRef) {
        await this.restoreAndFinalize(this.currentProjectHash, backupRef);
      }
    } catch (error) {
      debug('signal cleanup failed:', error);
    }
  }

  /**
   * Restore backup and finalize session.
   * Single source of truth for the restore → finalize → cleanup sequence.
   *
   * CRITICAL ordering: backup.json is deleted (via finalizeSessionCleanup) only
   * AFTER restoreBackup succeeds. If restore throws, finalize is NOT called,
   * ensuring orphan detection always works on next startup.
   */
  private async restoreAndFinalize(
    projectHash: string,
    backupRef: { sessionId: string; projectPath: string; target?: string }
  ): Promise<void> {
    await this.backupManager.restoreBackup(projectHash, backupRef.sessionId);
    await this.sessionManager.finalizeSessionCleanup(projectHash);
    await this.backupManager.cleanupOldBackups(projectHash, 3);
    // Clean up any orphaned .flow-restore-* temp dirs from interrupted restores
    if (backupRef.target) {
      await this.backupManager.cleanupOrphanedRestores(backupRef.projectPath, backupRef.target).catch(() => {});
    }
    await this.gitStashManager.popSettingsChanges(backupRef.projectPath);
    await this.secretsManager.clearSecrets(projectHash);
  }

  /**
   * Recover on startup (for all projects).
   * Handles: orphaned sessions, legacy migration, periodic heavy cleanup.
   */
  async recoverOnStartup(): Promise<void> {
    // 0. Migrate legacy session files (old <hash>.json format → new directory format)
    await this.migrateLegacySessions();

    // 1. Always recover orphaned sessions (from crashes) — fast when none exist
    const orphanedSessions = await this.sessionManager.detectOrphanedSessions();

    for (const [projectHash, backupRef] of orphanedSessions) {
      try {
        await this.restoreAndFinalize(projectHash, backupRef);
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
   * Migrate legacy session files (old format: sessions/<hash>.json)
   * to new directory format (sessions/<hash>/backup.json + pids/)
   */
  private async migrateLegacySessions(): Promise<void> {
    const sessionsDir = path.join(this.projectManager.getFlowHomeDir(), 'sessions');

    if (!existsSync(sessionsDir)) {
      return;
    }

    try {
      const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
      const legacyFiles = entries.filter(
        (e) => e.isFile() && e.name.endsWith('.json') && e.name !== '.last-cleanup'
      );

      for (const file of legacyFiles) {
        const hash = file.name.replace('.json', '');
        const legacyPath = path.join(sessionsDir, file.name);

        try {
          const content = JSON.parse(await fs.readFile(legacyPath, 'utf-8'));

          // Only migrate if it has the old session format fields
          if (content.sessionId && content.backupPath && content.cleanupRequired !== undefined) {
            const paths = this.projectManager.getProjectPaths(hash);

            // Create new directory structure
            await fs.mkdir(paths.pidsDir, { recursive: true });

            // Write backup.json from old session data (only if cleanup was still required)
            if (content.cleanupRequired) {
              const backupRef = {
                sessionId: content.sessionId,
                backupPath: content.backupPath,
                projectPath: content.projectPath,
                target: content.target,
                createdAt: content.startTime,
                createdByPid: content.pid,
              };
              await fs.writeFile(paths.backupRefFile, JSON.stringify(backupRef, null, 2));
            }

            // Remove legacy file
            await fs.unlink(legacyPath);
            debug('migrated legacy session %s', hash);
          }
        } catch (error) {
          debug('failed to migrate legacy session %s: %O', hash, error);
          // Move corrupt file aside instead of deleting — preserves data for diagnosis
          try {
            await fs.rename(legacyPath, `${legacyPath}.corrupt`);
          } catch {
            // If rename fails, remove it to prevent retry loops
            try {
              await fs.unlink(legacyPath);
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch (error) {
      debug('legacy migration scan failed:', error);
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
   * Manually cleanup a specific project session.
   * Release → restore if last → finalize AFTER restore.
   */
  async cleanup(projectHash: string): Promise<void> {
    const { shouldRestore, backupRef } = await this.sessionManager.releaseSession(projectHash);

    if (shouldRestore && backupRef) {
      await this.restoreAndFinalize(projectHash, backupRef);
    }
  }

  /**
   * Clean up data for projects whose paths no longer exist.
   * Uses isSessionActive instead of getActiveSession.
   */
  private async cleanupOrphanedProjects(): Promise<void> {
    const allHashes = await this.getAllProjectHashes();

    for (const hash of allHashes) {
      // Skip projects with active sessions
      const isActive = await this.sessionManager.isSessionActive(hash);
      if (isActive) {
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
   * Remove all stored data for a project hash (backups, secrets, session dir)
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

    // Remove session directory (replaces old fs.unlink(sessionFile))
    try {
      await fs.rm(paths.sessionDir, { recursive: true, force: true });
    } catch {
      // Expected: directory may not exist
    }
  }
}
