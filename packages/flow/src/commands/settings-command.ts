/**
 * Settings Command
 * Interactive configuration for Sylphx Flow
 */

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { getRequiredEnvVars, MCP_SERVER_REGISTRY, type MCPServerID } from '../config/servers.js';
import { GlobalConfigService } from '../services/global-config.js';
import { TargetInstaller } from '../services/target-installer.js';
import { UserCancelledError } from '../utils/errors.js';
import { buildAvailableTargets, promptForDefaultTarget } from '../utils/target-selection.js';
import { handleCheckboxConfig, printHeader, printConfirmation } from './settings/index.js';

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
      const err = error as Error & { name?: string };
      if (err.name === 'ExitPromptError' || err.message?.includes('force closed')) {
        throw new UserCancelledError('Settings cancelled by user');
      }
      throw error;
    }
  });

/**
 * Show main settings menu
 */
async function showMainMenu(configService: GlobalConfigService): Promise<void> {
  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to configure?',
        choices: [
          { name: '🤖 Agents & Default Agent', value: 'agents' },
          { name: '📋 Rules', value: 'rules' },
          { name: '🎨 Output Styles', value: 'outputStyles' },
          new inquirer.Separator(),
          { name: '📡 MCP Servers', value: 'mcp' },
          { name: '🔑 Provider & API Keys (Claude Code)', value: 'provider' },
          { name: '🎯 Target Platform', value: 'target' },
          { name: '⚙️  General Settings', value: 'general' },
          new inquirer.Separator(),
          { name: '← Back / Exit', value: 'exit' },
        ],
      },
    ]);

    if (choice === 'exit') {
      console.log(chalk.green('\n✓ Settings saved\n'));
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
      console.log(chalk.red(`Unknown section: ${section}`));
  }
}

/**
 * Configure Agents - uses shared checkbox handler + default selection
 */
async function configureAgents(configService: GlobalConfigService): Promise<void> {
  const flowConfig = await configService.loadFlowConfig();
  const settings = await configService.loadSettings();

  const availableAgents = {
    coder: 'Coder - Write and modify code',
    writer: 'Writer - Documentation and explanation',
    reviewer: 'Reviewer - Code review and critique',
    orchestrator: 'Orchestrator - Task coordination',
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
  const { defaultAgent } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultAgent',
      message: 'Select default agent:',
      choices: selected.map((key) => ({
        name: availableAgents[key as keyof typeof availableAgents],
        value: key,
      })),
      default: settings.defaultAgent || 'coder',
    },
  ]);

  flowConfig.agents = updated;
  await configService.saveFlowConfig(flowConfig);

  settings.defaultAgent = defaultAgent;
  await configService.saveSettings(settings);

  console.log(chalk.dim(`  Default agent: ${defaultAgent}`));
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
      workspace: 'Workspace - Documentation management',
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
      silent: 'Silent - Execution without narration',
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
  const currentServers = mcpConfig.servers || {};

  // Get all servers from registry
  const allServerIds = Object.keys(MCP_SERVER_REGISTRY) as MCPServerID[];

  // Get current enabled servers
  const currentEnabled = Object.keys(currentServers).filter((key) => currentServers[key].enabled);

  const { selectedServers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedServers',
      message: 'Select MCP servers to enable:',
      choices: allServerIds.map((id) => {
        const server = MCP_SERVER_REGISTRY[id];
        const requiredEnvVars = getRequiredEnvVars(id);
        const requiresText =
          requiredEnvVars.length > 0 ? chalk.dim(` (requires ${requiredEnvVars.join(', ')})`) : '';
        return {
          name: `${server.name} - ${server.description}${requiresText}`,
          value: id,
          checked: currentEnabled.includes(id) || server.defaultInInit,
        };
      }),
    },
  ]);

  // Update servers
  for (const id of allServerIds) {
    if (selectedServers.includes(id)) {
      if (currentServers[id]) {
        currentServers[id].enabled = true;
      } else {
        currentServers[id] = { enabled: true, env: {} };
      }
    } else if (currentServers[id]) {
      currentServers[id].enabled = false;
    }
  }

  // Ask for API keys for newly enabled servers
  for (const serverId of selectedServers as MCPServerID[]) {
    const serverDef = MCP_SERVER_REGISTRY[serverId];
    const requiredEnvVars = getRequiredEnvVars(serverId);

    if (requiredEnvVars.length > 0) {
      const server = currentServers[serverId];

      for (const envKey of requiredEnvVars) {
        const hasKey = server.env?.[envKey];

        const { shouldConfigure } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldConfigure',
            message: hasKey
              ? `Update ${envKey} for ${serverDef.name}?`
              : `Configure ${envKey} for ${serverDef.name}?`,
            default: !hasKey,
          },
        ]);

        if (shouldConfigure) {
          const { apiKey } = await inquirer.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: `Enter ${envKey}:`,
              mask: '*',
            },
          ]);

          if (!server.env) {
            server.env = {};
          }
          server.env[envKey] = apiKey;
        }
      }
    }
  }

  mcpConfig.servers = currentServers;
  await configService.saveMCPConfig(mcpConfig);

  console.log(chalk.green(`\n✓ MCP configuration saved`));
  console.log(chalk.dim(`  Enabled servers: ${selectedServers.length}`));
}

/**
 * Configure provider settings (Claude Code)
 */
async function configureProvider(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🔑 Provider Configuration (Claude Code)\n'));

  const providerConfig = await configService.loadProviderConfig();

  const { defaultProvider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultProvider',
      message: 'Select default provider:',
      choices: [
        { name: 'Default (Claude Code built-in)', value: 'default' },
        { name: 'Kimi', value: 'kimi' },
        { name: 'Z.ai', value: 'zai' },
        new inquirer.Separator(),
        { name: 'Ask me every time', value: 'ask-every-time' },
      ],
      default: providerConfig.claudeCode.defaultProvider,
    },
  ]);

  providerConfig.claudeCode.defaultProvider = defaultProvider;

  // Configure API keys if provider selected
  if (defaultProvider === 'kimi' || defaultProvider === 'zai') {
    const currentKey = providerConfig.claudeCode.providers[defaultProvider]?.apiKey;

    const { shouldConfigure } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldConfigure',
        message: currentKey
          ? `Update ${defaultProvider} API key?`
          : `Configure ${defaultProvider} API key?`,
        default: !currentKey,
      },
    ]);

    if (shouldConfigure) {
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter API key:',
          mask: '*',
        },
      ]);

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

  console.log(chalk.green('\n✓ Provider configuration saved'));
  console.log(chalk.dim(`  Default provider: ${defaultProvider}`));
}

/**
 * Configure target platform
 */
async function configureTarget(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🎯 Target Platform\n'));

  const settings = await configService.loadSettings();
  const targetInstaller = new TargetInstaller();

  // Detect which targets are installed
  console.log(chalk.dim('Detecting installed AI CLIs...\n'));
  const installedTargets = await targetInstaller.detectInstalledTargets();

  const defaultTarget = await promptForDefaultTarget(installedTargets, settings.defaultTarget);

  settings.defaultTarget = defaultTarget as
    | 'claude-code'
    | 'opencode'
    | 'ask-every-time';
  await configService.saveSettings(settings);

  if (defaultTarget === 'ask-every-time') {
    console.log(chalk.green('\n✓ Target platform saved'));
    console.log(chalk.dim('  Default: Ask every time (auto-detect or prompt)'));
  } else {
    const availableTargets = buildAvailableTargets(installedTargets);
    const selectedTarget = availableTargets.find((t) => t.value === defaultTarget);
    const installStatus = selectedTarget?.installed
      ? chalk.green('(installed)')
      : chalk.yellow('(will be installed on first use)');

    console.log(chalk.green('\n✓ Target platform saved'));
    console.log(chalk.dim(`  Default: ${defaultTarget} ${installStatus}`));
  }
}

/**
 * Configure general settings
 */
async function configureGeneral(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ ⚙️  General Settings\n'));

  const settings = await configService.loadSettings();

  console.log(chalk.dim('Flow Home Directory:'), configService.getFlowHomeDir());
  console.log(chalk.dim('Version:'), settings.version);
  console.log(chalk.dim('Last Updated:'), new Date(settings.lastUpdated).toLocaleString());

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Reset to defaults', value: 'reset' },
        { name: 'Show current configuration', value: 'show' },
        new inquirer.Separator(),
        { name: '← Back', value: 'back' },
      ],
    },
  ]);

  if (action === 'reset') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset all settings to defaults?',
        default: false,
      },
    ]);

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

      console.log(chalk.green('\n✓ Settings reset to defaults'));
    }
  } else if (action === 'show') {
    const providerConfig = await configService.loadProviderConfig();
    const mcpConfig = await configService.loadMCPConfig();

    console.log(chalk.cyan('\nCurrent Configuration:'));
    console.log(JSON.stringify({ settings, providerConfig, mcpConfig }, null, 2));
  }
}
