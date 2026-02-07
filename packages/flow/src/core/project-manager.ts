/**
 * Project Manager
 * Manages project identification and paths for multi-project support
 * All projects store data in ~/.sylphx-flow/ isolated by project hash
 */

import { exec } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { Target } from '../types/target.types.js';
import { readJsonFileSafe } from '../utils/files/file-operations.js';
import { targetManager } from './target-manager.js';

const execAsync = promisify(exec);

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
    await Promise.all([
      fs.mkdir(path.join(this.flowHomeDir, 'sessions'), { recursive: true }),
      fs.mkdir(path.join(this.flowHomeDir, 'backups'), { recursive: true }),
      fs.mkdir(path.join(this.flowHomeDir, 'secrets'), { recursive: true }),
      fs.mkdir(path.join(this.flowHomeDir, 'templates'), { recursive: true }),
    ]);
  }

  /**
   * Check if a command is available on the system (non-blocking)
   */
  private async isCommandAvailable(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`, { timeout: 5000 });
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
    const prefs = await readJsonFileSafe<{ projects?: Record<string, { target?: string }> }>(
      prefsPath,
      {}
    );
    return prefs.projects?.[projectHash]?.target as 'claude-code' | 'opencode' | undefined;
  }

  /**
   * Save project-specific target preference to global config
   */
  async saveProjectTargetPreference(projectHash: string, target: string): Promise<void> {
    const prefsPath = path.join(this.flowHomeDir, 'project-preferences.json');
    const prefs = await readJsonFileSafe<{ projects: Record<string, { target?: string }> }>(
      prefsPath,
      { projects: {} }
    );

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
   * Detect target platform
   * New strategy: Detect based on installed commands, not folders
   * Priority: saved preference > installed commands > global default
   */
  async detectTarget(projectPath: string): Promise<string> {
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
      const settings = await readJsonFileSafe<{ defaultTarget?: string }>(globalSettingsPath, {});
      if (settings.defaultTarget) {
        await this.saveProjectTargetPreference(projectHash, settings.defaultTarget);
        return settings.defaultTarget;
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
   * @param projectPath - The project root path
   * @param target - Either a Target object or target ID string
   */
  getTargetConfigDir(projectPath: string, target: Target | string): string {
    // If target is a string, look up the Target object
    const targetObj =
      typeof target === 'string'
        ? targetManager.getTarget(target)
        : { _tag: 'Some' as const, value: target };

    if (targetObj._tag === 'None') {
      // Fallback for unknown targets - use the ID as directory name
      return path.join(projectPath, `.${target}`);
    }

    return path.join(projectPath, targetObj.value.config.configDir);
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
