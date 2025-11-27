/**
 * Project Manager
 * Manages project identification and paths for multi-project support
 * All projects store data in ~/.sylphx-flow/ isolated by project hash
 */

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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
    return crypto.createHash('sha256').update(absolutePath).digest('hex').substring(0, 16);
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
   * Check if a command is available on the system
   */
  private async isCommandAvailable(command: string): Promise<boolean> {
    try {
      const { execSync } = await import('node:child_process');
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect which commands are installed on this machine
   */
  private async detectInstalledCommands(): Promise<{
    claudeCode: boolean;
    opencode: boolean;
  }> {
    const [claudeCode, opencode] = await Promise.all([
      this.isCommandAvailable('claude'),
      this.isCommandAvailable('opencode'),
    ]);

    return { claudeCode, opencode };
  }

  /**
   * Get project-specific target preference from global config
   */
  private async getProjectTargetPreference(
    projectHash: string
  ): Promise<'claude-code' | 'opencode' | undefined> {
    const prefsPath = path.join(this.flowHomeDir, 'project-preferences.json');
    if (!existsSync(prefsPath)) {
      return undefined;
    }

    try {
      const prefs = JSON.parse(await fs.readFile(prefsPath, 'utf-8'));
      return prefs.projects?.[projectHash]?.target;
    } catch {
      return undefined;
    }
  }

  /**
   * Save project-specific target preference to global config
   */
  async saveProjectTargetPreference(
    projectHash: string,
    target: 'claude-code' | 'opencode'
  ): Promise<void> {
    const prefsPath = path.join(this.flowHomeDir, 'project-preferences.json');
    let prefs: { projects: Record<string, { target?: string }> } = { projects: {} };

    if (existsSync(prefsPath)) {
      try {
        prefs = JSON.parse(await fs.readFile(prefsPath, 'utf-8'));
      } catch {
        // Use default
      }
    }

    if (!prefs.projects) {
      prefs.projects = {};
    }

    prefs.projects[projectHash] = {
      target,
      lastUsed: new Date().toISOString(),
    };

    await fs.writeFile(prefsPath, JSON.stringify(prefs, null, 2));
  }

  /**
   * Detect target platform (claude-code or opencode)
   * New strategy: Detect based on installed commands, not folders
   * Priority: saved preference > installed commands > global default
   */
  async detectTarget(projectPath: string): Promise<'claude-code' | 'opencode'> {
    const projectHash = this.getProjectHash(projectPath);

    // 1. Check if we already have a saved preference for this project
    const savedPreference = await this.getProjectTargetPreference(projectHash);
    if (savedPreference) {
      // Verify the command is still available
      const isAvailable =
        savedPreference === 'claude-code'
          ? await this.isCommandAvailable('claude')
          : await this.isCommandAvailable('opencode');

      if (isAvailable) {
        return savedPreference;
      }
      // Command no longer available, fall through to re-detect
    }

    // 2. Detect which commands are installed
    const installed = await this.detectInstalledCommands();

    // If only one is installed, use that
    if (installed.claudeCode && !installed.opencode) {
      await this.saveProjectTargetPreference(projectHash, 'claude-code');
      return 'claude-code';
    }
    if (installed.opencode && !installed.claudeCode) {
      await this.saveProjectTargetPreference(projectHash, 'opencode');
      return 'opencode';
    }

    // If both are installed, use global default
    if (installed.claudeCode && installed.opencode) {
      const globalSettingsPath = path.join(this.flowHomeDir, 'settings.json');
      if (existsSync(globalSettingsPath)) {
        try {
          const settings = JSON.parse(await fs.readFile(globalSettingsPath, 'utf-8'));
          if (settings.defaultTarget) {
            await this.saveProjectTargetPreference(projectHash, settings.defaultTarget);
            return settings.defaultTarget;
          }
        } catch {
          // Fall through
        }
      }

      // Both installed, no global default, use claude-code
      await this.saveProjectTargetPreference(projectHash, 'claude-code');
      return 'claude-code';
    }

    // Neither installed - this will fail later, but return default
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
