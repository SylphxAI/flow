/**
 * Target Installation Service
 * Auto-detects and installs AI CLI tools (Claude Code, OpenCode, Cursor)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { detectPackageManager, type PackageManager } from '../utils/package-manager-detector.js';
import { UserCancelledError } from '../utils/errors.js';

const execAsync = promisify(exec);

export interface TargetInstallation {
  id: 'claude-code' | 'opencode' | 'cursor';
  name: string;
  package: string;
  checkCommand: string;
  installCommand: (pm: PackageManager) => string;
}

/**
 * Supported target installations
 */
const TARGET_INSTALLATIONS: TargetInstallation[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    package: '@anthropic-ai/claude-code',
    checkCommand: 'claude --version',
    installCommand: (pm: PackageManager) => {
      switch (pm) {
        case 'npm':
          return 'npm install -g @anthropic-ai/claude-code';
        case 'bun':
          return 'bun install -g @anthropic-ai/claude-code';
        case 'pnpm':
          return 'pnpm install -g @anthropic-ai/claude-code';
        case 'yarn':
          return 'yarn global add @anthropic-ai/claude-code';
      }
    },
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    package: 'opencode-ai',
    checkCommand: 'opencode --version',
    installCommand: (pm: PackageManager) => {
      switch (pm) {
        case 'npm':
          return 'npm install -g opencode-ai@latest';
        case 'bun':
          return 'bun install -g opencode-ai@latest';
        case 'pnpm':
          return 'pnpm install -g opencode-ai@latest';
        case 'yarn':
          return 'yarn global add opencode-ai@latest';
      }
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    package: 'cursor',
    checkCommand: 'cursor --version',
    installCommand: () => {
      // Cursor is typically installed via installer, not npm
      return 'Visit https://cursor.sh to download and install';
    },
  },
];

export class TargetInstaller {
  private packageManager: PackageManager;

  constructor(projectPath: string = process.cwd()) {
    this.packageManager = detectPackageManager(projectPath);
  }

  /**
   * Check if a target is installed
   */
  async isInstalled(targetId: string): Promise<boolean> {
    const installation = TARGET_INSTALLATIONS.find((t) => t.id === targetId);
    if (!installation) {
      return false;
    }

    try {
      await execAsync(installation.checkCommand);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect which targets are installed
   */
  async detectInstalledTargets(): Promise<string[]> {
    const installed: string[] = [];

    for (const installation of TARGET_INSTALLATIONS) {
      if (await this.isInstalled(installation.id)) {
        installed.push(installation.id);
      }
    }

    return installed;
  }

  /**
   * Prompt user to select a target to install
   */
  async promptForTargetSelection(): Promise<string> {
    try {
      const { targetId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'targetId',
          message: 'No AI CLI detected. Which would you like to use?',
          choices: TARGET_INSTALLATIONS.map((t) => ({
            name: t.name,
            value: t.id,
          })),
          default: 'claude-code',
        },
      ]);

      return targetId;
    } catch (error: any) {
      // Handle user cancellation (Ctrl+C)
      if (error.name === 'ExitPromptError' || error.message?.includes('force closed')) {
        throw new UserCancelledError('Target selection cancelled');
      }
      throw error;
    }
  }

  /**
   * Install a target CLI
   */
  async install(targetId: string, autoConfirm: boolean = false): Promise<boolean> {
    const installation = TARGET_INSTALLATIONS.find((t) => t.id === targetId);
    if (!installation) {
      console.log(chalk.red(`✗ Unknown target: ${targetId}`));
      return false;
    }

    // Special handling for Cursor (not npm-installable)
    if (targetId === 'cursor') {
      console.log(chalk.yellow('\n⚠️  Cursor requires manual installation'));
      console.log(chalk.cyan('   Visit https://cursor.sh to download and install\n'));
      return false;
    }

    // Confirm installation unless auto-confirm is enabled
    if (!autoConfirm) {
      try {
        const { confirmInstall } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmInstall',
            message: `Install ${installation.name}?`,
            default: true,
          },
        ]);

        if (!confirmInstall) {
          console.log(chalk.yellow('\n⚠️  Installation cancelled\n'));
          return false;
        }
      } catch (error: any) {
        // Handle user cancellation (Ctrl+C)
        if (error.name === 'ExitPromptError' || error.message?.includes('force closed')) {
          throw new UserCancelledError('Installation cancelled');
        }
        throw error;
      }
    }

    const spinner = ora(`Installing ${installation.name}...`).start();

    try {
      const installCmd = installation.installCommand(this.packageManager);
      await execAsync(installCmd);

      spinner.succeed(chalk.green(`✓ ${installation.name} installed successfully`));
      return true;
    } catch (error) {
      spinner.fail(chalk.red(`✗ Failed to install ${installation.name}`));

      const installCmd = installation.installCommand(this.packageManager);
      console.log(chalk.yellow('\n⚠️  Auto-install failed. Please run manually:'));
      console.log(chalk.cyan(`   ${installCmd}\n`));

      return false;
    }
  }

  /**
   * Auto-detect and install if no target is found
   */
  async autoDetectAndInstall(): Promise<string | null> {
    console.log(chalk.cyan('🔍 Detecting installed AI CLIs...\n'));

    const installedTargets = await this.detectInstalledTargets();

    // If we found installed targets, return the first one (priority order)
    if (installedTargets.length > 0) {
      const targetId = installedTargets[0];
      const installation = TARGET_INSTALLATIONS.find((t) => t.id === targetId);
      console.log(chalk.green(`✓ Found ${installation?.name}\n`));
      return targetId;
    }

    // No targets found - prompt user to select one
    console.log(chalk.yellow('⚠️  No AI CLI detected\n'));
    const selectedTargetId = await this.promptForTargetSelection();

    // Try to install the selected target
    console.log();
    const installed = await this.install(selectedTargetId, false);

    if (!installed) {
      return null;
    }

    return selectedTargetId;
  }

  /**
   * Get installation info for a target
   */
  getInstallationInfo(targetId: string): TargetInstallation | undefined {
    return TARGET_INSTALLATIONS.find((t) => t.id === targetId);
  }
}
