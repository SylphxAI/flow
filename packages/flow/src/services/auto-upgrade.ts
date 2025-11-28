/**
 * Auto-Upgrade Service
 * Automatically checks and upgrades Flow and target CLI before each execution
 */

import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import { detectPackageManager, getUpgradeCommand } from '../utils/package-manager-detector.js';
import { TargetInstaller } from './target-installer.js';

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
   * Upgrade Flow to latest version using detected package manager
   * @returns True if upgrade successful, false otherwise
   */
  async upgradeFlow(): Promise<boolean> {
    const packageManager = detectPackageManager(this.projectPath);
    const spinner = ora('Upgrading Flow...').start();

    try {
      const upgradeCmd = getUpgradeCommand('@sylphx/flow', packageManager);
      await execAsync(upgradeCmd);

      spinner.succeed(chalk.green('✓ Flow upgraded to latest version'));
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
   * Run auto-upgrade check and upgrade if needed
   * Shows upgrade status and performs upgrades automatically
   * @param targetId - Optional target CLI ID to check and upgrade
   */
  async runAutoUpgrade(targetId?: string): Promise<void> {
    console.log(chalk.cyan('🔄 Checking for updates...\n'));

    const status = await this.checkForUpgrades(targetId);

    // Show upgrade status
    if (status.flowNeedsUpgrade && status.flowVersion) {
      console.log(
        chalk.yellow(
          `📦 Flow update available: ${status.flowVersion.current} → ${status.flowVersion.latest}`
        )
      );
    } else if (!this.options.skipFlow) {
      console.log(chalk.green('✓ Flow is up to date'));
    }

    if (status.targetNeedsUpgrade && status.targetVersion && targetId) {
      const installation = this.targetInstaller.getInstallationInfo(targetId);
      console.log(
        chalk.yellow(
          `📦 ${installation?.name} update available: ${status.targetVersion.current} → ${status.targetVersion.latest}`
        )
      );
    } else if (!this.options.skipTarget && targetId) {
      const installation = this.targetInstaller.getInstallationInfo(targetId);
      console.log(chalk.green(`✓ ${installation?.name} is up to date`));
    }

    // Perform upgrades if needed
    if (status.flowNeedsUpgrade || status.targetNeedsUpgrade) {
      console.log(chalk.cyan('\n📦 Installing updates...\n'));

      if (status.flowNeedsUpgrade && !process.env.SYLPHX_FLOW_UPGRADED) {
        const upgraded = await this.upgradeFlow();
        if (upgraded) {
          // Re-exec the process to use the new version
          console.log(chalk.cyan('\n🔄 Restarting with updated version...\n'));
          const { spawn } = await import('node:child_process');
          const child = spawn(process.argv[0], process.argv.slice(1), {
            stdio: 'inherit',
            env: { ...process.env, SYLPHX_FLOW_UPGRADED: '1' },
          });
          child.on('exit', (code) => process.exit(code ?? 0));
          return; // Don't continue with old code
        }
      }

      if (status.targetNeedsUpgrade && targetId) {
        await this.upgradeTarget(targetId);
      }

      console.log(chalk.green('\n✓ All tools upgraded\n'));
    } else {
      console.log();
    }
  }
}
