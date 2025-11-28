/**
 * Generic checkbox configuration handler
 * Pure functions for settings UI patterns
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

// ============================================================================
// Types
// ============================================================================

export interface ConfigItem {
  enabled: boolean;
}

export type ConfigMap = Record<string, ConfigItem>;

export interface CheckboxConfigOptions<T extends string> {
  /** Section title (e.g., "Agents Configuration") */
  title: string;
  /** Icon for the section (e.g., "🤖") */
  icon: string;
  /** Prompt message (e.g., "Select agents to enable:") */
  message: string;
  /** Available items with display names */
  available: Record<T, string>;
  /** Current config state */
  current: ConfigMap;
  /** Item type name for confirmation (e.g., "agents", "rules") */
  itemType: string;
}

export interface CheckboxConfigResult<T extends string> {
  selected: T[];
  updated: ConfigMap;
}

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Get currently enabled keys from config
 */
export const getEnabledKeys = (config: ConfigMap): string[] =>
  Object.keys(config).filter((key) => config[key]?.enabled);

/**
 * Build checkbox choices from available items
 */
export const buildChoices = <T extends string>(
  available: Record<T, string>,
  enabledKeys: string[]
): Array<{ name: string; value: T; checked: boolean }> =>
  Object.entries(available).map(([key, name]) => ({
    name: name as string,
    value: key as T,
    checked: enabledKeys.includes(key),
  }));

/**
 * Update config based on selection
 * Returns new config object (immutable)
 */
export const updateConfig = <T extends string>(
  available: Record<T, string>,
  selected: T[]
): ConfigMap => {
  const updated: ConfigMap = {};
  for (const key of Object.keys(available)) {
    updated[key] = { enabled: selected.includes(key as T) };
  }
  return updated;
};

/**
 * Print section header
 */
export const printHeader = (icon: string, title: string): void => {
  console.log(chalk.cyan.bold(`\n━━━ ${icon} ${title}\n`));
};

/**
 * Print confirmation message
 */
export const printConfirmation = (itemType: string, count: number): void => {
  console.log(chalk.green(`\n✓ ${itemType} configuration saved`));
  console.log(chalk.dim(`  Enabled ${itemType.toLowerCase()}: ${count}`));
};

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Generic checkbox configuration handler
 * Handles the common pattern of select → update → save
 */
export const handleCheckboxConfig = async <T extends string>(
  options: CheckboxConfigOptions<T>
): Promise<CheckboxConfigResult<T>> => {
  const { title, icon, message, available, current, itemType } = options;

  // Print header
  printHeader(icon, title);

  // Get current enabled items
  const enabledKeys = getEnabledKeys(current);

  // Show checkbox prompt
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message,
      choices: buildChoices(available, enabledKeys),
    },
  ]);

  // Update config
  const updated = updateConfig(available, selected);

  // Print confirmation
  printConfirmation(itemType, selected.length);

  return { selected, updated };
};
