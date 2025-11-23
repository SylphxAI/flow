/**
 * Settings Command
 * Interactive configuration for Sylphx Flow
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { GlobalConfigService } from '../services/global-config.js';

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
        console.log(chalk.yellow('\n\n⚠️  Settings cancelled by user'));
        process.exit(0);
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

  const { defaultTarget } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultTarget',
      message: 'Select default target platform:',
      choices: [
        { name: 'Claude Code', value: 'claude-code' },
        { name: 'OpenCode', value: 'opencode' },
      ],
      default: settings.defaultTarget || 'claude-code',
    },
  ]);

  settings.defaultTarget = defaultTarget;
  await configService.saveSettings(settings);

  console.log(chalk.green('\n✓ Target platform saved'));
  console.log(chalk.dim(`  Default: ${defaultTarget}`));
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
