/**
 * Project Manager
 * Manages project identification and paths for multi-project support
 * All projects store data in ~/.sylphx-flow/ isolated by project hash
 */

import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

export interface ProjectPaths {
  sessionFile: string;
  backupsDir: string;
  secretsDir: string;
  latestBackup: string;
}

export class ProjectManager {
  private readonly flowHomeDir: string;

  constructor() {
    // All Flow data stored in ~/.sylphx-flow/
    this.flowHomeDir = path.join(os.homedir(), '.sylphx-flow');
  }

  /**
   * Get unique hash for project path
   * Uses first 16 chars of SHA256 hash of absolute path
   */
  getProjectHash(projectPath: string): string {
    const absolutePath = path.resolve(projectPath);
    return crypto
      .createHash('sha256')
      .update(absolutePath)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Get all paths for a project
   */
  getProjectPaths(projectHash: string): ProjectPaths {
    const sessionsDir = path.join(this.flowHomeDir, 'sessions');
    const backupsDir = path.join(this.flowHomeDir, 'backups', projectHash);
    const secretsDir = path.join(this.flowHomeDir, 'secrets', projectHash);

    return {
      sessionFile: path.join(sessionsDir, `${projectHash}.json`),
      backupsDir,
      secretsDir,
      latestBackup: path.join(backupsDir, 'latest'),
    };
  }

  /**
   * Get Flow home directory
   */
  getFlowHomeDir(): string {
    return this.flowHomeDir;
  }

  /**
   * Initialize Flow directories
   */
  async initialize(): Promise<void> {
    const dirs = [
      this.flowHomeDir,
      path.join(this.flowHomeDir, 'sessions'),
      path.join(this.flowHomeDir, 'backups'),
      path.join(this.flowHomeDir, 'secrets'),
      path.join(this.flowHomeDir, 'templates'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Detect target platform (claude-code or opencode)
   * Priority: local settings > directory detection > global settings > default
   */
  async detectTarget(projectPath: string): Promise<'claude-code' | 'opencode'> {
    // 1. Check local project settings first (.sylphx-flow/settings.json)
    const localSettingsPath = path.join(projectPath, '.sylphx-flow', 'settings.json');
    if (existsSync(localSettingsPath)) {
      try {
        const settings = JSON.parse(await fs.readFile(localSettingsPath, 'utf-8'));
        if (settings.target) {
          return settings.target;
        }
      } catch {
        // Fall through
      }
    }

    // 2. Check which directories exist
    const hasOpencode = existsSync(path.join(projectPath, '.opencode'));
    const hasClaude = existsSync(path.join(projectPath, '.claude'));

    // If only one exists, use that
    if (hasOpencode && !hasClaude) {
      return 'opencode';
    }
    if (hasClaude && !hasOpencode) {
      return 'claude-code';
    }

    // 3. Check global settings (~/.sylphx-flow/settings.json)
    const globalSettingsPath = path.join(this.flowHomeDir, 'settings.json');
    if (existsSync(globalSettingsPath)) {
      try {
        const settings = JSON.parse(await fs.readFile(globalSettingsPath, 'utf-8'));
        if (settings.defaultTarget) {
          return settings.defaultTarget;
        }
      } catch {
        // Fall through
      }
    }

    // 4. Default to claude-code
    return 'claude-code';
  }

  /**
   * Get target config directory for project
   */
  getTargetConfigDir(projectPath: string, target: 'claude-code' | 'opencode'): string {
    return target === 'claude-code'
      ? path.join(projectPath, '.claude')
      : path.join(projectPath, '.opencode');
  }

  /**
   * Get all active projects
   */
  async getActiveProjects(): Promise<Array<{ hash: string; sessionFile: string }>> {
    const sessionsDir = path.join(this.flowHomeDir, 'sessions');

    if (!existsSync(sessionsDir)) {
      return [];
    }

    const files = await fs.readdir(sessionsDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        hash: file.replace('.json', ''),
        sessionFile: path.join(sessionsDir, file),
      }));
  }

  /**
   * Get project info from hash
   */
  async getProjectInfo(projectHash: string): Promise<{
    hash: string;
    hasActiveSession: boolean;
    backupsCount: number;
    hasSecrets: boolean;
  } | null> {
    const paths = this.getProjectPaths(projectHash);

    const hasActiveSession = existsSync(paths.sessionFile);

    let backupsCount = 0;
    if (existsSync(paths.backupsDir)) {
      const backups = await fs.readdir(paths.backupsDir);
      backupsCount = backups.filter((b) => b.startsWith('session-')).length;
    }

    const hasSecrets = existsSync(paths.secretsDir);

    return {
      hash: projectHash,
      hasActiveSession,
      backupsCount,
      hasSecrets,
    };
  }
}
