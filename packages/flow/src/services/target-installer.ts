/**
 * Target Installation Service
 * Auto-detects and installs AI CLI tools (Claude Code, OpenCode)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { detectPackageManager, type PackageManager } from '../utils/package-manager-detector.js';
import { createSpinner, log, promptConfirm, promptSelect } from '../utils/prompts/index.js';

const execAsync = promisify(exec);

export interface TargetInstallation {
  id: 'claude-code' | 'opencode';
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
];

export class TargetInstaller {
  private packageManager: PackageManager;

  constructor(projectPath: string = process.cwd()) {
    this.packageManager = detectPackageManager(projectPath);
  }

  /**
   * Check if a target CLI is installed
   * @param targetId - Target ID to check
   * @returns True if installed, false otherwise
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
   * Detect which target CLIs are currently installed
   * @returns Array of installed target IDs
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
   * @returns Selected target ID
   * @throws {UserCancelledError} If user cancels the prompt
   */
  async promptForTargetSelection(): Promise<string> {
    return promptSelect({
      message: 'No AI CLI detected. Which would you like to use?',
      options: TARGET_INSTALLATIONS.map((t) => ({
        label: t.name,
        value: t.id,
      })),
      initialValue: 'claude-code',
    });
  }

  /**
   * Install a target CLI using detected package manager
   * @param targetId - Target ID to install
   * @param autoConfirm - Skip confirmation prompt if true
   * @returns True if installation successful, false otherwise
   * @throws {UserCancelledError} If user cancels installation
   */
  async install(targetId: string, autoConfirm: boolean = false): Promise<boolean> {
    const installation = TARGET_INSTALLATIONS.find((t) => t.id === targetId);
    if (!installation) {
      log.error(`Unknown target: ${targetId}`);
      return false;
    }

    // Confirm installation unless auto-confirm is enabled
    if (!autoConfirm) {
      const confirmInstall = await promptConfirm({
        message: `Install ${installation.name}?`,
        initialValue: true,
      });

      if (!confirmInstall) {
        log.warn('Installation cancelled');
        return false;
      }
    }

    const spinner = createSpinner();
    spinner.start(`Installing ${installation.name}...`);

    try {
      const installCmd = installation.installCommand(this.packageManager);
      await execAsync(installCmd);

      spinner.stop(chalk.green(`✓ ${installation.name} installed successfully`));
      return true;
    } catch (_error) {
      const installCmd = installation.installCommand(this.packageManager);
      spinner.stop(chalk.red(`✗ Failed to install ${installation.name}`));

      log.warn('Auto-install failed. Please run manually:');
      log.info(`  ${chalk.cyan(installCmd)}`);

      return false;
    }
  }

  /**
   * Auto-detect installed targets or prompt to install one
   * @returns Target ID if found or installed, null if installation failed
   * @throws {UserCancelledError} If user cancels selection or installation
   */
  async autoDetectAndInstall(): Promise<string | null> {
    log.info('Detecting installed AI CLIs...');

    const installedTargets = await this.detectInstalledTargets();

    // If we found installed targets, return the first one (priority order)
    if (installedTargets.length > 0) {
      const targetId = installedTargets[0];
      const installation = TARGET_INSTALLATIONS.find((t) => t.id === targetId);
      log.success(`Found ${installation?.name}`);
      return targetId;
    }

    // No targets found - prompt user to select one
    log.warn('No AI CLI detected');
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
   * Get installation metadata for a target
   * @param targetId - Target ID to get info for
   * @returns Installation info or undefined if target not found
   */
  getInstallationInfo(targetId: string): TargetInstallation | undefined {
    return TARGET_INSTALLATIONS.find((t) => t.id === targetId);
  }
}
