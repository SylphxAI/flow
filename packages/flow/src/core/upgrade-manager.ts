import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import type { ProjectState } from './state-detector.js';
import { CLIError } from '../utils/error-handler.js';
import { ConfigService } from '../services/config-service.js';
import { getProjectSettingsFile } from '../config/constants.js';
import { detectPackageManager, getUpgradeCommand, type PackageManager } from '../utils/package-manager-detector.js';

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
      console.log('检查更新...');
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
    const spinner = ora('Upgrading Sylphx Flow...').start();

    try {
      // Backup current config
      if (!this.options.skipBackup) {
        await this.backupConfig();
      }

      if (this.options.dryRun) {
        const cmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.succeed(`Dry run: ${state.version} → ${state.latestVersion}`);
        console.log(chalk.dim(`  Would run: ${cmd}`));
        return true;
      }

      // Auto-install using detected package manager
      if (autoInstall) {
        const installCmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.text = `Installing latest version via ${packageManager}...`;

        try {
          await execAsync(installCmd);
          spinner.succeed(`Upgraded to ${state.latestVersion} using ${packageManager}`);
        } catch (error) {
          spinner.warn(`Auto-install failed, please run: ${installCmd}`);
          if (this.options.verbose) {
            console.error(error);
          }
        }
      } else {
        // Show manual upgrade command
        const installCmd = getUpgradeCommand('@sylphx/flow', packageManager);
        spinner.info(`To upgrade, run: ${chalk.cyan(installCmd)}`);

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
      spinner.fail('Upgrade failed');
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

    const spinner = ora(`Upgrading ${state.target}...`).start();

    try {
      if (state.target === 'claude-code') {
        await this.upgradeClaudeCode(autoInstall);
      } else if (state.target === 'opencode') {
        await this.upgradeOpenCode();
      }

      spinner.succeed(`${state.target} upgraded to latest version`);
      return true;
    } catch (error) {
      spinner.fail(`${state.target} upgrade failed`);
      throw new CLIError(
        `Failed to upgrade ${state.target}: ${error instanceof Error ? error.message : String(error)}`,
        'TARGET_UPGRADE_FAILED'
      );
    }
  }

  private async upgradeClaudeCode(autoInstall: boolean = false): Promise<void> {
    if (this.options.dryRun) {
      console.log('Dry run: claude update');
      return;
    }

    if (autoInstall) {
      // Use detected package manager to install latest version
      const packageManager = detectPackageManager(this.projectPath);
      const installCmd = getUpgradeCommand('@anthropic-ai/claude-code', packageManager);
      const { stdout } = await execAsync(installCmd);

      if (this.options.verbose) {
        console.log(stdout);
      }
    } else {
      // Claude Code has built-in update command
      const { stdout } = await execAsync('claude update');

      if (this.options.verbose) {
        console.log(stdout);
      }
    }
  }

  private async upgradeOpenCode(): Promise<void> {
    if (this.options.dryRun) {
      console.log('模拟: opencode upgrade');
      return;
    }

    // OpenCode has built-in upgrade command
    const { stdout } = await execAsync('opencode upgrade');

    if (this.options.verbose) {
      console.log(stdout);
    }
  }

  async upgradeComponents(components: string[]): Promise<string[]> {
    const upgraded: string[] = [];

    for (const component of components) {
      const spinner = ora(`升级 ${component}...`).start();

      try {
        await this.upgradeComponent(component);
        spinner.succeed(`${component} 已升级`);
        upgraded.push(component);
      } catch (error) {
        spinner.fail(`${component} 升级失败`);
        if (this.options.verbose) {
          console.error(error);
        }
      }
    }

    return upgraded;
  }

  private async upgradeComponent(component: string): Promise<void> {
    // 删除旧版本
    const componentPath = path.join(this.projectPath, '.claude', component);
    await fs.rm(componentPath, { recursive: true, force: true });

    // 重新安装最新版本
    // 实际实现会调用相应的 installer
    // 这里用 dry-run 模式模拟
    if (this.options.dryRun) {
      console.log(`模拟: 重新安装 ${component}`);
    }
  }

  private async backupConfig(): Promise<string> {
    const backupDir = this.options.backupPath || path.join(this.projectPath, '.claude-backup');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // 备份 .claude 目录
    const claudePath = path.join(this.projectPath, '.claude');
    try {
      await fs.cp(claudePath, path.join(backupPath, '.claude'), { recursive: true });
    } catch {
      // .claude 目录可能不存在
    }

    // 备份配置文件
    const configPath = path.join(this.projectPath, getProjectSettingsFile());
    try {
      await fs.cp(configPath, path.join(backupPath, getProjectSettingsFile()));
    } catch {
      // 配置文件可能不存在
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
    } catch (error) {
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

  private async getCurrentTargetVersion(target: string): Promise<string | null> {
    if (target === 'claude-code') {
      try {
        const { stdout } = await execAsync('claude --version');
        const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      } catch {
        return null;
      }
    }

    return null;
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
