/**
 * Settings Command
 * Interactive configuration for Sylphx Flow
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { GlobalConfigService } from '../services/global-config.js';
import { UserCancelledError } from '../utils/errors.js';
import { TargetInstaller } from '../services/target-installer.js';

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
    } catch (error: any) {
      // Handle user cancellation (Ctrl+C)
      if (error.name === 'ExitPromptError' || error.message?.includes('force closed')) {
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
 * Configure Agents
 */
async function configureAgents(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🤖 Agent Configuration\n'));

  const flowConfig = await configService.loadFlowConfig();
  const settings = await configService.loadSettings();
  const currentAgents = flowConfig.agents || {};

  // Available agents
  const availableAgents = {
    coder: 'Coder - Write and modify code',
    writer: 'Writer - Documentation and explanation',
    reviewer: 'Reviewer - Code review and critique',
    orchestrator: 'Orchestrator - Task coordination',
  };

  // Get current enabled agents
  const currentEnabled = Object.keys(currentAgents).filter(
    (key) => currentAgents[key].enabled
  );

  const { selectedAgents } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedAgents',
      message: 'Select agents to enable:',
      choices: Object.entries(availableAgents).map(([key, name]) => ({
        name,
        value: key,
        checked: currentEnabled.includes(key),
      })),
    },
  ]);

  // Update agents
  for (const key of Object.keys(availableAgents)) {
    if (selectedAgents.includes(key)) {
      currentAgents[key] = { enabled: true };
    } else {
      currentAgents[key] = { enabled: false };
    }
  }

  // Select default agent
  const { defaultAgent } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultAgent',
      message: 'Select default agent:',
      choices: selectedAgents.map((key: string) => ({
        name: availableAgents[key as keyof typeof availableAgents],
        value: key,
      })),
      default: settings.defaultAgent || 'coder',
    },
  ]);

  flowConfig.agents = currentAgents;
  await configService.saveFlowConfig(flowConfig);

  settings.defaultAgent = defaultAgent;
  await configService.saveSettings(settings);

  console.log(chalk.green(`\n✓ Agent configuration saved`));
  console.log(chalk.dim(`  Enabled agents: ${selectedAgents.length}`));
  console.log(chalk.dim(`  Default agent: ${defaultAgent}`));
}

/**
 * Configure Rules
 */
async function configureRules(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 📋 Rules Configuration\n'));

  const flowConfig = await configService.loadFlowConfig();
  const currentRules = flowConfig.rules || {};

  // Available rules
  const availableRules = {
    core: 'Core - Identity, personality, execution',
    'code-standards': 'Code Standards - Quality, patterns, anti-patterns',
    workspace: 'Workspace - Documentation management',
  };

  // Get current enabled rules
  const currentEnabled = Object.keys(currentRules).filter(
    (key) => currentRules[key].enabled
  );

  const { selectedRules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRules',
      message: 'Select rules to enable:',
      choices: Object.entries(availableRules).map(([key, name]) => ({
        name,
        value: key,
        checked: currentEnabled.includes(key),
      })),
    },
  ]);

  // Update rules
  for (const key of Object.keys(availableRules)) {
    if (selectedRules.includes(key)) {
      currentRules[key] = { enabled: true };
    } else {
      currentRules[key] = { enabled: false };
    }
  }

  flowConfig.rules = currentRules;
  await configService.saveFlowConfig(flowConfig);

  console.log(chalk.green(`\n✓ Rules configuration saved`));
  console.log(chalk.dim(`  Enabled rules: ${selectedRules.length}`));
}

/**
 * Configure Output Styles
 */
async function configureOutputStyles(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 🎨 Output Styles Configuration\n'));

  const flowConfig = await configService.loadFlowConfig();
  const currentStyles = flowConfig.outputStyles || {};

  // Available output styles
  const availableStyles = {
    silent: 'Silent - Execution without narration',
  };

  // Get current enabled styles
  const currentEnabled = Object.keys(currentStyles).filter(
    (key) => currentStyles[key].enabled
  );

  const { selectedStyles } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedStyles',
      message: 'Select output styles to enable:',
      choices: Object.entries(availableStyles).map(([key, name]) => ({
        name,
        value: key,
        checked: currentEnabled.includes(key),
      })),
    },
  ]);

  // Update styles
  for (const key of Object.keys(availableStyles)) {
    if (selectedStyles.includes(key)) {
      currentStyles[key] = { enabled: true };
    } else {
      currentStyles[key] = { enabled: false };
    }
  }

  flowConfig.outputStyles = currentStyles;
  await configService.saveFlowConfig(flowConfig);

  console.log(chalk.green(`\n✓ Output styles configuration saved`));
  console.log(chalk.dim(`  Enabled styles: ${selectedStyles.length}`));
}

/**
 * Configure MCP servers
 */
async function configureMCP(configService: GlobalConfigService): Promise<void> {
  console.log(chalk.cyan.bold('\n━━━ 📡 MCP Server Configuration\n'));

  const mcpConfig = await configService.loadMCPConfig();
  const currentServers = mcpConfig.servers || {};

  // Available MCP servers (from MCP_SERVER_REGISTRY)
  const availableServers = {
    'grep': { name: 'GitHub Code Search (grep.app)', requiresEnv: [] },
    'context7': { name: 'Context7 Docs', requiresEnv: [] },
    'playwright': { name: 'Playwright Browser Control', requiresEnv: [] },
    'github': { name: 'GitHub', requiresEnv: ['GITHUB_TOKEN'] },
    'notion': { name: 'Notion', requiresEnv: ['NOTION_API_KEY'] },
  };

  // Get current enabled servers
  const currentEnabled = Object.keys(currentServers).filter(
    (key) => currentServers[key].enabled
  );

  const { selectedServers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedServers',
      message: 'Select MCP servers to enable:',
      choices: Object.entries(availableServers).map(([key, info]) => {
        const requiresText = info.requiresEnv.length > 0
          ? chalk.dim(` (requires ${info.requiresEnv.join(', ')})`)
          : '';
        return {
          name: `${info.name}${requiresText}`,
          value: key,
          checked: currentEnabled.includes(key),
        };
      }),
    },
  ]);

  // Update servers
  for (const key of Object.keys(availableServers)) {
    if (selectedServers.includes(key)) {
      if (!currentServers[key]) {
        currentServers[key] = { enabled: true, env: {} };
      } else {
        currentServers[key].enabled = true;
      }
    } else if (currentServers[key]) {
      currentServers[key].enabled = false;
    }
  }

  // Ask for API keys for newly enabled servers
  for (const serverKey of selectedServers) {
    const serverInfo = availableServers[serverKey as keyof typeof availableServers];
    if (serverInfo.requiresEnv.length > 0) {
      const server = currentServers[serverKey];

      for (const envKey of serverInfo.requiresEnv) {
        const hasKey = server.env && server.env[envKey];

        const { shouldConfigure } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldConfigure',
            message: hasKey
              ? `Update ${envKey} for ${serverInfo.name}?`
              : `Configure ${envKey} for ${serverInfo.name}?`,
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
        message: currentKey ? `Update ${defaultProvider} API key?` : `Configure ${defaultProvider} API key?`,
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
      providerConfig.claudeCode.providers[defaultProvider]!.apiKey = apiKey;
      providerConfig.claudeCode.providers[defaultProvider]!.enabled = true;
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

  // Available targets (all of them, regardless of installation status)
  const availableTargets = [
    {
      name: 'Claude Code',
      value: 'claude-code',
      installed: installedTargets.includes('claude-code'),
    },
    {
      name: 'OpenCode',
      value: 'opencode',
      installed: installedTargets.includes('opencode'),
    },
    {
      name: 'Cursor',
      value: 'cursor',
      installed: installedTargets.includes('cursor'),
    },
  ];

  const { defaultTarget } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultTarget',
      message: 'Select default target platform:',
      choices: [
        ...availableTargets.map((target) => {
          const status = target.installed
            ? chalk.green(' ✓ installed')
            : chalk.dim(' (not installed - will auto-install on first use)');
          return {
            name: `${target.name}${status}`,
            value: target.value,
          };
        }),
        new inquirer.Separator(),
        {
          name: 'Ask me every time',
          value: 'ask-every-time',
        },
      ],
      default: settings.defaultTarget || 'ask-every-time',
    },
  ]);

  settings.defaultTarget = defaultTarget as 'claude-code' | 'opencode' | 'cursor' | 'ask-every-time';
  await configService.saveSettings(settings);

  if (defaultTarget === 'ask-every-time') {
    console.log(chalk.green('\n✓ Target platform saved'));
    console.log(chalk.dim('  Default: Ask every time (auto-detect or prompt)'));
  } else {
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
