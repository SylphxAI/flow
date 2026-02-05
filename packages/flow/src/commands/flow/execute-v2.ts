/**
 * Execution Logic for Flow Command (V2 - Attach Mode)
 * Minimal, modern CLI output design
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { FlowExecutor } from '../../core/flow-executor.js';
import { targetManager } from '../../core/target-manager.js';
import { AutoUpgrade } from '../../services/auto-upgrade.js';
import { GlobalConfigService } from '../../services/global-config.js';
import { TargetInstaller } from '../../services/target-installer.js';
import type { RunCommandOptions } from '../../types.js';
import { extractAgentInstructions, loadAgentContent } from '../../utils/agent-enhancer.js';
import { showAttachSummary, showHeader } from '../../utils/display/banner.js';
import { CLIError } from '../../utils/error-handler.js';
import { UserCancelledError } from '../../utils/errors.js';
import { log, promptConfirm, promptSelect } from '../../utils/prompts/index.js';
import { ensureTargetInstalled, promptForTargetSelection } from '../../utils/target-selection.js';
import { resolvePrompt } from './prompt.js';
import type { FlowOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get Flow version from package.json
 */
async function getFlowVersion(): Promise<string> {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return 'unknown';
  }
}

/**
 * Configure provider environment variables
 */
function configureProviderEnv(provider: 'kimi' | 'zai', apiKey: string): void {
  const providerConfig = {
    kimi: {
      baseUrl: 'https://api.moonshot.cn/v1',
      name: 'Kimi',
    },
    zai: {
      baseUrl: 'https://api.z.ai/v1',
      name: 'Z.ai',
    },
  };

  const config = providerConfig[provider];
  process.env.ANTHROPIC_BASE_URL = config.baseUrl;
  process.env.ANTHROPIC_API_KEY = apiKey;
}

/**
 * Select and configure provider for Claude Code (silent unless prompting)
 */
async function selectProvider(configService: GlobalConfigService): Promise<void> {
  const providerConfig = await configService.loadProviderConfig();
  const defaultProvider = providerConfig.claudeCode.defaultProvider;

  // If not "ask-every-time", use the default provider silently
  if (defaultProvider !== 'ask-every-time') {
    if (defaultProvider === 'kimi' || defaultProvider === 'zai') {
      const provider = providerConfig.claudeCode.providers[defaultProvider];
      if (provider?.apiKey) {
        configureProviderEnv(defaultProvider, provider.apiKey);
      }
    }
    return;
  }

  // Ask user which provider to use for this session
  const selectedProvider = await promptSelect({
    message: 'Select provider:',
    options: [
      { label: 'Default (Claude Code built-in)', value: 'default' },
      { label: 'Kimi', value: 'kimi' },
      { label: 'Z.ai', value: 'zai' },
    ],
    initialValue: 'default',
  });

  const rememberChoice = await promptConfirm({
    message: 'Remember this choice?',
    initialValue: true,
  });

  // Save choice if user wants to remember
  if (rememberChoice) {
    providerConfig.claudeCode.defaultProvider = selectedProvider;
    await configService.saveProviderConfig(providerConfig);
  }

  // Configure environment variables based on selection
  if (selectedProvider === 'kimi' || selectedProvider === 'zai') {
    const provider = providerConfig.claudeCode.providers[selectedProvider];

    if (!provider?.apiKey) {
      log.warn('API key not configured. Use: sylphx-flow settings');
      return;
    }

    configureProviderEnv(selectedProvider, provider.apiKey);
  }
}

/**
 * Execute command using target's executeCommand method
 */
function executeTargetCommand(
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
 * Main flow execution with attach mode (V2) - Minimal output design
 */
export async function executeFlowV2(
  prompt: string | undefined,
  options: FlowOptions
): Promise<void> {
  const projectPath = process.cwd();

  // Initialize services and load config in parallel
  const configService = new GlobalConfigService();
  const targetInstaller = new TargetInstaller(projectPath);

  const [, installedTargets, settings, version] = await Promise.all([
    configService.initialize(),
    targetInstaller.detectInstalledTargets(),
    configService.loadSettings(),
    getFlowVersion(),
  ]);

  let selectedTargetId: string | null = null;

  const isAskEveryTime = settings.defaultTarget === 'ask-every-time';
  const hasNoSetting = !settings.defaultTarget;
  const hasSpecificTarget = settings.defaultTarget && settings.defaultTarget !== 'ask-every-time';

  if (isAskEveryTime) {
    // User explicitly wants to be asked every time
    selectedTargetId = await promptForTargetSelection(
      installedTargets,
      'Select AI CLI:',
      'execution'
    );

    const installed = await ensureTargetInstalled(
      selectedTargetId,
      targetInstaller,
      installedTargets
    );

    if (!installed) {
      process.exit(1);
    }
  } else if (hasNoSetting) {
    // No setting - use auto-detection or prompt
    if (installedTargets.length === 1) {
      // Single target: auto-select and save silently
      selectedTargetId = installedTargets[0];
      settings.defaultTarget = selectedTargetId as 'claude-code' | 'opencode';
      await configService.saveSettings(settings);
    } else {
      // Multiple targets: prompt and ask to remember
      selectedTargetId = await promptForTargetSelection(
        installedTargets,
        'Select AI CLI:',
        'execution'
      );

      const installed = await ensureTargetInstalled(
        selectedTargetId,
        targetInstaller,
        installedTargets
      );

      if (!installed) {
        process.exit(1);
      }

      const rememberChoice = await promptConfirm({
        message: 'Remember this choice?',
        initialValue: true,
      });

      if (rememberChoice) {
        settings.defaultTarget = selectedTargetId as 'claude-code' | 'opencode';
        await configService.saveSettings(settings);
      }
    }
  } else if (hasSpecificTarget) {
    // User has a specific target preference
    selectedTargetId = settings.defaultTarget;

    if (!installedTargets.includes(selectedTargetId)) {
      const installation = targetInstaller.getInstallationInfo(selectedTargetId);
      log.warn(`${installation?.name} not installed`);
      const installed = await targetInstaller.install(selectedTargetId, true);

      if (!installed) {
        log.error('Cannot proceed: installation failed');
        process.exit(1);
      }
    }
  }

  // Get target name for header
  const targetInstallation = targetInstaller.getInstallationInfo(selectedTargetId);
  const targetName = targetInstallation?.name || selectedTargetId;

  // Show minimal header
  showHeader(version, targetName);

  // Step 2: Start background auto-upgrade (non-blocking)
  new AutoUpgrade().start();

  // Create executor
  const executor = new FlowExecutor();

  // Step 3: Execute attach mode lifecycle
  try {
    // Attach Flow environment (backup → attach → register cleanup)
    const attachResult = await executor.execute(projectPath, {
      verbose: options.verbose,
      skipBackup: false,
      skipSecrets: false,
      skipProjectDocs: true, // Use /init command for project docs
      merge: options.merge || false,
    });

    // Show attach summary
    showAttachSummary(attachResult);

    const targetId = selectedTargetId;

    // Provider selection (Claude Code only, silent unless prompting)
    if (targetId === 'claude-code') {
      await selectProvider(configService);
    }

    // Determine which agent to use
    const flowConfig = await configService.loadFlowConfig();
    let agent = options.agent || settings.defaultAgent || 'builder';

    // Check if agent is enabled (silent fallback)
    if (!flowConfig.agents[agent]?.enabled) {
      const enabledAgents = await configService.getEnabledAgents();
      agent = enabledAgents.length > 0 ? enabledAgents[0] : 'builder';
    }

    // Load agent content (parallel fetch rules and styles)
    const [enabledRules, enabledOutputStyles] = await Promise.all([
      configService.getEnabledRules(),
      configService.getEnabledOutputStyles(),
    ]);

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

    // Step 5: Cleanup (silent)
    await executor.cleanup(projectPath);
  } catch (error) {
    // Handle user cancellation gracefully
    if (error instanceof UserCancelledError) {
      log.warn('Cancelled');
      try {
        await executor.cleanup(projectPath);
      } catch {
        // Silent cleanup failure
      }
      process.exit(0);
    }

    console.error(chalk.red('\n  Error:'), error);

    // Ensure cleanup even on error
    try {
      await executor.cleanup(projectPath);
    } catch {
      // Silent cleanup failure
    }

    throw error;
  }
}

/**
 * Main flow execution entry point
 */
export async function executeFlow(prompt: string | undefined, options: FlowOptions): Promise<void> {
  // Resolve prompt (handle file input)
  const resolvedPrompt = await resolvePrompt(prompt);

  // Use V2 attach mode execution
  await executeFlowV2(resolvedPrompt, options);
}
