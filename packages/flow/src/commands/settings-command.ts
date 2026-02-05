/**
 * Settings Command
 * Interactive configuration for Sylphx Flow
 */

import chalk from 'chalk';
import { Command } from 'commander';
import {
  computeEffectiveServers,
  getRequiredEnvVars,
  MCP_SERVER_REGISTRY,
  type MCPServerID,
} from '../config/servers.js';
import { GlobalConfigService } from '../services/global-config.js';
import { TargetInstaller } from '../services/target-installer.js';
import { UserCancelledError } from '../utils/errors.js';
import {
  log,
  promptConfirm,
  promptMultiselect,
  promptPassword,
  promptSelect,
  type SelectOption,
} from '../utils/prompts/index.js';
import { buildAvailableTargets, promptForDefaultTarget } from '../utils/target-selection.js';
import { handleCheckboxConfig } from './settings/index.js';

export const settingsCommand = new Command('settings')
  .description('Configure Sylphx Flow settings')
  .option('--section <section>', 'Directly open a section (mcp, provider, target, general)')
  .action(async (options) => {
    try {
      const configService = new GlobalConfigService();
      await configService.initialize();

      console.log(chalk.cyan.bold('\n╭─ Sylphx Flow Settings ─────────────────────────╮'));
      console.log(chalk.cyan.bold('│                                                 │'));
      console.log(chalk.cyan.bold('│  Configure your Flow environment                │'));
      console.log(chalk.cyan.bold('│                                                 │'));
      console.log(chalk.cyan.bold('╰─────────────────────────────────────────────────╯\n'));

      if (options.section) {
        await openSection(options.section, configService);
      } else {
        await showMainMenu(configService);
      }
    } catch (error: unknown) {
      // Handle user cancellation (Ctrl+C)
      if (error instanceof UserCancelledError) {
        throw error;
      }
      throw error;
    }
  });

/**
 * Show main settings menu
 */
async function showMainMenu(configService: GlobalConfigService): Promise<void> {
  while (true) {
    const menuOptions: SelectOption<string>[] = [
      // Content Configuration
      { label: '🤖 Agents & Default Agent', value: 'agents', hint: 'content' },
      { label: '📋 Rules', value: 'rules', hint: 'content' },
      { label: '🎨 Output Styles', value: 'outputStyles', hint: 'content' },
      // Infrastructure Configuration
      { label: '📡 MCP Servers', value: 'mcp', hint: 'infra' },
      { label: '🔑 Provider & API Keys (Claude Code)', value: 'provider', hint: 'infra' },
      { label: '🎯 Target Platform', value: 'target', hint: 'infra' },
      { label: '⚙️  General Settings', value: 'general', hint: 'infra' },
      // Exit
      { label: '← Back / Exit', value: 'exit' },
    ];

    const choice = await promptSelect({
      message: 'What would you like to configure?',
      options: menuOptions,
    });

    if (choice === 'exit') {
      log.success('Settings saved');
      break;
    }

    await openSection(choice, configService);
  }
}

/**
 * Open specific settings section
 */
async function openSection(section: string, configService: GlobalConfigService): Promise<void> {
  switch (section) {
    case 'agents':
      await configureAgents(configService);
      break;
    case 'rules':
      await configureRules(configService);
      break;
    case 'outputStyles':
      await configureOutputStyles(configService);
      break;
    case 'mcp':
      await configureMCP(configService);
      break;
    case 'provider':
      await configureProvider(configService);
      break;
    case 'target':
      await configureTarget(configService);
      break;
    case 'general':
      await configureGeneral(configService);
      break;
    default:
      log.error(`Unknown section: ${section}`);
  }
}

/**
 * Configure Agents - uses shared checkbox handler + default selection
 */
async function configureAgents(configService: GlobalConfigService): Promise<void> {
  const flowConfig = await configService.loadFlowConfig();
  const settings = await configService.loadSettings();

  const availableAgents = {
    builder: 'Builder - Autonomous product builder (default)',
    coder: 'Coder - Task-focused code execution',
    writer: 'Writer - Documentation and explanation',
    reviewer: 'Reviewer - Code review and critique',
  };

  const { selected, updated } = await handleCheckboxConfig({
    title: 'Agent Configuration',
    icon: '🤖',
    message: 'Select agents to enable:',
    available: availableAgents,
    current: flowConfig.agents || {},
    itemType: 'Agents',
  });

  // Additional step: select default agent from enabled ones
  const defaultAgent = await promptSelect({
    message: 'Select default agent:',
    options: selected.map((key) => ({
      label: availableAgents[key as keyof typeof availableAgents],
      value: key,
    })),
    initialValue: settings.defaultAgent || 'builder',
  });

  flowConfig.agents = updated;
  await configService.saveFlowConfig(flowConfig);

  settings.defaultAgent = defaultAgent;
  await configService.saveSettings(settings);

  log.info(`Default agent: ${defaultAgent}`);
}

/**
 * Configure Rules - uses shared checkbox handler
 */
async function configureRules(configService: GlobalConfigService): Promise<void> {
  const flowConfig = await configService.loadFlowConfig();

  const { updated } = await handleCheckboxConfig({
    title: 'Rules Configuration',
    icon: '📋',
    message: 'Select rules to enable:',
    available: {
      core: 'Core - Identity, personality, execution',
      'code-standards': 'Code Standards - Quality, patterns, anti-patterns',
    },
    current: flowConfig.rules || {},
    itemType: 'Rules',
  });

  flowConfig.rules = updated;
  await configService.saveFlowConfig(flowConfig);
}

/**
 * Configure Output Styles - uses shared checkbox handler
 */
async function configureOutputStyles(configService: GlobalConfigService): Promise<void> {
  const flowConfig = await configService.loadFlowConfig();

  const { updated } = await handleCheckboxConfig({
    title: 'Output Styles Configuration',
    icon: '🎨',
    message: 'Select output styles to enable:',
    available: {
      // Output styles merged into core.md - no separate files
    },
    current: flowConfig.outputStyles || {},
    itemType: 'Output styles',
  });

  flowConfig.outputStyles = updated;
  await configService.saveFlowConfig(flowConfig);
}

/**
 * Configure MCP servers
 */
async function configureMCP(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 📡 MCP Server Configuration\n'));

  const mcpConfig = await configService.loadMCPConfig();
  const savedServers = mcpConfig.servers || {};

  // SSOT: compute effective state from saved config + defaults
  const effectiveServers = computeEffectiveServers(savedServers);
  const allServerIds = Object.keys(MCP_SERVER_REGISTRY) as MCPServerID[];

  // Build multiselect options
  const serverOptions = allServerIds.map((id) => {
    const server = MCP_SERVER_REGISTRY[id];
    const effective = effectiveServers[id];
    const requiredEnvVars = getRequiredEnvVars(id);
    const requiresText =
      requiredEnvVars.length > 0 ? chalk.dim(` (requires ${requiredEnvVars.join(', ')})`) : '';
    return {
      label: `${server.name} - ${server.description}${requiresText}`,
      value: id,
      hint: effective.enabled ? 'enabled' : undefined,
    };
  });

  // Get initial values from effective state
  const initialValues = allServerIds.filter((id) => effectiveServers[id].enabled);

  const selectedServers = await promptMultiselect<MCPServerID>({
    message: 'Select MCP servers to enable:',
    options: serverOptions,
    initialValues,
  });

  // Update servers - save ALL servers with explicit enabled state
  const updatedServers: Record<string, { enabled: boolean; env: Record<string, string> }> = {};
  for (const id of allServerIds) {
    const effective = effectiveServers[id];
    updatedServers[id] = {
      enabled: selectedServers.includes(id),
      env: effective.env, // Preserve existing env vars
    };
  }

  // Ask for API keys for newly enabled servers
  for (const serverId of selectedServers) {
    const serverDef = MCP_SERVER_REGISTRY[serverId];
    const requiredEnvVars = getRequiredEnvVars(serverId);

    if (requiredEnvVars.length > 0) {
      const serverState = updatedServers[serverId];

      for (const envKey of requiredEnvVars) {
        const hasKey = serverState.env?.[envKey];

        const shouldConfigure = await promptConfirm({
          message: hasKey
            ? `Update ${envKey} for ${serverDef.name}?`
            : `Configure ${envKey} for ${serverDef.name}?`,
          initialValue: !hasKey,
        });

        if (shouldConfigure) {
          const apiKey = await promptPassword({
            message: `Enter ${envKey}:`,
            mask: '*',
          });

          serverState.env[envKey] = apiKey;
        }
      }
    }
  }

  mcpConfig.servers = updatedServers;
  await configService.saveMCPConfig(mcpConfig);

  log.success('MCP configuration saved');
  log.info(`Enabled servers: ${selectedServers.length}`);
}

/**
 * Configure provider settings (Claude Code)
 */
async function configureProvider(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🔑 Provider Configuration (Claude Code)\n'));

  const providerConfig = await configService.loadProviderConfig();

  const providerOptions: SelectOption<string>[] = [
    { label: 'Default (Claude Code built-in)', value: 'default' },
    { label: 'Kimi', value: 'kimi' },
    { label: 'Z.ai', value: 'zai' },
    { label: 'Ask me every time', value: 'ask-every-time', hint: 'dynamic' },
  ];

  const defaultProvider = await promptSelect({
    message: 'Select default provider:',
    options: providerOptions,
    initialValue: providerConfig.claudeCode.defaultProvider,
  });

  providerConfig.claudeCode.defaultProvider = defaultProvider;

  // Configure API keys if provider selected
  if (defaultProvider === 'kimi' || defaultProvider === 'zai') {
    const currentKey = providerConfig.claudeCode.providers[defaultProvider]?.apiKey;

    const shouldConfigure = await promptConfirm({
      message: currentKey
        ? `Update ${defaultProvider} API key?`
        : `Configure ${defaultProvider} API key?`,
      initialValue: !currentKey,
    });

    if (shouldConfigure) {
      const apiKey = await promptPassword({
        message: 'Enter API key:',
        mask: '*',
      });

      if (!providerConfig.claudeCode.providers[defaultProvider]) {
        providerConfig.claudeCode.providers[defaultProvider] = { enabled: true };
      }
      const provider = providerConfig.claudeCode.providers[defaultProvider];
      if (provider) {
        provider.apiKey = apiKey;
        provider.enabled = true;
      }
    }
  }

  await configService.saveProviderConfig(providerConfig);

  log.success('Provider configuration saved');
  log.info(`Default provider: ${defaultProvider}`);
}

/**
 * Configure target platform
 */
async function configureTarget(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🎯 Target Platform\n'));

  const settings = await configService.loadSettings();
  const targetInstaller = new TargetInstaller();

  // Detect which targets are installed
  log.info('Detecting installed AI CLIs...');
  const installedTargets = await targetInstaller.detectInstalledTargets();

  const defaultTarget = await promptForDefaultTarget(installedTargets, settings.defaultTarget);

  settings.defaultTarget = defaultTarget as 'claude-code' | 'opencode' | 'ask-every-time';
  await configService.saveSettings(settings);

  if (defaultTarget === 'ask-every-time') {
    log.success('Target platform saved');
    log.info('Default: Ask every time (auto-detect or prompt)');
  } else {
    const availableTargets = buildAvailableTargets(installedTargets);
    const selectedTarget = availableTargets.find((t) => t.value === defaultTarget);
    const installStatus = selectedTarget?.installed
      ? chalk.green('(installed)')
      : chalk.yellow('(will be installed on first use)');

    log.success('Target platform saved');
    log.info(`Default: ${defaultTarget} ${installStatus}`);
  }
}

/**
 * Configure general settings
 */
async function configureGeneral(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ ⚙️  General Settings\n'));

  const settings = await configService.loadSettings();

  log.info(`Flow Home Directory: ${configService.getFlowHomeDir()}`);
  log.info(`Version: ${settings.version}`);
  log.info(`Last Updated: ${new Date(settings.lastUpdated).toLocaleString()}`);

  const actionOptions: SelectOption<string>[] = [
    { label: 'Reset to defaults', value: 'reset' },
    { label: 'Show current configuration', value: 'show' },
    { label: '← Back', value: 'back' },
  ];

  const action = await promptSelect({
    message: 'What would you like to do?',
    options: actionOptions,
  });

  if (action === 'reset') {
    const confirm = await promptConfirm({
      message: 'Are you sure you want to reset all settings to defaults?',
      initialValue: false,
    });

    if (confirm) {
      await configService.saveSettings({
        version: '1.0.0',
        firstRun: false,
        lastUpdated: new Date().toISOString(),
      });
      await configService.saveProviderConfig({
        claudeCode: {
          defaultProvider: 'ask-every-time',
          providers: {
            kimi: { enabled: false },
            zai: { enabled: false },
          },
        },
      });
      await configService.saveMCPConfig({
        version: '1.0.0',
        servers: {},
      });

      log.success('Settings reset to defaults');
    }
  } else if (action === 'show') {
    const providerConfig = await configService.loadProviderConfig();
    const mcpConfig = await configService.loadMCPConfig();

    console.log(chalk.cyan('\nCurrent Configuration:'));
    console.log(JSON.stringify({ settings, providerConfig, mcpConfig }, null, 2));
  }
}
