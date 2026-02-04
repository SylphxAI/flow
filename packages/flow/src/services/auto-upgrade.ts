/**
 * Auto-Upgrade Service
 * Non-blocking version check with cache
 * Only manages Flow updates - target CLIs manage their own updates
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
import { getUpgradeCommand } from '../utils/package-manager-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version info file (stores last background check result)
const VERSION_FILE = path.join(os.homedir(), '.sylphx-flow', 'versions.json');

// Default interval: 30 minutes
const DEFAULT_CHECK_INTERVAL_MS = 30 * 60 * 1000;

interface VersionInfo {
  flowLatest?: string;
}

const execAsync = promisify(exec);

export interface UpgradeStatus {
  flowNeedsUpgrade: boolean;
  flowVersion: { current: string; latest: string } | null;
}

export interface AutoUpgradeOptions {
  verbose?: boolean;
}

export class AutoUpgrade {
  private options: AutoUpgradeOptions;
  private periodicCheckInterval: NodeJS.Timeout | null = null;

  constructor(options: AutoUpgradeOptions = {}) {
    this.options = options;
  }

  /**
   * Read version info from last background check
   */
  private async readVersionInfo(): Promise<VersionInfo | null> {
    try {
      if (!existsSync(VERSION_FILE)) {
        return null;
      }
      const data = await fs.readFile(VERSION_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Write version info
   */
  private async writeVersionInfo(info: VersionInfo): Promise<void> {
    try {
      const dir = path.dirname(VERSION_FILE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(VERSION_FILE, JSON.stringify(info, null, 2));
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
   * Check for available upgrades (instant, reads from last background check)
   * Background check runs every time for fresh data next run
   */
  async checkForUpgrades(): Promise<UpgradeStatus> {
    const info = await this.readVersionInfo();
    const currentVersion = await this.getCurrentFlowVersion();

    // Trigger background check for next run (non-blocking, every time)
    this.checkInBackground();

    // No previous check = no upgrade info yet
    if (!info) {
      return {
        flowNeedsUpgrade: false,
        flowVersion: null,
      };
    }

    // Check if Flow needs upgrade
    const flowVersion =
      info.flowLatest && info.flowLatest !== currentVersion
        ? { current: currentVersion, latest: info.flowLatest }
        : null;

    return {
      flowNeedsUpgrade: !!flowVersion,
      flowVersion,
    };
  }

  /**
   * Check versions in background (non-blocking)
   * Runs every time, updates info for next run
   */
  private checkInBackground(): void {
    // Fire and forget - don't await
    this.performBackgroundCheck().catch(() => {
      // Silent fail
    });
  }

  /**
   * Perform the actual version check (called in background)
   */
  private async performBackgroundCheck(): Promise<void> {
    const oldInfo = await this.readVersionInfo();
    const newInfo: VersionInfo = {};

    // Check Flow version from npm (with timeout)
    try {
      const { stdout } = await execAsync('npm view @sylphx/flow version', { timeout: 5000 });
      newInfo.flowLatest = stdout.trim();
    } catch {
      // Keep old value if check fails
      newInfo.flowLatest = oldInfo?.flowLatest;
    }

    await this.writeVersionInfo(newInfo);
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
   * Run auto-upgrade check and upgrade if needed (silent)
   * @returns Upgrade result with status info
   */
  async runAutoUpgrade(): Promise<{
    flowUpgraded: boolean;
    flowVersion?: { current: string; latest: string };
  }> {
    const status = await this.checkForUpgrades();
    const result = {
      flowUpgraded: false,
      flowVersion: status.flowVersion ?? undefined,
    };

    // Perform upgrade silently
    if (status.flowNeedsUpgrade) {
      result.flowUpgraded = await this.upgradeFlowSilent();
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
   * Start periodic background checks for updates
   * Runs every intervalMs (default 30 minutes)
   * Silently upgrades if updates are available
   * @param intervalMs - Check interval in milliseconds (default 30 minutes)
   */
  startPeriodicCheck(intervalMs: number = DEFAULT_CHECK_INTERVAL_MS): void {
    // Clear any existing interval
    this.stopPeriodicCheck();

    // Start periodic check
    this.periodicCheckInterval = setInterval(() => {
      this.performPeriodicUpgrade().catch(() => {
        // Silent fail
      });
    }, intervalMs);

    // Don't prevent process from exiting
    this.periodicCheckInterval.unref();
  }

  /**
   * Stop periodic background checks
   */
  stopPeriodicCheck(): void {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      this.periodicCheckInterval = null;
    }
  }

  /**
   * Perform periodic upgrade check and silent upgrade
   */
  private async performPeriodicUpgrade(): Promise<void> {
    // Perform background check first (updates version info)
    await this.performBackgroundCheck();

    // Read the fresh version info
    const info = await this.readVersionInfo();
    if (!info) return;

    const currentVersion = await this.getCurrentFlowVersion();

    // Silently upgrade Flow if needed
    if (info.flowLatest && info.flowLatest !== currentVersion) {
      await this.upgradeFlowSilent();
    }
  }
}
