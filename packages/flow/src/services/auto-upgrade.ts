/**
 * Auto-Upgrade Service
 * Non-blocking version check with cache
 * Checks in background, shows result on next run
 */

import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import { detectPackageManager, getUpgradeCommand } from '../utils/package-manager-detector.js';
import { TargetInstaller } from './target-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache file for version checks (24 hour TTL)
const CACHE_FILE = path.join(os.homedir(), '.sylphx-flow', 'version-cache.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface VersionCache {
  flowLatest?: string;
  targetLatest?: Record<string, string>;
  targetCurrent?: Record<string, string>;
  checkedAt: number;
}

const execAsync = promisify(exec);

export interface UpgradeStatus {
  flowNeedsUpgrade: boolean;
  targetNeedsUpgrade: boolean;
  flowVersion: { current: string; latest: string } | null;
  targetVersion: { current: string; latest: string } | null;
}

export interface AutoUpgradeOptions {
  verbose?: boolean;
  skipFlow?: boolean;
  skipTarget?: boolean;
}

export class AutoUpgrade {
  private projectPath: string;
  private options: AutoUpgradeOptions;
  private targetInstaller: TargetInstaller;

  constructor(projectPath: string = process.cwd(), options: AutoUpgradeOptions = {}) {
    this.projectPath = projectPath;
    this.options = options;
    this.targetInstaller = new TargetInstaller(projectPath);
  }

  /**
   * Read version cache (instant, no network)
   */
  private async readCache(): Promise<VersionCache | null> {
    try {
      if (!existsSync(CACHE_FILE)) {
        return null;
      }
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Write version cache
   */
  private async writeCache(cache: VersionCache): Promise<void> {
    try {
      const dir = path.dirname(CACHE_FILE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch {
      // Silent fail
    }
  }

  /**
   * Get current Flow version from package.json (instant, local file)
   */
  private async getCurrentFlowVersion(): Promise<string> {
    try {
      const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.version;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Check for available upgrades using CACHE (instant, no network)
   * Returns cached results from previous background check
   */
  async checkForUpgrades(targetId?: string): Promise<UpgradeStatus> {
    const cache = await this.readCache();
    const currentVersion = await this.getCurrentFlowVersion();

    // Trigger background check for next run (non-blocking)
    this.checkInBackground(targetId);

    // No cache or expired = no upgrade info yet
    if (!cache) {
      return {
        flowNeedsUpgrade: false,
        targetNeedsUpgrade: false,
        flowVersion: null,
        targetVersion: null,
      };
    }

    // Check if Flow needs upgrade based on cache
    const flowVersion =
      cache.flowLatest && cache.flowLatest !== currentVersion
        ? { current: currentVersion, latest: cache.flowLatest }
        : null;

    // Check if target needs upgrade based on cache (instant, no local command)
    let targetVersion: { current: string; latest: string } | null = null;
    if (targetId && cache.targetLatest?.[targetId] && cache.targetCurrent?.[targetId]) {
      const current = cache.targetCurrent[targetId];
      const latest = cache.targetLatest[targetId];
      if (current !== latest) {
        targetVersion = { current, latest };
      }
    }

    return {
      flowNeedsUpgrade: !!flowVersion,
      targetNeedsUpgrade: !!targetVersion,
      flowVersion,
      targetVersion,
    };
  }

  /**
   * Check versions in background (non-blocking)
   * Updates cache for next run
   */
  private checkInBackground(targetId?: string): void {
    // Fire and forget - don't await
    this.performBackgroundCheck(targetId).catch(() => {
      // Silent fail
    });
  }

  /**
   * Perform the actual version check (called in background)
   */
  private async performBackgroundCheck(targetId?: string): Promise<void> {
    const cache = await this.readCache();

    // Skip if checked recently (within TTL)
    if (cache && Date.now() - cache.checkedAt < CACHE_TTL_MS) {
      return;
    }

    const newCache: VersionCache = {
      checkedAt: Date.now(),
      targetLatest: cache?.targetLatest || {},
      targetCurrent: cache?.targetCurrent || {},
    };

    // Check Flow version from npm (with timeout)
    try {
      const { stdout } = await execAsync('npm view @sylphx/flow version', { timeout: 5000 });
      newCache.flowLatest = stdout.trim();
    } catch {
      // Keep old cache value if check fails
      newCache.flowLatest = cache?.flowLatest;
    }

    // Check target version from npm and local (with timeout)
    if (targetId) {
      const installation = this.targetInstaller.getInstallationInfo(targetId);
      if (installation) {
        // Check latest version from npm
        try {
          const { stdout } = await execAsync(`npm view ${installation.package} version`, {
            timeout: 5000,
          });
          newCache.targetLatest = newCache.targetLatest || {};
          newCache.targetLatest[targetId] = stdout.trim();
        } catch {
          // Keep old cache value
        }

        // Check current installed version (local command)
        try {
          const { stdout } = await execAsync(installation.checkCommand, { timeout: 5000 });
          const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
          if (match) {
            newCache.targetCurrent = newCache.targetCurrent || {};
            newCache.targetCurrent[targetId] = match[1];
          }
        } catch {
          // Keep old cache value
        }
      }
    }

    await this.writeCache(newCache);
  }

  /**
   * Detect which package manager was used to install Flow globally
   * by checking the executable path
   */
  private async detectFlowPackageManager(): Promise<'bun' | 'npm' | 'pnpm' | 'yarn'> {
    try {
      const { stdout } = await execAsync('which flow || where flow');
      const flowPath = stdout.trim().toLowerCase();

      if (flowPath.includes('bun')) {
        return 'bun';
      }
      if (flowPath.includes('pnpm')) {
        return 'pnpm';
      }
      if (flowPath.includes('yarn')) {
        return 'yarn';
      }
    } catch {
      // Fall through to default
    }

    // Default to bun as it's the recommended install method
    return 'bun';
  }

  /**
   * Upgrade Flow to latest version using the package manager that installed it
   * @returns True if upgrade successful, false otherwise
   */
  async upgradeFlow(): Promise<boolean> {
    const spinner = ora('Upgrading Flow...').start();

    try {
      // Detect which package manager was used to install Flow
      const flowPm = await this.detectFlowPackageManager();
      const upgradeCmd = getUpgradeCommand('@sylphx/flow', flowPm);

      if (this.options.verbose) {
        console.log(chalk.dim(`   Using ${flowPm}: ${upgradeCmd}`));
      }

      await execAsync(upgradeCmd);

      spinner.succeed(chalk.green('✓ Flow upgraded (new version used on next run)'));
      return true;
    } catch (error) {
      spinner.fail(chalk.red('✗ Flow upgrade failed'));

      if (this.options.verbose) {
        console.error(error);
      }

      return false;
    }
  }

  /**
   * Upgrade target CLI to latest version
   * Tries built-in upgrade command first, falls back to package manager
   * @param targetId - Target CLI ID to upgrade
   * @returns True if upgrade successful, false otherwise
   */
  async upgradeTarget(targetId: string): Promise<boolean> {
    const installation = this.targetInstaller.getInstallationInfo(targetId);
    if (!installation) {
      return false;
    }

    const packageManager = detectPackageManager(this.projectPath);
    const spinner = ora(`Upgrading ${installation.name}...`).start();

    try {
      // For Claude Code, use built-in update command if available
      if (targetId === 'claude-code') {
        try {
          await execAsync('claude update');
          spinner.succeed(chalk.green(`✓ ${installation.name} upgraded`));
          return true;
        } catch {
          // Fall back to npm upgrade
        }
      }

      // For OpenCode, use built-in upgrade command if available
      if (targetId === 'opencode') {
        try {
          await execAsync('opencode upgrade');
          spinner.succeed(chalk.green(`✓ ${installation.name} upgraded`));
          return true;
        } catch {
          // Fall back to npm upgrade
        }
      }

      // Fall back to npm/bun/pnpm/yarn upgrade
      const upgradeCmd = getUpgradeCommand(installation.package, packageManager);
      await execAsync(upgradeCmd);

      spinner.succeed(chalk.green(`✓ ${installation.name} upgraded`));
      return true;
    } catch (error) {
      spinner.fail(chalk.red(`✗ ${installation.name} upgrade failed`));

      if (this.options.verbose) {
        console.error(error);
      }

      return false;
    }
  }

  /**
   * Run auto-upgrade check and upgrade if needed (silent)
   * @param targetId - Optional target CLI ID to check and upgrade
   * @returns Upgrade result with status info
   */
  async runAutoUpgrade(targetId?: string): Promise<{
    flowUpgraded: boolean;
    flowVersion?: { current: string; latest: string };
    targetUpgraded: boolean;
    targetVersion?: { current: string; latest: string };
  }> {
    const status = await this.checkForUpgrades(targetId);
    const result = {
      flowUpgraded: false,
      flowVersion: status.flowVersion ?? undefined,
      targetUpgraded: false,
      targetVersion: status.targetVersion ?? undefined,
    };

    // Perform upgrades silently
    if (status.flowNeedsUpgrade) {
      result.flowUpgraded = await this.upgradeFlowSilent();
    }

    if (status.targetNeedsUpgrade && targetId) {
      result.targetUpgraded = await this.upgradeTargetSilent(targetId);
    }

    return result;
  }

  /**
   * Upgrade Flow silently (no spinner/output)
   */
  private async upgradeFlowSilent(): Promise<boolean> {
    try {
      const flowPm = await this.detectFlowPackageManager();
      const upgradeCmd = getUpgradeCommand('@sylphx/flow', flowPm);
      await execAsync(upgradeCmd);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upgrade target CLI silently (no spinner/output)
   */
  private async upgradeTargetSilent(targetId: string): Promise<boolean> {
    const installation = this.targetInstaller.getInstallationInfo(targetId);
    if (!installation) {
      return false;
    }

    try {
      if (targetId === 'claude-code') {
        try {
          await execAsync('claude update');
          return true;
        } catch {
          // Fall back to npm
        }
      }

      if (targetId === 'opencode') {
        try {
          await execAsync('opencode upgrade');
          return true;
        } catch {
          // Fall back to npm
        }
      }

      const packageManager = detectPackageManager(this.projectPath);
      const upgradeCmd = getUpgradeCommand(installation.package, packageManager);
      await execAsync(upgradeCmd);
      return true;
    } catch {
      return false;
    }
  }
}
