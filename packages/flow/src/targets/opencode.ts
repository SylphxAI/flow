import chalk from 'chalk';
import { MCP_SERVER_REGISTRY } from '../config/servers.js';
import type { AgentMetadata } from '../types/target-config.types.js';
import type { MCPServerConfigUnion, Target } from '../types.js';
import { fileUtils, generateHelpText, yamlUtils } from '../utils/config/target-utils.js';
import { CLIError } from '../utils/errors.js';
import { secretUtils } from '../utils/security/secret-utils.js';
import {
  detectTargetConfig,
  stripFrontMatter,
  transformMCPConfig as transformMCP,
} from './shared/index.js';

/**
 * Convert secret environment variables in a single MCP server config to file references
 */
async function convertServerSecrets(
  cwd: string,
  serverId: string,
  serverConfig: Record<string, unknown>
): Promise<void> {
  if (!serverConfig || typeof serverConfig !== 'object' || !('environment' in serverConfig)) {
    return;
  }

  const envVars = serverConfig.environment as Record<string, string>;
  if (!envVars || typeof envVars !== 'object') {
    return;
  }

  const serverDef = Object.values(MCP_SERVER_REGISTRY).find((s) => s.name === serverId);
  if (!serverDef?.envVars) {
    return;
  }

  const secretEnvVars: Record<string, string> = {};
  const nonSecretEnvVars: Record<string, string> = {};

  for (const [key, value] of Object.entries(envVars)) {
    const envConfig = serverDef.envVars[key];
    if (envConfig?.secret && value && !secretUtils.isFileReference(value)) {
      secretEnvVars[key] = value;
    } else {
      nonSecretEnvVars[key] = value;
    }
  }

  const convertedSecrets = await secretUtils.convertSecretsToFileReferences(cwd, secretEnvVars);
  serverConfig.environment = { ...nonSecretEnvVars, ...convertedSecrets };
}

/**
 * OpenCode target - composition approach with all original functionality
 */
export const opencodeTarget: Target = {
  id: 'opencode',
  name: 'OpenCode',
  description: 'OpenCode IDE with YAML front matter agents (.opencode/agent/*.md)',
  category: 'ide',
  isImplemented: true,
  isDefault: true,

  config: {
    configDir: '.opencode',
    agentDir: '.opencode/agent',
    agentExtension: '.md',
    agentFormat: 'yaml-frontmatter',
    stripYaml: false,
    flatten: false,
    configFile: 'opencode.jsonc',
    configSchema: 'https://opencode.ai/config.json',
    mcpConfigPath: 'mcp',
    rulesFile: 'AGENTS.md',
    outputStylesDir: undefined, // OpenCode doesn't support output styles as separate files
    slashCommandsDir: '.opencode/command', // OpenCode uses singular 'command', not 'commands'
    installation: {
      createAgentDir: true,
      createConfigFile: true,
      useSecretFiles: true,
    },
    supportsMCP: true,
  },

  /**
   * Transform agent content for OpenCode
   * OpenCode uses YAML front matter, but removes name field as it doesn't use it
   */
  async transformAgentContent(
    content: string,
    metadata?: AgentMetadata,
    _sourcePath?: string
  ): Promise<string> {
    // For OpenCode, we preserve YAML front matter but remove unsupported fields
    const { metadata: existingMetadata, content: baseContent } =
      await yamlUtils.extractFrontMatter(content);

    // Remove fields that OpenCode doesn't support:
    // - name: not used by OpenCode
    // - mode: OpenCode doesn't support 'both' mode (only 'primary')
    // - rules: OpenCode doesn't use rule references
    const { name, mode, rules, ...cleanMetadata } = existingMetadata;

    // If additional metadata is provided, merge it (but exclude unsupported fields)
    if (metadata) {
      const {
        name: additionalName,
        mode: additionalMode,
        rules: additionalRules,
        ...additionalCleanMetadata
      } = metadata;
      const mergedMetadata = { ...cleanMetadata, ...additionalCleanMetadata };
      return yamlUtils.addFrontMatter(baseContent, mergedMetadata);
    }

    // Return content with only OpenCode-supported fields
    return yamlUtils.addFrontMatter(baseContent, cleanMetadata);
  },

  /**
   * Transform MCP server configuration for OpenCode
   * Uses shared pure function for bidirectional conversion
   */
  transformMCPConfig(config: MCPServerConfigUnion, _serverId?: string): Record<string, unknown> {
    return transformMCP(config, 'opencode');
  },

  getConfigPath: (cwd: string) =>
    Promise.resolve(fileUtils.getConfigPath(opencodeTarget.config, cwd)),

  /**
   * Read OpenCode configuration with structure normalization
   */
  async readConfig(cwd: string): Promise<any> {
    const config = await fileUtils.readConfig(opencodeTarget.config, cwd);

    // Resolve any file references in the configuration
    const resolvedConfig = await secretUtils.resolveFileReferences(cwd, config);

    // Ensure the config has the expected structure
    if (!resolvedConfig.mcp) {
      resolvedConfig.mcp = {};
    }

    return resolvedConfig;
  },

  /**
   * Write OpenCode configuration with structure normalization
   */
  async writeConfig(cwd: string, config: Record<string, unknown>): Promise<void> {
    if (!config.mcp) {
      config.mcp = {};
    }

    if (opencodeTarget.config.installation?.useSecretFiles) {
      const mcpServers = config.mcp as Record<string, Record<string, unknown>>;
      await Promise.all(
        Object.entries(mcpServers).map(([serverId, serverConfig]) =>
          convertServerSecrets(cwd, serverId, serverConfig)
        )
      );
    }

    await fileUtils.writeConfig(opencodeTarget.config, cwd, config);
  },

  validateRequirements: (cwd: string) => fileUtils.validateRequirements(opencodeTarget.config, cwd),

  /**
   * Get detailed OpenCode-specific help text
   */
  getHelpText(): string {
    let help = generateHelpText(opencodeTarget.config);

    help += 'OpenCode-Specific Information:\n';
    help += '  Configuration File: opencode.jsonc\n';
    help += '  Schema: https://opencode.ai/config.json\n';
    help += '  Agent Format: Markdown with YAML front matter\n';
    help += '  MCP Integration: Automatic server discovery\n\n';

    help += 'Example Agent Structure:\n';
    help += '  ---\n';
    help += `  name: "My Agent"\n`;
    help += `  description: "Agent description"\n`;
    help += '  ---\n\n';
    help += '  Agent content here...\n\n';

    return help;
  },

  /**
   * Detect if this target is being used in the current environment
   */
  detectFromEnvironment(): boolean {
    return detectTargetConfig(process.cwd(), 'opencode.jsonc');
  },

  /**
   * Transform rules content for OpenCode
   * OpenCode doesn't need front matter in rules files (AGENTS.md)
   */
  transformRulesContent: stripFrontMatter,

  /**
   * Execute OpenCode CLI
   */
  async executeCommand(
    _systemPrompt: string,
    userPrompt: string,
    options: {
      verbose?: boolean;
      dryRun?: boolean;
      print?: boolean;
      continue?: boolean;
      agent?: string;
    } = {}
  ): Promise<void> {
    if (options.dryRun) {
      // Build the command for display
      const dryRunArgs = ['opencode'];
      if (options.print) {
        // Don't use --agent with 'run' (OpenCode bug)
        dryRunArgs.push('run');
        if (options.continue) {
          dryRunArgs.push('-c');
        }
        if (userPrompt && userPrompt.trim() !== '') {
          dryRunArgs.push(`"${userPrompt}"`);
        }
      } else {
        if (options.agent) {
          dryRunArgs.push('--agent', options.agent);
        }
        if (userPrompt && userPrompt.trim() !== '') {
          dryRunArgs.push('-p', `"${userPrompt}"`);
        }
      }

      console.log(chalk.cyan('Dry run - Would execute:'));
      console.log(chalk.bold(dryRunArgs.join(' ')));
      console.log(chalk.dim(`Agent: ${options.agent || 'coder'}`));
      console.log(chalk.dim(`User prompt: ${userPrompt.length} characters`));
      console.log('✓ Dry run completed successfully');
      return;
    }

    try {
      const { spawn } = await import('node:child_process');

      const args = [];

      // Handle print mode (headless)
      if (options.print) {
        // Note: Don't use --agent flag with 'run' command - OpenCode has a bug
        // TypeError: undefined is not an object (evaluating 'input.agent.model')
        // Default agent is 'coder' anyway
        args.push('run');
        // Use -c flag to continue last session (stdin is closed to prevent hanging)
        if (options.continue) {
          args.push('-c');
        }
        if (userPrompt && userPrompt.trim() !== '') {
          args.push(userPrompt);
        }
      } else {
        // Add agent flag for normal mode (TUI)
        if (options.agent) {
          args.push('--agent', options.agent);
        }
        // Normal mode with -p flag for prompt
        if (userPrompt && userPrompt.trim() !== '') {
          args.push('-p', userPrompt);
        }
      }

      // Always print command for debugging in loop/headless mode
      if (options.verbose || options.print) {
        console.log(chalk.dim(`$ opencode ${args.join(' ')}`));
      }

      await new Promise<void>((resolve, reject) => {
        const child = spawn('opencode', args, {
          // In print mode (headless), close stdin to prevent waiting for input
          // In normal mode, inherit all stdio for interactive TUI
          stdio: options.print ? ['ignore', 'inherit', 'inherit'] : 'inherit',
          shell: true,
          env: process.env, // Pass environment variables
        });

        child.on('spawn', () => {
          if (options.verbose) {
            console.log('✓ OpenCode process started');
          }
        });

        child.on('error', (error) => {
          console.error('✗ Error spawning OpenCode:', error);
          reject(error);
        });

        child.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`OpenCode exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new CLIError(`Failed to execute OpenCode: ${error.message}`, 'OPENCODE_ERROR');
      }
      throw error;
    }
  },
};
