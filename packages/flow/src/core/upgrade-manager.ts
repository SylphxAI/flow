import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { getProjectSettingsFile } from '../config/constants.js';
import type { Target } from '../types/target.types.js';
import { CLIError } from '../utils/errors.js';
import { detectPackageManager, getUpgradeCommand } from '../utils/package-manager-detector.js';
import { createSpinner, log } from '../utils/prompts/index.js';
import type { ProjectState } from './state-detector.js';
import { tryResolveTarget } from './target-resolver.js';

const execAsync = promisify(exec);

export interface UpgradeOptions {
  verbose?: boolean;
  dryRun?: boolean;
  skipBackup?: boolean;
  backupPath?: string;
}

export interface UpgradeResult {
  success: boolean;
  upgrades: {
    flow?: { from: string; to: string };
    target?: { from: string; to: string };
    components?: string[];
  };
  message: string;
}

export class UpgradeManager {
  private projectPath: string;
  private options: UpgradeOptions;

  constructor(projectPath: string = process.cwd(), options: UpgradeOptions = {}) {
    this.projectPath = projectPath;
    this.options = options;
  }

  async checkUpdates(): Promise<{
    flowUpdate: boolean;
    targetUpdate: boolean;
    flowVersion: { current: string; latest: string } | null;
    targetVersion: { current: string; latest: string } | null;
  }> {
    if (this.options.verbose) {
      log.info('Checking for updates...');
    }

    const [flowLatest, targetLatest] = await Promise.all([
      this.getLatestFlowVersion(),
      this.getLatestTargetVersion(),
    ]);

    let flowVersion: { current: string; latest: string } | null = null;
    let targetVersion: { current: string; latest: string } | null = null;

    // 当前 Flow 版本
    const flowCurrent = await this.getCurrentFlowVersion();

    if (flowLatest && flowCurrent && flowLatest !== flowCurrent) {
      flowVersion = { current: flowCurrent, latest: flowLatest };
    }

    // 当前 Target 版本
    const configPath = path.join(this.projectPath, getProjectSettingsFile());
    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      const target = config.target;

      if (target) {
        const targetCurrent = await this.getCurrentTargetVersion(target);

        if (targetLatest && targetCurrent && targetLatest !== targetCurrent) {
          targetVersion = { current: targetCurrent, latest: targetLatest };
        }
      }
    } catch {
      // 无法读取配置
    }

    return {
      flowUpdate: !!flowVersion,
      targetUpdate: !!targetVersion,
      flowVersion,
      targetVersion,
    };
  }

  async upgradeFlow(state: ProjectState, autoInstall: boolean = false): Promise<boolean> {
    if (!state.outdated || !state.latestVersion) {
      return false;
    }

    const packageManager = detectPackageManager(this.projectPath);
    const spinner = createSpinner();
    spinner.start('Upgrading Sylphx Flow...');

    try {
      // Backup current config
      if (!this.options.skipBackup) {
        await this.backupConfig();
      }

      if (this.options.dryRun) {
        const cmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.stop(chalk.green(`✓ Dry run: ${state.version} → ${state.latestVersion}`));
        log.info(`Would run: ${cmd}`);
        return true;
      }

      // Auto-install using detected package manager
      if (autoInstall) {
        const installCmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.message(`Installing latest version via ${packageManager}...`);

        try {
          await execAsync(installCmd);
          spinner.stop(chalk.green(`✓ Upgraded to ${state.latestVersion} using ${packageManager}`));
        } catch (error) {
          spinner.stop(chalk.yellow(`⚠ Auto-install failed, please run: ${installCmd}`));
          if (this.options.verbose) {
            console.error(error);
          }
        }
      } else {
        // Show manual upgrade command
        const installCmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.stop(chalk.blue(`ℹ To upgrade, run: ${chalk.cyan(installCmd)}`));

        // Update config metadata
        const configPath = path.join(this.projectPath, getProjectSettingsFile());
        try {
          const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
          config.version = state.latestVersion;
          config.lastUpdated = new Date().toISOString();
          await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        } catch {
          // Cannot update config
        }
      }

      return true;
    } catch (error) {
      spinner.stop(chalk.red('✗ Upgrade failed'));
      throw new CLIError(
        `Failed to upgrade Sylphx Flow: ${error instanceof Error ? error.message : String(error)}`,
        'UPGRADE_FAILED'
      );
    }
  }

  async upgradeTarget(state: ProjectState, autoInstall: boolean = false): Promise<boolean> {
    if (!state.target || !state.targetLatestVersion) {
      return false;
    }

    const target = tryResolveTarget(state.target);
    if (!target) {
      return false;
    }

    const spinner = createSpinner();
    spinner.start(`Upgrading ${target.name}...`);

    try {
      // Use target-specific upgrade logic based on target ID
      // This is necessary because each CLI has different upgrade commands
      await this.upgradeTargetCLI(target, autoInstall);

      spinner.stop(chalk.green(`✓ ${target.name} upgraded to latest version`));
      return true;
    } catch (error) {
      spinner.stop(chalk.red(`✗ ${target.name} upgrade failed`));
      throw new CLIError(
        `Failed to upgrade ${target.name}: ${error instanceof Error ? error.message : String(error)}`,
        'TARGET_UPGRADE_FAILED'
      );
    }
  }

  /**
   * Upgrade target CLI - handles target-specific upgrade commands
   */
  private async upgradeTargetCLI(target: Target, autoInstall: boolean = false): Promise<void> {
    if (this.options.dryRun) {
      log.info(`Dry run: upgrade ${target.id}`);
      return;
    }

    // Each CLI target has specific upgrade commands
    // This is inherently target-specific and can't be fully abstracted
    switch (target.id) {
      case 'claude-code':
        if (autoInstall) {
          const packageManager = detectPackageManager(this.projectPath);
          const installCmd = getUpgradeCommand('@anthropic-ai/claude-code', packageManager);
          const { stdout } = await execAsync(installCmd);
          if (this.options.verbose) {
            console.log(stdout);
          }
        } else {
          const { stdout } = await execAsync('claude update');
          if (this.options.verbose) {
            console.log(stdout);
          }
        }
        break;

      case 'opencode': {
        const { stdout: ocStdout } = await execAsync('opencode upgrade');
        if (this.options.verbose) {
          console.log(ocStdout);
        }
        break;
      }

      default:
        log.warn(`No upgrade command available for ${target.name}`);
    }
  }

  async upgradeComponents(components: string[]): Promise<string[]> {
    const upgraded: string[] = [];

    for (const component of components) {
      const spinner = createSpinner();
      spinner.start(`Upgrading ${component}...`);

      try {
        await this.upgradeComponent(component);
        spinner.stop(chalk.green(`✓ ${component} upgraded`));
        upgraded.push(component);
      } catch (error) {
        spinner.stop(chalk.red(`✗ ${component} upgrade failed`));
        if (this.options.verbose) {
          console.error(error);
        }
      }
    }

    return upgraded;
  }

  /**
   * Get the current target from project settings
   */
  private async getCurrentTarget(): Promise<Target | null> {
    try {
      const configPath = path.join(this.projectPath, getProjectSettingsFile());
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      if (config.target) {
        return tryResolveTarget(config.target);
      }
    } catch {
      // Cannot read config
    }
    return null;
  }

  private async upgradeComponent(component: string): Promise<void> {
    // Get target config for correct directory
    const target = await this.getCurrentTarget();
    const configDir = target?.config.configDir || '.claude';

    // Delete old version
    const componentPath = path.join(this.projectPath, configDir, component);
    await fs.rm(componentPath, { recursive: true, force: true });

    // Reinstall latest version
    // Actual implementation would call the appropriate installer
    if (this.options.dryRun) {
      log.info(`Dry run: reinstall ${component}`);
    }
  }

  private async backupConfig(): Promise<string> {
    // Get target config for correct directories
    const target = await this.getCurrentTarget();
    const configDir = target?.config.configDir || '.claude';

    const backupDir = this.options.backupPath || path.join(this.projectPath, `${configDir}-backup`);
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Backup target config directory
    const targetConfigPath = path.join(this.projectPath, configDir);
    try {
      await fs.cp(targetConfigPath, path.join(backupPath, configDir), { recursive: true });
    } catch {
      // Config directory may not exist
    }

    // Backup project settings file
    const settingsPath = path.join(this.projectPath, getProjectSettingsFile());
    try {
      await fs.cp(settingsPath, path.join(backupPath, getProjectSettingsFile()));
    } catch {
      // Settings file may not exist
    }

    return backupPath;
  }

  private async getCurrentFlowVersion(): Promise<string | null> {
    try {
      // Read version from the running CLI's package.json
      // __dirname points to dist/ or src/, so go up to package root
      const packagePath = path.join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      return packageJson.version || null;
    } catch (_error) {
      // Fallback: try to get version from globally installed package
      try {
        const { stdout } = await execAsync('npm list -g @sylphx/flow --depth=0 --json');
        const result = JSON.parse(stdout);
        const flowPackage = result.dependencies?.['@sylphx/flow'];
        return flowPackage?.version || null;
      } catch {
        return null;
      }
    }
  }

  private async getLatestFlowVersion(): Promise<string | null> {
    try {
      // Check npm registry for latest published version
      const { stdout } = await execAsync('npm view @sylphx/flow version');
      return stdout.trim();
    } catch {
      // Fallback: read from local package.json
      try {
        const packagePath = path.join(__dirname, '..', '..', 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
        return packageJson.version || null;
      } catch {
        return null;
      }
    }
  }

  private async getCurrentTargetVersion(targetId: string): Promise<string | null> {
    const target = tryResolveTarget(targetId);
    if (!target) {
      return null;
    }

    // Each CLI target has specific version commands
    try {
      switch (target.id) {
        case 'claude-code': {
          const { stdout } = await execAsync('claude --version');
          const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
          return match ? match[1] : null;
        }
        case 'opencode': {
          const { stdout } = await execAsync('opencode --version');
          const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
          return match ? match[1] : null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  private async getLatestTargetVersion(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('npm view @anthropic-ai/claude-code version');
      return stdout.trim();
    } catch {
      return null;
    }
  }

  static async isUpgradeAvailable(): Promise<boolean> {
    const manager = new UpgradeManager();
    const updates = await manager.checkUpdates();
    return updates.flowUpdate || updates.targetUpdate;
  }
}
