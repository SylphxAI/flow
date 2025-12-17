/**
 * Auto-Upgrade Service
 * Automatically checks and upgrades Flow and target CLI before each execution
 */

import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import { detectPackageManager, getUpgradeCommand } from '../utils/package-manager-detector.js';
import { TargetInstaller } from './target-installer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
   * Check for available upgrades for Flow and target CLI
   * @param targetId - Optional target CLI ID to check for upgrades
   * @returns Upgrade status indicating what needs upgrading
   */
  async checkForUpgrades(targetId?: string): Promise<UpgradeStatus> {
    const [flowVersion, targetVersion] = await Promise.all([
      this.options.skipFlow ? null : this.checkFlowVersion(),
      this.options.skipTarget || !targetId ? null : this.checkTargetVersion(targetId),
    ]);

    return {
      flowNeedsUpgrade: !!flowVersion,
      targetNeedsUpgrade: !!targetVersion,
      flowVersion,
      targetVersion,
    };
  }

  /**
   * Check Flow version
   */
  private async checkFlowVersion(): Promise<{ current: string; latest: string } | null> {
    try {
      // Get current version from package.json
      const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const currentVersion = packageJson.version;

      // Get latest version from npm
      const { stdout } = await execAsync('npm view @sylphx/flow version');
      const latestVersion = stdout.trim();

      if (currentVersion !== latestVersion) {
        return { current: currentVersion, latest: latestVersion };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check target CLI version
   */
  private async checkTargetVersion(
    targetId: string
  ): Promise<{ current: string; latest: string } | null> {
    const installation = this.targetInstaller.getInstallationInfo(targetId);
    if (!installation) {
      return null;
    }

    try {
      // Get current version
      const { stdout: currentOutput } = await execAsync(installation.checkCommand);
      const currentMatch = currentOutput.match(/v?(\d+\.\d+\.\d+)/);
      if (!currentMatch) {
        return null;
      }
      const currentVersion = currentMatch[1];

      // Get latest version from npm
      const { stdout: latestOutput } = await execAsync(`npm view ${installation.package} version`);
      const latestVersion = latestOutput.trim();

      if (currentVersion !== latestVersion) {
        return { current: currentVersion, latest: latestVersion };
      }

      return null;
    } catch {
      return null;
    }
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
