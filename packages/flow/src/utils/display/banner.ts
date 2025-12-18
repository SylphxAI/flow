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
 * Show attach summary: ✓ Attached {n} agents, {n} commands, {n} skills, {n} MCP
 */
export function showAttachSummary(result: {
  joined: boolean;
  agents?: number;
  commands?: number;
  skills?: number;
  mcp?: number;
}): void {
  if (result.joined) {
    // Joining existing session - no summary needed
    return;
  }

  const parts: string[] = [];
  if (result.agents && result.agents > 0) {
    parts.push(`${result.agents} agents`);
  }
  if (result.commands && result.commands > 0) {
    parts.push(`${result.commands} commands`);
  }
  if (result.skills && result.skills > 0) {
    parts.push(`${result.skills} skills`);
  }
  if (result.mcp && result.mcp > 0) {
    parts.push(`${result.mcp} MCP`);
  }

  if (parts.length > 0) {
    console.log(`${chalk.green('✓')} Attached ${parts.join(', ')}`);
  }
}

/**
 * @deprecated Use showHeader instead
 */
export function showWelcome(): void {
  // No-op for backward compatibility during migration
}
