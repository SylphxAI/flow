/**
 * Flow Commands
 * Entry point for all flow-related CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs/promises';
import { StateDetector } from '../core/state-detector.js';
import { UpgradeManager } from '../core/upgrade-manager.js';
import { showWelcome } from '../utils/display/banner.js';
import { showStatus } from '../utils/display/status.js';
import { executeFlow } from './flow/execute-v2.js';
import type { FlowOptions } from './flow/types.js';

/**
 * Flow command (simplified for attach mode)
 */
export const flowCommand = new Command('flow')
  .description('Run Flow with automatic environment attach')

  // Core options
  .option('--quick', 'Quick mode: skip upgrade checks')
  .option('--agent <name>', 'Agent to use (default: coder)', 'coder')
  .option('--agent-file <path>', 'Load agent from specific file')
  .option('--verbose', 'Show detailed output')
  .option('--dry-run', 'Show what would be done without making changes')
  .option('-p, --print', 'Headless print mode (output only, no interactive)')
  .option('-c, --continue', 'Continue previous conversation (requires print mode)')

  // Prompt argument
  .argument('[prompt]', 'Prompt to execute with agent (optional, supports @file.txt for file input)')

  .action(async (prompt, options: FlowOptions) => {
    await executeFlow(prompt, options);
  });

/**
 * Setup command - deprecated (attach mode is automatic)
 */
export const setupCommand = new Command('setup')
  .description('[DEPRECATED] No longer needed - Flow uses automatic attach mode')
  .action(async () => {
    console.log(chalk.yellow('⚠️  The "setup" command is deprecated.\n'));
    console.log(chalk.cyan('Flow now uses automatic attach mode:'));
    console.log(chalk.dim('   • No installation needed'));
    console.log(chalk.dim('   • Environment attached automatically'));
    console.log(chalk.dim('   • Restored on exit\n'));
    console.log(chalk.green('✨ Just run: sylphx-flow "your prompt"\n'));
  });

/**
 * Status command - show project status
 */
export const statusCommand = new Command('status')
  .description('Show project status and configuration')
  .option('--verbose', 'Show detailed information')
  .action(async (options) => {
    const detector = new StateDetector();
    const state = await detector.detect();

    showWelcome();
    await showStatus(state);

    // Show detailed info if verbose
    if (options.verbose) {
      console.log(chalk.cyan.bold('\n📋 详细信息\n'));

      try {
        const { getProjectSettingsFile } = await import('../config/constants.js');
        const configPath = path.join(process.cwd(), getProjectSettingsFile());
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        console.log('配置文件:', JSON.stringify(config, null, 2));
      } catch {
        console.log('配置文件: 不存在');
      }
    }
  });

/**
 * Doctor command - diagnose and fix issues
 */
export const doctorCommand = new Command('doctor')
  .description('Diagnose and fix common issues')
  .option('--fix', 'Automatically fix issues')
  .option('--verbose', 'Show detailed diagnostics')
  .action(async (options) => {
    console.log(chalk.cyan.bold('🔍 诊断项目\n'));

    const detector = new StateDetector();
    const state = await detector.detect();

    let issuesFound = false;

    // Check 1: Claude Code installation
    console.log('检查 Claude Code 安装...');
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);
      await execAsync('which claude');
      console.log(chalk.green('  ✓ Claude Code 已安装'));
    } catch {
      console.log(chalk.red('  ✗ Claude Code 未安装'));
      console.log(chalk.dim('    运行: npm install -g @anthropic-ai/claude-code'));
      issuesFound = true;
    }

    // Check 2: Configuration
    console.log('\n检查配置...');
    if (state.corrupted) {
      console.log(chalk.red('  ✗ 配置损坏'));
      issuesFound = true;

      if (options.fix) {
        console.log(chalk.yellow('  🔄 正在修复...'));
        await executeFlow(undefined, { sync: true } as FlowOptions);
        console.log(chalk.green('  ✓ 已修复'));
      }
    } else if (!state.initialized) {
      console.log(chalk.yellow('  ⚠ 项目未初始化'));
      issuesFound = true;
    } else {
      console.log(chalk.green('  ✓ 配置正常'));
    }

    // Check 3: Components
    console.log('\n检查组件...');
    Object.entries(state.components).forEach(([name, component]) => {
      const status = component.installed ? chalk.green('✓') : chalk.red('✗');
      const count = ('count' in component && component.count) ? ` (${component.count})` : '';
      console.log(`  ${status} ${name}${count}`);
    });

    // Summary
    console.log('\n' + chalk.bold('结果:'));
    if (!issuesFound) {
      console.log(chalk.green('✓ 所有检查通过'));
    } else if (options.fix) {
      console.log(chalk.green('✓ 所有问题已修复'));
    } else {
      console.log(chalk.yellow('⚠ 发现问题，运行加 --fix 参数自动修复'));
    }
  });

/**
 * Upgrade command - upgrade components
 */
export const upgradeCommand = new Command('upgrade')
  .description('Upgrade Sylphx Flow and components')
  .option('--check', 'Only check for updates, do not upgrade')
  .option('--auto', 'Automatically install updates via npm')
  .option('--components', 'Upgrade components (agents, rules, etc)', true)
  .option('--target', 'Upgrade target platform (Claude Code/OpenCode)')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    console.log(chalk.cyan.bold('📦 Checking for updates\n'));

    const detector = new StateDetector();
    const upgradeManager = new UpgradeManager();

    const updates = await upgradeManager.checkUpdates();

    if (!updates.flowUpdate && !updates.targetUpdate) {
      console.log(chalk.green('✓ All components are up to date\n'));
      return;
    }

    if (updates.flowVersion) {
      console.log(`Sylphx Flow: ${updates.flowVersion.current} → ${chalk.green(updates.flowVersion.latest)}`);
    }

    if (updates.targetVersion) {
      console.log(`${updates.targetVersion.current ? 'claude-code' : 'target'}: ${updates.targetVersion.current} → ${chalk.green(updates.targetVersion.latest)}`);
    }

    // Check only
    if (options.check) {
      console.log('\n' + chalk.dim('Run without --check to upgrade'));
      return;
    }

    // Confirm upgrade
    const { default: inquirer } = await import('inquirer');
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Upgrade to latest version?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.dim('\nUpgrade cancelled'));
      return;
    }

    // Perform upgrade
    console.log('');

    const state = await detector.detect();
    const autoInstall = options.auto || false;

    if (updates.flowUpdate) {
      console.log(chalk.cyan.bold('\n━ Upgrading Sylphx Flow\n'));
      await upgradeManager.upgradeFlow(state, autoInstall);
    }

    if (updates.targetUpdate && options.target) {
      console.log(chalk.cyan.bold('\n━ Upgrading Target\n'));
      await upgradeManager.upgradeTarget(state, autoInstall);
    }

    console.log(chalk.green('\n✓ Upgrade complete\n'));

    if (!autoInstall) {
      console.log(chalk.dim('💡 Tip: Use --auto flag to automatically install updates via npm\n'));
    }
  });
