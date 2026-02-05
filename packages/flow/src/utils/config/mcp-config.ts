import chalk from 'chalk';

import type { EnvVarConfig, MCPServerDefinition, MCPServerID } from '../../config/servers.js';
import { getAllServerIDs, MCP_SERVER_REGISTRY } from '../../config/servers.js';
import { targetManager } from '../../core/target-manager.js';
import { log, promptPassword, promptSelect, promptText } from '../prompts/index.js';
import { getNestedProperty, setNestedProperty } from './target-config.js';

interface MCPConfigOptions {
  serverId?: MCPServerID;
  existingValues: Record<string, string>;
  targetId: string;
  cwd: string;
}

interface ServerConfiguration {
  id: MCPServerID;
  name: string;
  description: string;
  fields: ConfigField[];
}

interface ConfigField {
  name: string;
  description: string;
  required: boolean;
  secret: boolean;
  defaultValue?: string;
  currentValue?: string;
  options?: string[];
}

export class MCPConfigurator {
  private targetId: string;
  private cwd: string;
  private serverId?: MCPServerID;
  private existingValues: Record<string, string>;

  constructor(options: MCPConfigOptions) {
    this.targetId = options.targetId;
    this.cwd = options.cwd;
    this.serverId = options.serverId;
    this.existingValues = options.existingValues;
  }

  async configure(): Promise<{ values: Record<string, string>; serverId?: MCPServerID }> {
    console.clear();
    console.log(chalk.cyan.bold('⚙️ MCP Configuration'));
    console.log(chalk.gray('─'.repeat(50)));

    // Step 1: Select server if not provided
    if (!this.serverId) {
      this.serverId = await this.selectServer();
    }

    const server = MCP_SERVER_REGISTRY[this.serverId];
    if (!server) {
      throw new Error(`Server not found: ${this.serverId}`);
    }

    console.log(chalk.blue(`\n▸ ${server.name}`));
    console.log(chalk.gray(`  ${server.description}`));

    // Step 2: Configure server if it has environment variables
    if (server.envVars && Object.keys(server.envVars).length > 0) {
      const values = await this.configureServer(server);
      return { values, serverId: this.serverId };
    }
    log.info('No configuration required for this server');
    return { values: {}, serverId: this.serverId };
  }

  private async selectServer(): Promise<MCPServerID> {
    const availableServers = getAllServerIDs().map((id) => {
      const server = MCP_SERVER_REGISTRY[id];
      return {
        label: `${server?.name || id} - ${server?.description || 'Unknown server'}`,
        value: id,
      };
    });

    return promptSelect({
      message: 'Select MCP server to configure:',
      options: availableServers,
    });
  }

  private async configureServer(server: MCPServerDefinition): Promise<Record<string, string>> {
    const fields = this.buildConfigFields(server);
    const values: Record<string, string> = {};

    console.log(chalk.cyan('\n▸ Configuration'));
    console.log(chalk.gray('─'.repeat(30)));

    for (const field of fields) {
      const value = await this.configureField(field);
      values[field.name] = value;
    }

    return values;
  }

  private buildConfigFields(server: MCPServerDefinition): ConfigField[] {
    const fields: ConfigField[] = [];

    if (server.envVars) {
      Object.entries(server.envVars).forEach(([key, config]) => {
        const envConfig = config as EnvVarConfig;
        let options: string[] | undefined;

        if (key === 'EMBEDDING_MODEL') {
          options = ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'];
        } else if (key === 'GEMINI_MODEL') {
          options = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        }

        fields.push({
          name: key,
          description: envConfig.description,
          required: envConfig.required,
          secret: envConfig.secret || false,
          defaultValue: envConfig.default,
          currentValue: this.existingValues[key],
          options,
        });
      });
    }

    return fields;
  }

  private async configureField(field: ConfigField): Promise<string> {
    const currentValue = field.currentValue || field.defaultValue || '';

    if (field.options) {
      // Use select input for options
      const value = await promptSelect({
        message: `${field.name}${field.required ? chalk.red('*') : ''}:`,
        options: field.options.map((opt) => ({ label: opt, value: opt })),
        initialValue: currentValue || field.options[0],
      });

      log.info(`  ${field.description}`);
      return value;
    }

    if (field.secret) {
      // Use password input for secrets
      const value = await promptPassword({
        message: `${field.name}${field.required ? chalk.red('*') : ''}:`,
        validate: (input) => {
          if (field.required && !input.trim()) {
            return `${field.name} is required`;
          }
        },
      });

      log.info(`  ${field.description}`);
      return value;
    }

    // Use regular text input
    const value = await promptText({
      message: `${field.name}${field.required ? chalk.red('*') : ''}:`,
      defaultValue: currentValue,
      validate: (input) => {
        if (field.required && !input.trim()) {
          return `${field.name} is required`;
        }
      },
    });

    log.info(`  ${field.description}`);
    return value;
  }
}

export async function configureMCP(
  serverId: MCPServerID | undefined,
  existingValues: Record<string, string>,
  targetId: string,
  cwd: string
): Promise<{ values: Record<string, string>; serverId?: MCPServerID }> {
  const configurator = new MCPConfigurator({
    serverId,
    existingValues,
    targetId,
    cwd,
  });

  const result = await configurator.configure();

  // Save configuration
  if (result.serverId) {
    const targetOption = targetManager.getTarget(targetId);
    if (targetOption._tag === 'None') {
      throw new Error(`Target not found: ${targetId}`);
    }

    const target = targetOption.value;
    const config = await target.readConfig(cwd);
    const mcpConfigPath = target.config.mcpConfigPath;
    const mcpSection = getNestedProperty(config, mcpConfigPath) || {};

    const server = MCP_SERVER_REGISTRY[result.serverId];
    const serverConfig_env = server.config.type === 'local' ? server.config.environment : {};

    const updatedEnv = { ...serverConfig_env };
    for (const [key, value] of Object.entries(result.values)) {
      if (value && value.trim() !== '') {
        updatedEnv[key] = value;
      }
    }

    mcpSection[server.name] = {
      ...server.config,
      environment: updatedEnv,
    };

    setNestedProperty(config, mcpConfigPath, mcpSection);
    await target.writeConfig(cwd, config);
  }

  return result;
}
