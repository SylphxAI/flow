/**
 * Execution Logic for Flow Command (V2 - Attach Mode)
 * New execution flow with attach-mode lifecycle
 */

import chalk from 'chalk';
import { FlowExecutor } from '../../core/flow-executor.js';
import { targetManager } from '../../core/target-manager.js';
import { UpgradeManager } from '../../core/upgrade-manager.js';
import { showWelcome } from '../../utils/display/banner.js';
import { loadAgentContent, extractAgentInstructions } from '../run-command.js';
import { CLIError } from '../../utils/error-handler.js';
import type { RunCommandOptions } from '../../types.js';
import type { FlowOptions } from './types.js';
import { resolvePrompt } from './prompt.js';

/**
 * Execute command using target's executeCommand method
 */
async function executeTargetCommand(
  targetId: string,
  systemPrompt: string,
  userPrompt: string,
  options: RunCommandOptions
): Promise<void> {
  const targetOption = targetManager.getTarget(targetId);

  if (targetOption._tag === 'None') {
    throw new CLIError(`Target not found: ${targetId}`, 'TARGET_NOT_FOUND');
  }

  const target = targetOption.value;

  if (!target.isImplemented || !target.executeCommand) {
    throw new CLIError(
      `Target '${targetId}' does not support command execution`,
      'EXECUTION_NOT_SUPPORTED'
    );
  }

  return target.executeCommand(systemPrompt, userPrompt, options);
}

/**
 * Main flow execution with attach mode (V2)
 */
export async function executeFlowV2(
  prompt: string | undefined,
  options: FlowOptions
): Promise<void> {
  const projectPath = process.cwd();

  // Show welcome banner
  showWelcome();

  // Quick mode settings
  if (options.quick) {
    options.useDefaults = true;
    console.log(chalk.cyan('⚡ Quick mode enabled\n'));
  }

  // Create executor
  const executor = new FlowExecutor();
  const projectManager = executor.getProjectManager();

  // Step 1: Check for upgrades (non-intrusive)
  if (!options.quick) {
    const upgradeManager = new UpgradeManager();
    const updates = await upgradeManager.checkUpdates();

    if (updates.flowUpdate || updates.targetUpdate) {
      console.log(
        chalk.yellow('📦 Updates available! Run: sylphx-flow upgrade --auto\n')
      );
    }
  }

  // Step 2: Execute attach mode lifecycle
  try {
    // Attach Flow environment (backup → attach → register cleanup)
    await executor.execute(projectPath, {
      verbose: options.verbose,
      skipBackup: false,
      skipSecrets: false,
    });

    // Step 3: Detect target and load agent
    const projectHash = projectManager.getProjectHash(projectPath);
    const target = await projectManager.detectTarget(projectPath);

    // Map target to targetManager's target IDs
    const targetId = target === 'claude-code' ? 'claude-code' : 'opencode';

    const agent = options.agent || 'coder';

    console.log(chalk.cyan(`🤖 Running agent: ${agent}\n`));

    // Load agent content
    const agentContent = await loadAgentContent(agent, options.agentFile);
    const agentInstructions = extractAgentInstructions(agentContent);
    const systemPrompt = `AGENT INSTRUCTIONS:\n${agentInstructions}`;

    const userPrompt = prompt?.trim() || '';

    // Prepare run options
    const runOptions: RunCommandOptions = {
      target: targetId,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      agent,
      agentFile: options.agentFile,
      prompt,
      print: options.print,
      continue: options.continue,
    };

    // Step 4: Execute command
    await executeTargetCommand(targetId, systemPrompt, userPrompt, runOptions);

    // Step 5: Cleanup (restore environment)
    await executor.cleanup(projectPath);

    console.log(chalk.green('✓ Session complete\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Execution failed:'), error);

    // Ensure cleanup even on error
    try {
      await executor.cleanup(projectPath);
    } catch (cleanupError) {
      console.error(chalk.red('✗ Cleanup failed:'), cleanupError);
    }

    throw error;
  }
}

/**
 * Main flow execution entry point
 */
export async function executeFlow(
  prompt: string | undefined,
  options: FlowOptions
): Promise<void> {
  // Resolve prompt (handle file input)
  const resolvedPrompt = await resolvePrompt(prompt);

  // Use V2 attach mode execution
  await executeFlowV2(resolvedPrompt, options);
}
