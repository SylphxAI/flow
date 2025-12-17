/**
 * Banner Display Utilities
 * Minimal, modern CLI output
 */

import chalk from 'chalk';

/**
 * Show minimal header: flow {version} → {target}
 */
export function showHeader(version: string, target: string): void {
  console.log(`\n${chalk.cyan('flow')} ${chalk.dim(version)} ${chalk.dim('→')} ${target}\n`);
}

/**
 * @deprecated Use showHeader instead
 */
export function showWelcome(): void {
  // No-op for backward compatibility during migration
}
