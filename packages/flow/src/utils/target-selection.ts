/**
 * Target Selection Utilities
 * Shared logic for target selection UI across settings and execution flows
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import type { TargetInstaller } from '../services/target-installer.js';
import { handlePromptError } from './prompt-helpers.js';

/**
 * Represents a target CLI choice with installation status
 */
export interface TargetChoice {
  /** Display name of the target */
  name: string;
  /** Target identifier */
  value: 'claude-code' | 'opencode';
  /** Whether the target is currently installed */
  installed: boolean;
}

/**
 * Build list of available targets with installation status
 * @param installedTargets - List of currently installed target IDs
 * @returns Array of target choices with installation status
 */
export function buildAvailableTargets(installedTargets: string[]): TargetChoice[] {
  return [
    {
      name: 'Claude Code',
      value: 'claude-code',
      installed: installedTargets.includes('claude-code'),
    },
    {
      name: 'OpenCode',
      value: 'opencode',
      installed: installedTargets.includes('opencode'),
    },
  ];
}

/**
 * Format target choice for display in prompts
 * @param target - Target choice to format
 * @param context - Context where choice is displayed (affects status message)
 * @returns Formatted string with target name and installation status
 */
export function formatTargetChoice(
  target: TargetChoice,
  context: 'execution' | 'settings'
): string {
  const status = target.installed
    ? chalk.green(' ✓ installed')
    : context === 'execution'
      ? chalk.dim(' (will auto-install)')
      : chalk.dim(' (not installed - will auto-install on first use)');

  return `${target.name}${status}`;
}

/**
 * Prompt user to select a target
 * @param installedTargets - List of currently installed target IDs
 * @param message - Prompt message to display
 * @param context - Context where prompt is shown (affects status formatting)
 * @returns Selected target ID
 * @throws {UserCancelledError} If user cancels the prompt
 */
export async function promptForTargetSelection(
  installedTargets: string[],
  message: string,
  context: 'execution' | 'settings'
): Promise<string> {
  const availableTargets = buildAvailableTargets(installedTargets);

  try {
    const { targetId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetId',
        message,
        choices: availableTargets.map((target) => ({
          name: formatTargetChoice(target, context),
          value: target.value,
        })),
      },
    ]);

    return targetId;
  } catch (error) {
    handlePromptError(error, 'Target selection cancelled');
  }
}

/**
 * Prompt for default target with "Ask me every time" option
 * @param installedTargets - List of currently installed target IDs
 * @param currentDefault - Current default target (if any)
 * @returns Selected default target ID or 'ask-every-time'
 * @throws {UserCancelledError} If user cancels the prompt
 */
export async function promptForDefaultTarget(
  installedTargets: string[],
  currentDefault?: string
): Promise<string> {
  const availableTargets = buildAvailableTargets(installedTargets);

  try {
    const { defaultTarget } = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultTarget',
        message: 'Select default target platform:',
        choices: [
          ...availableTargets.map((target) => ({
            name: formatTargetChoice(target, 'settings'),
            value: target.value,
          })),
          new inquirer.Separator(),
          {
            name: 'Ask me every time',
            value: 'ask-every-time',
          },
        ],
        default: currentDefault || 'ask-every-time',
      },
    ]);

    return defaultTarget;
  } catch (error) {
    handlePromptError(error, 'Target selection cancelled');
  }
}

/**
 * Ensure target is installed, auto-installing if needed
 * @param targetId - Target ID to ensure is installed
 * @param targetInstaller - TargetInstaller instance to use
 * @param installedTargets - List of currently installed target IDs
 * @returns True if target is installed (or successfully installed), false otherwise
 */
export async function ensureTargetInstalled(
  targetId: string,
  targetInstaller: TargetInstaller,
  installedTargets: string[]
): Promise<boolean> {
  const installation = targetInstaller.getInstallationInfo(targetId);

  // Already installed - nothing to do
  if (installedTargets.includes(targetId)) {
    return true;
  }

  // Not installed - try to install
  console.log();
  const installed = await targetInstaller.install(targetId, true);

  if (!installed) {
    console.log(chalk.red(`\n✗ Failed to install ${installation?.name}`));
    console.log(chalk.yellow('   Please install manually and try again.\n'));
    return false;
  }

  console.log();
  return true;
}
