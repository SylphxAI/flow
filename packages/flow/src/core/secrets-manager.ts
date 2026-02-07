/**
 * Secrets Manager
 * Handles extraction, storage, and restoration of MCP secrets
 * Stores secrets in ~/.sylphx-flow/secrets/{project-hash}/
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Target } from '../types/target.types.js';
import { readJsonFileSafe } from '../utils/files/file-operations.js';
import type { ProjectManager } from './project-manager.js';
import { resolveTargetOrId } from './target-resolver.js';

export interface MCPSecrets {
  version: string;
  extractedAt: string;
  servers: Record<
    string,
    {
      env?: Record<string, string>;
      args?: string[];
    }
  >;
}

export class SecretsManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Extract MCP secrets from project config
   */
  async extractMCPSecrets(
    projectPath: string,
    _projectHash: string,
    targetOrId: Target | string
  ): Promise<MCPSecrets> {
    const target = resolveTargetOrId(targetOrId);
    // configFile is at project root, not in targetDir
    const configPath = path.join(projectPath, target.config.configFile);
    const mcpPath = target.config.mcpConfigPath;

    const secrets: MCPSecrets = {
      version: '1.0.0',
      extractedAt: new Date().toISOString(),
      servers: {},
    };

    if (!existsSync(configPath)) {
      return secrets;
    }

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      // Extract MCP server secrets using target's mcpConfigPath
      const mcpServers = config[mcpPath] as Record<string, unknown> | undefined;
      if (mcpServers) {
        for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
          if (typeof serverConfig !== 'object' || serverConfig === null) {
            continue;
          }
          const server = serverConfig as Record<string, unknown>;

          // Extract env vars (sensitive) - handle both 'env' and 'environment' keys
          const envVars = (server.env || server.environment) as Record<string, string> | undefined;
          if (envVars && typeof envVars === 'object' && Object.keys(envVars).length > 0) {
            secrets.servers[serverName] = {
              env: envVars,
            };
          }

          // Extract args (may contain secrets) - handle both 'args' and 'command' array
          const args = Array.isArray(server.args)
            ? server.args
            : Array.isArray(server.command)
              ? (server.command as string[]).slice(1)
              : undefined;
          if (args && args.length > 0) {
            if (!secrets.servers[serverName]) {
              secrets.servers[serverName] = {};
            }
            secrets.servers[serverName].args = args;
          }
        }
      }
    } catch (_error) {
      // Config file exists but cannot be parsed, skip
    }

    return secrets;
  }

  /**
   * Save secrets to ~/.sylphx-flow/secrets/{project-hash}/
   */
  async saveSecrets(projectHash: string, secrets: MCPSecrets): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);

    // Ensure secrets directory exists
    await fs.mkdir(paths.secretsDir, { recursive: true });

    // Save unencrypted (for now - can add encryption later)
    const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');
    await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2));
  }

  /**
   * Load secrets from storage
   */
  loadSecrets(projectHash: string): Promise<MCPSecrets | null> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');
    return readJsonFileSafe<MCPSecrets | null>(secretsPath, null);
  }

  /**
   * Restore secrets to project config
   */
  async restoreSecrets(
    projectPath: string,
    _projectHash: string,
    targetOrId: Target | string,
    secrets: MCPSecrets
  ): Promise<void> {
    if (Object.keys(secrets.servers).length === 0) {
      return;
    }

    const target = resolveTargetOrId(targetOrId);
    // configFile is at project root, not in targetDir
    const configPath = path.join(projectPath, target.config.configFile);
    const mcpPath = target.config.mcpConfigPath;

    if (!existsSync(configPath)) {
      return;
    }

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      // Restore secrets to MCP servers using target's mcpConfigPath
      const mcpServers = config[mcpPath] as Record<string, unknown> | undefined;
      if (mcpServers) {
        for (const [serverName, serverSecrets] of Object.entries(secrets.servers)) {
          const serverConfig = mcpServers[serverName] as Record<string, unknown> | undefined;
          if (serverConfig) {
            // Restore env vars - use the key that exists in config
            if (serverSecrets.env) {
              if ('environment' in serverConfig) {
                serverConfig.environment = serverSecrets.env;
              } else {
                serverConfig.env = serverSecrets.env;
              }
            }

            // Restore args
            if (serverSecrets.args) {
              serverConfig.args = serverSecrets.args;
            }
          }
        }
      }

      // Write updated config
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (_error) {
      // Config restore failed, skip
    }
  }

  /**
   * Clear secrets for a project
   */
  async clearSecrets(projectHash: string): Promise<void> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');

    if (existsSync(secretsPath)) {
      await fs.unlink(secretsPath);
    }
  }

  /**
   * Check if project has stored secrets
   */
  async hasSecrets(projectHash: string): Promise<boolean> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');
    return existsSync(secretsPath);
  }
}
