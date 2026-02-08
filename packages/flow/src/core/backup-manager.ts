/**
 * Backup Manager
 * Handles backup and restore of project environments
 * Supports multi-project isolation in ~/.sylphx-flow/backups/
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Target } from '../types/target.types.js';
import type { ProjectManager } from './project-manager.js';
import { resolveTarget, resolveTargetOrId } from './target-resolver.js';

export interface BackupInfo {
  sessionId: string;
  timestamp: string;
  projectPath: string;
  target: string;
  backupPath: string;
}

export interface BackupManifest {
  sessionId: string;
  timestamp: string;
  projectPath: string;
  target: string;
  backup: {
    config?: {
      path: string;
      hash: string;
      mcpServersCount: number;
    };
    agents: {
      user: string[];
      flow: string[];
    };
    commands: {
      user: string[];
      flow: string[];
    };
    skills: {
      user: string[];
      flow: string[];
    };
    rules?: {
      path: string;
      originalSize: number;
      flowContentAdded: boolean;
    };
    singleFiles: Record<
      string,
      {
        existed: boolean;
        originalSize: number;
        flowContentAdded: boolean;
      }
    >;
  };
  secrets: {
    mcpEnvExtracted: boolean;
    storedAt: string;
  };
}

export class BackupManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Create full backup of project environment
   */
  async createBackup(
    projectPath: string,
    projectHash: string,
    targetOrId: Target | string
  ): Promise<BackupInfo> {
    const target = resolveTargetOrId(targetOrId);
    const targetId = target.id;
    const sessionId = `session-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const paths = this.projectManager.getProjectPaths(projectHash);
    const backupPath = path.join(paths.backupsDir, sessionId);

    // Ensure backup directory exists
    await fs.mkdir(backupPath, { recursive: true });

    // Get target config directory
    const targetConfigDir = this.projectManager.getTargetConfigDir(projectPath, target);

    // Backup entire target directory if it exists
    if (existsSync(targetConfigDir)) {
      // Use configDir from target config (e.g., '.claude', '.opencode')
      const backupTargetDir = path.join(backupPath, target.config.configDir);
      await this.copyDirectory(targetConfigDir, backupTargetDir);
    }

    // Create manifest (store target ID as string for JSON serialization)
    const manifest: BackupManifest = {
      sessionId,
      timestamp,
      projectPath,
      target: targetId,
      backup: {
        agents: { user: [], flow: [] },
        commands: { user: [], flow: [] },
        skills: { user: [], flow: [] },
        singleFiles: {},
      },
      secrets: {
        mcpEnvExtracted: false,
        storedAt: '',
      },
    };

    await fs.writeFile(path.join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // Create symlink to latest (with fallback for Windows)
    const latestLink = paths.latestBackup;
    if (existsSync(latestLink)) {
      await fs.unlink(latestLink);
    }
    try {
      await fs.symlink(sessionId, latestLink);
    } catch (symlinkError: unknown) {
      // Windows without admin/Developer Mode can't create symlinks
      // Fall back to writing session ID to a file
      if (
        symlinkError instanceof Error &&
        'code' in symlinkError &&
        symlinkError.code === 'EPERM'
      ) {
        await fs.writeFile(latestLink, sessionId, 'utf-8');
      } else {
        throw symlinkError;
      }
    }

    return {
      sessionId,
      timestamp,
      projectPath,
      target: targetId,
      backupPath,
    };
  }

  /**
   * Restore backup to project (atomic).
   *
   * Uses copy-to-temp → rm → rename pattern to ensure atomicity:
   * 1. Copy backup → temp dir (.claude.flow-restore-<timestamp>)
   * 2. rm -rf current config dir
   * 3. fs.rename(temp, configDir) — atomic on same filesystem
   *
   * If the process dies after step 2 but before step 3, the temp dir
   * still exists. cleanupOrphanedRestores() detects this on next startup
   * and renames it into place as recovery.
   */
  async restoreBackup(projectHash: string, sessionId: string): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const backupPath = path.join(paths.backupsDir, sessionId);

    if (!existsSync(backupPath)) {
      throw new Error(`Backup not found: ${sessionId}`);
    }

    // Read manifest
    const manifestPath = path.join(backupPath, 'manifest.json');
    const manifest: BackupManifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

    const projectPath = manifest.projectPath;
    const targetId = manifest.target;

    // Resolve target to get config
    const target = resolveTarget(targetId);

    // Get target config directory (e.g., /project/.claude)
    const targetConfigDir = this.projectManager.getTargetConfigDir(projectPath, target);
    const backupTargetDir = path.join(backupPath, target.config.configDir);

    if (!existsSync(backupTargetDir)) {
      // No backup config to restore — just remove current config
      if (existsSync(targetConfigDir)) {
        await fs.rm(targetConfigDir, { recursive: true, force: true });
      }
      return;
    }

    // Atomic restore: copy → rm → rename
    const tempDir = path.join(
      path.dirname(targetConfigDir),
      `${path.basename(targetConfigDir)}.flow-restore-${Date.now()}`
    );

    try {
      // 1. Copy backup to temp dir
      await this.copyDirectory(backupTargetDir, tempDir);

      // 2. Remove current config dir
      if (existsSync(targetConfigDir)) {
        await fs.rm(targetConfigDir, { recursive: true, force: true });
      }

      // 3. Rename temp → config dir (atomic on same filesystem)
      try {
        await fs.rename(tempDir, targetConfigDir);
      } catch (renameError: unknown) {
        // EXDEV: cross-device link — source and dest on different filesystems.
        // Fall back to copy + delete (not atomic, but functional).
        if (renameError instanceof Error && 'code' in renameError && (renameError as NodeJS.ErrnoException).code === 'EXDEV') {
          await this.copyDirectory(tempDir, targetConfigDir);
          await fs.rm(tempDir, { recursive: true, force: true });
        } else {
          throw renameError;
        }
      }
    } catch (error) {
      // Clean up temp dir on failure
      try {
        if (existsSync(tempDir)) {
          await fs.rm(tempDir, { recursive: true, force: true });
        }
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Get backup manifest
   */
  async getManifest(projectHash: string, sessionId: string): Promise<BackupManifest | null> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const manifestPath = path.join(paths.backupsDir, sessionId, 'manifest.json');

    if (!existsSync(manifestPath)) {
      return null;
    }

    const data = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Update backup manifest
   */
  async updateManifest(
    projectHash: string,
    sessionId: string,
    manifest: BackupManifest
  ): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const manifestPath = path.join(paths.backupsDir, sessionId, 'manifest.json');

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Clean up orphaned .flow-restore-* temp directories left by interrupted restores.
   * If the process dies between rm(.claude) and rename(temp, .claude), the temp dir
   * is stranded. This scans known project paths and removes any orphaned temp dirs.
   *
   * If the config dir is also missing (both deleted), the temp dir IS the backup —
   * rename it into place as recovery.
   */
  async cleanupOrphanedRestores(projectPath: string, targetOrId: Target | string): Promise<void> {
    const target = resolveTargetOrId(targetOrId);
    const targetConfigDir = this.projectManager.getTargetConfigDir(projectPath, target);
    const parentDir = path.dirname(targetConfigDir);
    const configBaseName = path.basename(targetConfigDir);

    if (!existsSync(parentDir)) {
      return;
    }

    try {
      const entries = await fs.readdir(parentDir);
      const orphanedRestores = entries.filter(
        (e) => e.startsWith(`${configBaseName}.flow-restore-`)
      );

      for (const orphan of orphanedRestores) {
        const orphanPath = path.join(parentDir, orphan);
        if (!existsSync(targetConfigDir)) {
          // Config dir is gone — this temp dir IS the recovery. Rename it in.
          try {
            await fs.rename(orphanPath, targetConfigDir);
          } catch {
            // If rename fails, remove it
            await fs.rm(orphanPath, { recursive: true, force: true }).catch(() => {});
          }
        } else {
          // Config dir exists — temp dir is a leftover. Remove it.
          await fs.rm(orphanPath, { recursive: true, force: true }).catch(() => {});
        }
      }
    } catch {
      // Non-fatal — project dir might not exist
    }
  }

  /**
   * Cleanup old backups (keep last N)
   */
  async cleanupOldBackups(projectHash: string, keepLast: number = 3): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    if (!existsSync(paths.backupsDir)) {
      return;
    }

    const entries = await fs.readdir(paths.backupsDir, { withFileTypes: true });
    const sessions = entries
      .filter((e) => e.isDirectory() && e.name.startsWith('session-'))
      .map((e) => ({
        name: e.name,
        timestamp: parseInt(e.name.replace('session-', ''), 10),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // Remove old backups in parallel
    const toRemove = sessions.slice(keepLast);
    await Promise.all(
      toRemove.map((session) =>
        fs.rm(path.join(paths.backupsDir, session.name), { recursive: true, force: true })
      )
    );
  }

  /**
   * Copy directory recursively using native fs.cp
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.cp(src, dest, { recursive: true });
  }

  /**
   * Get list of backups for project
   */
  async listBackups(projectHash: string): Promise<
    Array<{
      sessionId: string;
      timestamp: string;
      target: string;
    }>
  > {
    const paths = this.projectManager.getProjectPaths(projectHash);

    if (!existsSync(paths.backupsDir)) {
      return [];
    }

    const entries = await fs.readdir(paths.backupsDir, { withFileTypes: true });
    const backups = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('session-')) {
        continue;
      }

      const manifestPath = path.join(paths.backupsDir, entry.name, 'manifest.json');
      if (existsSync(manifestPath)) {
        const manifest: BackupManifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
        backups.push({
          sessionId: manifest.sessionId,
          timestamp: manifest.timestamp,
          target: manifest.target,
        });
      }
    }

    return backups.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
