/**
 * Execution Logic for Flow Command (V2 - Attach Mode)
 * Minimal, modern CLI output design
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import createDebug from 'debug';
import { FlowExecutor } from '../../core/flow-executor.js';
import { readJsonFileSafe } from '../../utils/files/file-operations.js';

const debug = createDebug('flow:execute');

import { targetManager } from '../../core/target-manager.js';
import { AutoUpgrade } from '../../services/auto-upgrade.js';
import { GlobalConfigService } from '../../services/global-config.js';
import { TargetInstaller } from '../../services/target-installer.js';
import type { RunCommandOptions } from '../../types.js';
import { extractAgentInstructions, loadAgentContent } from '../../utils/agent-enhancer.js';
import { showAttachSummary, showHeader } from '../../utils/display/banner.js';
import { CLIError, UserCancelledError } from '../../utils/errors.js';
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
  const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');
  const pkg = await readJsonFileSafe<{ version?: string }>(packageJsonPath, {});
  return pkg.version ?? 'unknown';
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
 * Select target based on user settings, installed targets, and prompts
 */
async function selectTarget(
  installedTargets: string[],
  settings: import('../../services/global-config.js').GlobalSettings,
  configService: GlobalConfigService,
  targetInstaller: TargetInstaller
): Promise<string | null> {
  if (settings.defaultTarget === 'ask-every-time') {
    const targetId = await promptForTargetSelection(
      installedTargets,
      'Select AI CLI:',
      'execution'
    );
    const installed = await ensureTargetInstalled(targetId, targetInstaller, installedTargets);
    if (!installed) {
      process.exit(1);
    }
    return targetId;
  }

  if (!settings.defaultTarget) {
    if (installedTargets.length === 1) {
      const targetId = installedTargets[0];
      settings.defaultTarget = targetId as 'claude-code' | 'opencode';
      await configService.saveSettings(settings);
      return targetId;
    }

    const targetId = await promptForTargetSelection(
      installedTargets,
      'Select AI CLI:',
      'execution'
    );
    const installed = await ensureTargetInstalled(targetId, targetInstaller, installedTargets);
    if (!installed) {
      process.exit(1);
    }

    const rememberChoice = await promptConfirm({
      message: 'Remember this choice?',
      initialValue: true,
    });
    if (rememberChoice) {
      settings.defaultTarget = targetId as 'claude-code' | 'opencode';
      await configService.saveSettings(settings);
    }
    return targetId;
  }

  // User has a specific target preference
  const targetId = settings.defaultTarget;
  if (!installedTargets.includes(targetId)) {
    const installation = targetInstaller.getInstallationInfo(targetId);
    log.warn(`${installation?.name} not installed`);
    const installed = await targetInstaller.install(targetId, true);
    if (!installed) {
      log.error('Cannot proceed: installation failed');
      process.exit(1);
    }
  }
  return targetId;
}

/**
 * Load agent and build system prompt
 */
async function loadAgent(
  options: FlowOptions,
  settings: import('../../services/global-config.js').GlobalSettings,
  configService: GlobalConfigService
): Promise<{ agent: string; systemPrompt: string }> {
  const flowConfig = await configService.loadFlowConfig();
  let agent = options.agent || settings.defaultAgent || 'builder';

  if (!flowConfig.agents[agent]?.enabled) {
    const enabledAgents = await configService.getEnabledAgents();
    agent = enabledAgents.length > 0 ? enabledAgents[0] : 'builder';
  }

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

  return {
    agent,
    systemPrompt: `AGENT INSTRUCTIONS:\n${agentInstructions}`,
  };
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

  const selectedTargetId = await selectTarget(
    installedTargets,
    settings,
    configService,
    targetInstaller
  );

  // Get target name for header
  const targetInstallation = targetInstaller.getInstallationInfo(selectedTargetId);
  const targetName = targetInstallation?.name || selectedTargetId;

  // Show minimal header
  showHeader(version, targetName);

  // Start background auto-upgrade (non-blocking)
  new AutoUpgrade().start();

  const executor = new FlowExecutor();

  try {
    // Attach Flow environment (backup → attach → register cleanup)
    const attachResult = await executor.execute(projectPath, {
      verbose: options.verbose,
      skipBackup: false,
      skipSecrets: false,
      skipProjectDocs: true,
      merge: options.merge || false,
    });

    showAttachSummary(attachResult);

    // Provider selection (Claude Code only, silent unless prompting)
    if (selectedTargetId === 'claude-code') {
      await selectProvider(configService);
    }

    // Load agent and build prompts
    const { agent, systemPrompt } = await loadAgent(options, settings, configService);
    const userPrompt = prompt?.trim() || '';

    const runOptions: RunCommandOptions = {
      target: selectedTargetId,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      agent,
      agentFile: options.agentFile,
      prompt,
      print: options.print,
      continue: options.continue,
    };

    await executeTargetCommand(selectedTargetId, systemPrompt, userPrompt, runOptions);
    await executor.cleanup(projectPath);
  } catch (error) {
    if (error instanceof UserCancelledError) {
      log.warn('Cancelled');
      try {
        await executor.cleanup(projectPath);
      } catch (cleanupError) {
        debug('cleanup after cancel failed:', cleanupError);
      }
      process.exit(0);
    }

    console.error(chalk.red('\n  Error:'), error);

    try {
      await executor.cleanup(projectPath);
    } catch (cleanupError) {
      debug('cleanup after error failed:', cleanupError);
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
