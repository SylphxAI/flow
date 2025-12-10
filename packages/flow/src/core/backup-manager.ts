/**
 * Backup Manager
 * Handles backup and restore of project environments
 * Supports multi-project isolation in ~/.sylphx-flow/backups/
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import ora from 'ora';
import type { Target } from '../types/target.types.js';
import type { ProjectManager } from './project-manager.js';
import { targetManager } from './target-manager.js';

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
   * Resolve target from ID string to Target object
   */
  private resolveTarget(targetId: string): Target {
    const targetOption = targetManager.getTarget(targetId);
    if (targetOption._tag === 'None') {
      throw new Error(`Unknown target: ${targetId}`);
    }
    return targetOption.value;
  }

  /**
   * Create full backup of project environment
   */
  async createBackup(
    projectPath: string,
    projectHash: string,
    targetOrId: Target | string
  ): Promise<BackupInfo> {
    const target = typeof targetOrId === 'string' ? this.resolveTarget(targetOrId) : targetOrId;
    const targetId = target.id;
    const sessionId = `session-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const paths = this.projectManager.getProjectPaths(projectHash);
    const backupPath = path.join(paths.backupsDir, sessionId);

    // Ensure backup directory exists
    await fs.mkdir(backupPath, { recursive: true });

    const spinner = ora('Creating backup...').start();

    try {
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

      spinner.succeed(`Backup created: ${sessionId}`);

      return {
        sessionId,
        timestamp,
        projectPath,
        target: targetId,
        backupPath,
      };
    } catch (error) {
      spinner.fail('Backup failed');
      throw error;
    }
  }

  /**
   * Restore backup to project
   */
  async restoreBackup(projectHash: string, sessionId: string): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const backupPath = path.join(paths.backupsDir, sessionId);

    if (!existsSync(backupPath)) {
      throw new Error(`Backup not found: ${sessionId}`);
    }

    const spinner = ora('Restoring backup...').start();

    try {
      // Read manifest
      const manifestPath = path.join(backupPath, 'manifest.json');
      const manifest: BackupManifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

      const projectPath = manifest.projectPath;
      const targetId = manifest.target;

      // Resolve target to get config
      const target = this.resolveTarget(targetId);

      // Get target config directory
      const targetConfigDir = this.projectManager.getTargetConfigDir(projectPath, target);

      // Remove current target directory
      if (existsSync(targetConfigDir)) {
        await fs.rm(targetConfigDir, { recursive: true, force: true });
      }

      // Restore from backup using target config's configDir
      const backupTargetDir = path.join(backupPath, target.config.configDir);

      if (existsSync(backupTargetDir)) {
        await this.copyDirectory(backupTargetDir, targetConfigDir);
      }

      spinner.succeed('Backup restored');
    } catch (error) {
      spinner.fail('Restore failed');
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

    // Remove old backups
    const toRemove = sessions.slice(keepLast);
    for (const session of toRemove) {
      const sessionPath = path.join(paths.backupsDir, session.name);
      await fs.rm(sessionPath, { recursive: true, force: true });
    }
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
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
