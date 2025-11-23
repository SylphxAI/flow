/**
 * First Run Setup
 * Quick configuration wizard for new users
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { GlobalConfigService } from './global-config.js';

export interface QuickSetupResult {
  target: 'claude-code' | 'opencode';
  provider?: 'default' | 'kimi' | 'zai' | 'ask-every-time';
  mcpServers: string[];
  apiKeys: Record<string, Record<string, string>>;
}

export class FirstRunSetup {
  private configService: GlobalConfigService;

  constructor() {
    this.configService = new GlobalConfigService();
  }

  /**
   * Run quick setup wizard
   */
  async run(useDefaults = false): Promise<QuickSetupResult> {
    console.log(chalk.cyan.bold('\n╭─────────────────────────────────────────────────╮'));
    console.log(chalk.cyan.bold('│                                                 │'));
    console.log(chalk.cyan.bold('│  Welcome to Sylphx Flow!                        │'));
    console.log(chalk.cyan.bold('│  Let\'s configure your environment               │'));
    console.log(chalk.cyan.bold('│                                                 │'));
    console.log(chalk.cyan.bold('╰─────────────────────────────────────────────────╯\n'));

    let target: 'claude-code' | 'opencode' = 'claude-code';

    // Step 1: Select target platform
    if (useDefaults) {
      console.log(chalk.dim('Using default target: claude-code\n'));
    } else {
      console.log(chalk.cyan('🔧 Quick Setup (1/3) - Target Platform\n'));
      const result = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: 'Select your preferred platform:',
          choices: [
            { name: 'Claude Code', value: 'claude-code' },
            { name: 'OpenCode', value: 'opencode' },
          ],
          default: 'claude-code',
        },
      ]);
      target = result.target;
    }

    let provider: string | undefined = 'ask-every-time';
    const apiKeys: Record<string, Record<string, string>> = {};

    // Step 2: Provider setup (Claude Code only)
    if (target === 'claude-code') {
      if (useDefaults) {
        console.log(chalk.dim('Using default provider: ask-every-time\n'));
      } else {
        console.log(chalk.cyan('\n🔧 Quick Setup (2/3) - Provider\n'));
        const { selectedProvider } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedProvider',
            message: 'Select your preferred provider:',
            choices: [
              { name: 'Ask me every time', value: 'ask-every-time' },
              { name: 'Default (Claude Code built-in)', value: 'default' },
              { name: 'Kimi (requires API key)', value: 'kimi' },
              { name: 'Z.ai (requires API key)', value: 'zai' },
            ],
            default: 'ask-every-time',
          },
        ]);

        provider = selectedProvider;
      }

      // Configure API key if needed (skip in quick mode)
      if (!useDefaults && (provider === 'kimi' || provider === 'zai')) {
        const { apiKey } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: provider === 'kimi' ? 'Enter Kimi API key:' : 'Enter Z.ai API key:',
            mask: '*',
          },
        ]);

        apiKeys[provider] = { apiKey };
      }
    }

    // Step 3: MCP Servers
    let mcpServers: string[] = [];
    const stepNumber = target === 'claude-code' ? '3/3' : '2/2';

    if (useDefaults) {
      // Default MCP servers
      mcpServers = ['grep', 'context7', 'playwright'];
      console.log(chalk.dim('Using default MCP servers: grep, context7, playwright\n'));
    } else {
      console.log(chalk.cyan('\n🔧 Quick Setup (' + stepNumber + ') - MCP Servers\n'));

      const result = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'mcpServers',
          message: 'Select MCP servers to enable:',
          choices: [
            { name: 'GitHub (requires GITHUB_TOKEN)', value: 'github' },
            { name: 'Web Search', value: 'web-search-prime', checked: true },
            { name: 'GitHub Code Search', value: 'grep', checked: true },
            { name: 'Playwright Browser Control', value: 'playwright' },
            { name: 'Z.ai Vision & Video', value: 'zai-mcp-server' },
            { name: 'Context7 Docs', value: 'context7' },
            { name: 'Notion', value: 'notion' },
          ],
        },
      ]);
      mcpServers = result.mcpServers;
    }

    // Configure MCP API keys (skip in quick mode)
    const mcpServerRequirements: Record<string, string[]> = {
      github: ['GITHUB_TOKEN'],
      notion: ['NOTION_API_KEY'],
    };

    if (!useDefaults) {
      for (const serverKey of mcpServers) {
        const requirements = mcpServerRequirements[serverKey];
        if (requirements) {
        const configMessage = 'Configure ' + requirements[0] + ' for ' + serverKey + '?';
        const { shouldConfigure } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldConfigure',
            message: configMessage,
            default: true,
          },
        ]);

        if (shouldConfigure) {
          const questions = requirements.map((key) => {
            return {
              type: 'password' as const,
              name: key,
              message: 'Enter ' + key + ':',
              mask: '*',
            };
          });
          const answers = await inquirer.prompt(questions);

          apiKeys[serverKey] = answers;
        }
        }
      }
    }

    // Save configuration
    await this.saveConfiguration({
      target,
      provider,
      mcpServers,
      apiKeys,
    });

    console.log(chalk.green('\n✓ Configuration saved to ~/.sylphx-flow/\n'));

    return {
      target,
      provider: provider as any,
      mcpServers,
      apiKeys,
    };
  }

  /**
   * Save configuration to global config files
   */
  private async saveConfiguration(result: QuickSetupResult): Promise<void> {
    // Save global settings
    await this.configService.saveSettings({
      version: '1.0.0',
      defaultTarget: result.target,
      firstRun: false,
      lastUpdated: new Date().toISOString(),
    });

    // Save provider config (Claude Code)
    if (result.target === 'claude-code' && result.provider) {
      const providerConfig = await this.configService.loadProviderConfig();
      providerConfig.claudeCode.defaultProvider = result.provider;

      // Save API keys
      if (result.provider === 'kimi' && result.apiKeys.kimi) {
        providerConfig.claudeCode.providers.kimi = {
          apiKey: result.apiKeys.kimi.apiKey,
          enabled: true,
        };
      }
      if (result.provider === 'zai' && result.apiKeys.zai) {
        providerConfig.claudeCode.providers.zai = {
          apiKey: result.apiKeys.zai.apiKey,
          enabled: true,
        };
      }

      await this.configService.saveProviderConfig(providerConfig);
    }

    // Save MCP config
    const mcpConfig = await this.configService.loadMCPConfig();
    for (const serverKey of result.mcpServers) {
      mcpConfig.servers[serverKey] = {
        enabled: true,
        env: result.apiKeys[serverKey] || {},
      };
    }
    await this.configService.saveMCPConfig(mcpConfig);
  }

  /**
   * Check if we should run quick setup
   */
  async shouldRun(): Promise<boolean> {
    return await this.configService.isFirstRun();
  }
}
