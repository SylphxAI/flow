/**
 * Execution Logic for Flow Command (V2 - Attach Mode)
 * New execution flow with attach-mode lifecycle
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { FlowExecutor } from '../../core/flow-executor.js';
import { targetManager } from '../../core/target-manager.js';
import { UpgradeManager } from '../../core/upgrade-manager.js';
import { showWelcome } from '../../utils/display/banner.js';
import { loadAgentContent, extractAgentInstructions } from '../run-command.js';
import { CLIError } from '../../utils/error-handler.js';
import type { RunCommandOptions } from '../../types.js';
import type { FlowOptions } from './types.js';
import { resolvePrompt } from './prompt.js';
import { GlobalConfigService } from '../../services/global-config.js';
import { UserCancelledError } from '../../utils/errors.js';
import { TargetInstaller } from '../../services/target-installer.js';
import { AutoUpgrade } from '../../services/auto-upgrade.js';

/**
 * Select and configure provider for Claude Code
 */
async function selectProvider(
  configService: GlobalConfigService
): Promise<void> {
  try {
    const providerConfig = await configService.loadProviderConfig();
    const defaultProvider = providerConfig.claudeCode.defaultProvider;

  // If not "ask-every-time", use the default provider
  if (defaultProvider !== 'ask-every-time') {
    // Configure environment variables for the selected provider
    if (defaultProvider === 'kimi' || defaultProvider === 'zai') {
      const provider = providerConfig.claudeCode.providers[defaultProvider];
      if (provider?.apiKey) {
        if (defaultProvider === 'kimi') {
          process.env.ANTHROPIC_BASE_URL = 'https://api.moonshot.cn/v1';
          process.env.ANTHROPIC_API_KEY = provider.apiKey;
        } else if (defaultProvider === 'zai') {
          process.env.ANTHROPIC_BASE_URL = 'https://api.z.ai/v1';
          process.env.ANTHROPIC_API_KEY = provider.apiKey;
        }
      }
    }
    return;
  }

  // Ask user which provider to use for this session
  const { selectedProvider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedProvider',
      message: 'Select provider for this session:',
      choices: [
        { name: 'Default (Claude Code built-in)', value: 'default' },
        { name: 'Kimi', value: 'kimi' },
        { name: 'Z.ai', value: 'zai' },
      ],
      default: 'default',
    },
  ]);

  // Configure environment variables based on selection
  if (selectedProvider === 'kimi' || selectedProvider === 'zai') {
    const provider = providerConfig.claudeCode.providers[selectedProvider];

    if (!provider?.apiKey) {
      console.log(chalk.yellow('⚠ API key not configured. Use: sylphx-flow settings\n'));
      return;
    }

    if (selectedProvider === 'kimi') {
      process.env.ANTHROPIC_BASE_URL = 'https://api.moonshot.cn/v1';
      process.env.ANTHROPIC_API_KEY = provider.apiKey;
      console.log(chalk.green('✓ Using Kimi provider\n'));
    } else if (selectedProvider === 'zai') {
      process.env.ANTHROPIC_BASE_URL = 'https://api.z.ai/v1';
      process.env.ANTHROPIC_API_KEY = provider.apiKey;
      console.log(chalk.green('✓ Using Z.ai provider\n'));
    }
  } else {
    console.log(chalk.green('✓ Using default Claude Code provider\n'));
  }
  } catch (error: any) {
    // Handle user cancellation (Ctrl+C)
    if (error.name === 'ExitPromptError' || error.message?.includes('force closed')) {
      throw new UserCancelledError('Provider selection cancelled');
    }
    throw error;
  }
}

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

  // Initialize config service early to check for saved preferences
  const configService = new GlobalConfigService();
  await configService.initialize();

  // Step 1: Determine target
  const targetInstaller = new TargetInstaller(projectPath);
  const installedTargets = await targetInstaller.detectInstalledTargets();
  const settings = await configService.loadSettings();

  let selectedTargetId: string | null = null;

  // If settings has a default target, ALWAYS use it (never fallback to auto-detection)
  if (settings.defaultTarget) {
    selectedTargetId = settings.defaultTarget;
    const installation = targetInstaller.getInstallationInfo(selectedTargetId);

    // Check if the preferred target is installed
    if (installedTargets.includes(selectedTargetId)) {
      console.log(chalk.green(`✓ Using ${installation?.name} (from settings)\n`));
    } else {
      // Preferred target not installed - try to install it
      console.log(chalk.yellow(`⚠️  ${installation?.name} is set as default but not installed\n`));
      const installed = await targetInstaller.install(selectedTargetId, true);

      if (!installed) {
        // Installation failed - show error and exit
        console.log(chalk.red(`\n✗ Cannot proceed: ${installation?.name} is not installed and auto-install failed`));
        console.log(chalk.yellow('   Please either:'));
        console.log(chalk.cyan('   1. Install manually (see instructions above)'));
        console.log(chalk.cyan('   2. Change default target: sylphx-flow settings\n'));
        process.exit(1);
      }

      console.log();
    }
  } else {
    // No settings preference - use auto-detection
    if (installedTargets.length > 0) {
      // Auto-detect first installed target
      selectedTargetId = installedTargets[0];
      const installation = targetInstaller.getInstallationInfo(selectedTargetId);
      console.log(chalk.green(`✓ Using ${installation?.name} (auto-detected)\n`));
    } else {
      // No target installed - prompt user to select and install
      selectedTargetId = await targetInstaller.autoDetectAndInstall();

      if (!selectedTargetId) {
        console.log(chalk.red('✗ No AI CLI installed. Please install one manually.\n'));
        process.exit(1);
      }
    }
  }

  // Step 2: Auto-upgrade Flow and target CLI
  const autoUpgrade = new AutoUpgrade(projectPath);
  await autoUpgrade.runAutoUpgrade(selectedTargetId);

  // Mode info
  if (options.merge) {
    console.log(chalk.cyan('🔗 Merge mode: Flow settings will be merged with your existing settings'));
    console.log(chalk.dim('   Settings will be restored after execution\n'));
  } else {
    console.log(chalk.yellow('🔄 Replace mode (default): All settings will use Flow configuration'));
    console.log(chalk.dim('   Use --merge to keep your existing settings\n'));
  }

  // Create executor
  const executor = new FlowExecutor();
  const projectManager = executor.getProjectManager();

  // Step 2: Execute attach mode lifecycle
  try {
    // Attach Flow environment (backup → attach → register cleanup)
    await executor.execute(projectPath, {
      verbose: options.verbose,
      skipBackup: false,
      skipSecrets: false,
      merge: options.merge || false,
    });

    // Step 3: Detect target and load agent
    const projectHash = projectManager.getProjectHash(projectPath);
    const target = await projectManager.detectTarget(projectPath);

    // Map target to targetManager's target IDs
    const targetId = target === 'claude-code' ? 'claude-code' : 'opencode';

    // Step 3.5: Provider selection (Claude Code only)
    if (targetId === 'claude-code') {
      await selectProvider(configService);
    }

    // Step 3.6: Load Flow settings and determine agent to use
    const settings = await configService.loadSettings();
    const flowConfig = await configService.loadFlowConfig();

    // Determine which agent to use (CLI option > settings default > 'coder')
    const agent = options.agent || settings.defaultAgent || 'coder';

    // Check if agent is enabled
    if (!flowConfig.agents[agent]?.enabled) {
      console.log(chalk.yellow(`⚠️  Agent '${agent}' is not enabled in settings`));
      console.log(chalk.yellow(`   Enable it with: sylphx-flow settings`));
      console.log(chalk.yellow(`   Using 'coder' agent instead\n`));
      // Fallback to first enabled agent or coder
      const enabledAgents = await configService.getEnabledAgents();
      const fallbackAgent = enabledAgents.length > 0 ? enabledAgents[0] : 'coder';
      options.agent = fallbackAgent;
    }

    console.log(chalk.cyan(`🤖 Running agent: ${agent}\n`));

    // Load enabled rules and output styles from config
    const enabledRules = await configService.getEnabledRules();
    const enabledOutputStyles = await configService.getEnabledOutputStyles();

    console.log(chalk.dim(`   Enabled rules: ${enabledRules.join(', ')}`));
    console.log(chalk.dim(`   Enabled output styles: ${enabledOutputStyles.join(', ')}\n`));

    // Load agent content with only enabled rules and styles
    const agentContent = await loadAgentContent(
      agent,
      options.agentFile,
      enabledRules,
      enabledOutputStyles
    );
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
    // Handle user cancellation gracefully
    if (error instanceof UserCancelledError) {
      console.log(chalk.yellow('\n⚠️  Operation cancelled by user'));
      try {
        await executor.cleanup(projectPath);
        console.log(chalk.green('   ✓ Settings restored\n'));
      } catch (cleanupError) {
        console.error(chalk.red('   ✗ Cleanup failed:'), cleanupError);
      }
      process.exit(0);
    }

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
