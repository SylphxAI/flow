/**
 * Status Display Utilities
 * Project status and component information
 */

import chalk from 'chalk';
import type { ProjectState } from '../../core/state-detector.js';
import { isVersionOutdated } from '../version.js';

/**
 * Display project status
 */
export async function showStatus(state: ProjectState): Promise<void> {
  console.log(chalk.cyan.bold('📊 Project Status\n'));

  if (state.initialized) {
    console.log(`  ${chalk.green('✓')} Initialized (Flow v${state.version || 'unknown'})`);

    if (state.target) {
      const versionStr = state.targetVersion ? ` (v${state.targetVersion})` : '';
      console.log(`  ${chalk.green('✓')} Target platform: ${state.target}${versionStr}`);
    }

    // Component status
    const components = state.components;
    console.log(`\n  ${chalk.cyan('Components:')}`);
    console.log(
      `    Agents: ${components.agents.installed ? chalk.green(`✓ ${components.agents.count}`) : chalk.red('✗')}`
    );
    console.log(
      `    Instructions: ${components.instructions.installed ? chalk.green(`✓ ${components.instructions.count}`) : chalk.red('✗')}`
    );
    console.log(`    Hooks: ${components.hooks.installed ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(
      `    MCP: ${components.mcp.installed ? chalk.green(`✓ ${components.mcp.serverCount} servers`) : chalk.red('✗')}`
    );
    console.log(
      `    Output styles: ${components.outputStyles.installed ? chalk.green('✓') : chalk.red('✗')}`
    );
    console.log(
      `    Slash commands: ${components.slashCommands.installed ? chalk.green(`✓ ${components.slashCommands.count}`) : chalk.red('✗')}`
    );

    // Outdated warnings
    if (state.outdated) {
      console.log(
        `\n  ${chalk.yellow('⚠')} Flow version outdated: ${state.version} → ${state.latestVersion}`
      );
    }

    if (
      state.targetVersion &&
      state.targetLatestVersion &&
      isVersionOutdated(state.targetVersion, state.targetLatestVersion)
    ) {
      console.log(
        `  ${chalk.yellow('⚠')} ${state.target} update available: v${state.targetVersion} → v${state.targetLatestVersion}`
      );
    }

    if (state.lastUpdated) {
      const days = Math.floor((Date.now() - state.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 7) {
        console.log(`\n  ${chalk.yellow('⚠')} Last updated: ${days} days ago`);
      }
    }
  } else {
    console.log(`  ${chalk.yellow('⚠  Not initialized')}`);
  }

  console.log('');
}
