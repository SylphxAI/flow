/**
 * Composable MCP installer - shared MCP installation logic
 * Used by targets through composition
 */

import chalk from 'chalk';
import { MCP_SERVER_REGISTRY, type MCPServerID } from '../../config/servers.js';
import { createMCPService } from '../../services/mcp-service.js';
import type { Target } from '../../types.js';
import {
  createSpinner,
  type MultiselectOption,
  promptMultiselect,
} from '../../utils/prompts/index.js';

export interface MCPInstallResult {
  selectedServers: MCPServerID[];
  serverConfigsMap: Record<MCPServerID, Record<string, string>>;
}

/**
 * MCP Installer interface
 */
export interface MCPInstaller {
  selectServers(options?: { quiet?: boolean }): Promise<MCPServerID[]>;
  configureServers(
    selectedServers: MCPServerID[],
    options?: { quiet?: boolean }
  ): Promise<Record<MCPServerID, Record<string, string>>>;
  installServers(
    selectedServers: MCPServerID[],
    serverConfigsMap: Record<MCPServerID, Record<string, string>>,
    options?: { quiet?: boolean }
  ): Promise<void>;
  setupMCP(options?: { quiet?: boolean; dryRun?: boolean }): Promise<MCPInstallResult>;
}

/**
 * Create an MCP installer instance
 * Handles server selection, configuration, and installation
 *
 * @param target - Target configuration object (dependency injection)
 */
export function createMCPInstaller(target: Target): MCPInstaller {
  const mcpService = createMCPService({ target });

  /**
   * Prompt user to select MCP servers
   */
  const selectServers = async (options: { quiet?: boolean } = {}): Promise<MCPServerID[]> => {
    const allServers = mcpService.getAllServerIds();
    const installedServers = await mcpService.getInstalledServerIds();

    if (!options.quiet) {
      console.log(chalk.cyan.bold('━━━ Configure MCP Tools ━━━\n'));
    }

    // Build multiselect options
    const multiselectOptions: MultiselectOption<MCPServerID>[] = allServers.map((id) => {
      const server = MCP_SERVER_REGISTRY[id];
      const isInstalled = installedServers.includes(id);
      const isRequired = server.required;
      const isDefault = server.defaultInInit;

      return {
        label: `${server.name} - ${server.description}${isRequired ? chalk.dim(' (required)') : ''}`,
        value: id,
        hint: isInstalled ? 'installed' : isDefault ? 'recommended' : undefined,
      };
    });

    // Determine initial values (required, installed, or default)
    const initialValues = allServers.filter((id) => {
      const server = MCP_SERVER_REGISTRY[id];
      const isInstalled = installedServers.includes(id);
      return server.required || isInstalled || server.defaultInInit;
    });

    const selectedServers = await promptMultiselect<MCPServerID>({
      message: 'Select MCP tools to install:',
      options: multiselectOptions,
      initialValues,
    });

    // Ensure all required servers are included
    const requiredServers = allServers.filter((id) => MCP_SERVER_REGISTRY[id].required);
    return [...new Set([...requiredServers, ...selectedServers])];
  };

  /**
   * Configure selected servers
   */
  const configureServers = async (
    selectedServers: MCPServerID[],
    options: { quiet?: boolean } = {}
  ): Promise<Record<MCPServerID, Record<string, string>>> => {
    const serversNeedingConfig = selectedServers.filter((id) => {
      const server = MCP_SERVER_REGISTRY[id];
      return server.envVars && Object.keys(server.envVars).length > 0;
    });

    const serverConfigsMap: Record<MCPServerID, Record<string, string>> = {};

    if (serversNeedingConfig.length > 0) {
      if (!options.quiet) {
        console.log(chalk.cyan.bold('\n━━━ Server Configuration ━━━\n'));
      }

      const collectedEnv: Record<string, string> = {};
      for (const serverId of serversNeedingConfig) {
        const configValues = await mcpService.configureServer(serverId, collectedEnv);
        serverConfigsMap[serverId] = configValues;
      }
    }

    return serverConfigsMap;
  };

  /**
   * Install servers with configuration
   */
  const installServers = async (
    selectedServers: MCPServerID[],
    serverConfigsMap: Record<MCPServerID, Record<string, string>>,
    options: { quiet?: boolean } = {}
  ): Promise<void> => {
    if (selectedServers.length === 0) {
      return;
    }

    // Only show spinner if not in quiet mode
    const spinner = options.quiet ? null : createSpinner();

    if (spinner) {
      spinner.start(
        `Installing ${selectedServers.length} MCP server${selectedServers.length > 1 ? 's' : ''}`
      );
    }

    try {
      await mcpService.installServers(selectedServers, serverConfigsMap);
      if (spinner) {
        spinner.stop(
          chalk.green(
            `✓ Installed ${chalk.cyan(selectedServers.length)} MCP server${selectedServers.length > 1 ? 's' : ''}`
          )
        );
      }
    } catch (error) {
      if (spinner) {
        spinner.stop(chalk.red('✗ Failed to install MCP servers'));
      }
      throw error;
    }
  };

  /**
   * Full MCP setup workflow: select, configure, and install
   */
  const setupMCP = async (
    options: { quiet?: boolean; dryRun?: boolean } = {}
  ): Promise<MCPInstallResult> => {
    // Select servers
    const selectedServers = await selectServers(options);

    if (selectedServers.length === 0) {
      return { selectedServers: [], serverConfigsMap: {} };
    }

    // Configure servers
    const serverConfigsMap = await configureServers(selectedServers, options);

    // Install servers
    if (!options.dryRun) {
      await installServers(selectedServers, serverConfigsMap, options);
    }

    return { selectedServers, serverConfigsMap };
  };

  return {
    selectServers,
    configureServers,
    installServers,
    setupMCP,
  };
}
