/**
 * Secrets Manager
 * Handles extraction, storage, and restoration of MCP secrets
 * Stores secrets in ~/.sylphx-flow/secrets/{project-hash}/
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import { ProjectManager } from './project-manager.js';

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
    projectHash: string,
    target: 'claude-code' | 'opencode'
  ): Promise<MCPSecrets> {
    const targetDir = this.projectManager.getTargetConfigDir(projectPath, target);
    const configPath =
      target === 'claude-code'
        ? path.join(targetDir, 'settings.json')
        : path.join(targetDir, '.mcp.json');

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

      // Extract MCP server secrets
      if (config.mcp && config.mcp.servers) {
        for (const [serverName, serverConfig] of Object.entries(config.mcp.servers)) {
          const server = serverConfig as any;

          // Extract env vars (sensitive)
          if (server.env && Object.keys(server.env).length > 0) {
            secrets.servers[serverName] = {
              env: server.env,
            };
          }

          // Extract args (may contain secrets)
          if (server.args && Array.isArray(server.args)) {
            if (!secrets.servers[serverName]) {
              secrets.servers[serverName] = {};
            }
            secrets.servers[serverName].args = server.args;
          }
        }
      }
    } catch (error) {
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
  async loadSecrets(projectHash: string): Promise<MCPSecrets | null> {
    const paths = this.projectManager.getProjectPaths(projectHash);
    const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');

    if (!existsSync(secretsPath)) {
      return null;
    }

    try {
      const data = await fs.readFile(secretsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Restore secrets to project config
   */
  async restoreSecrets(
    projectPath: string,
    projectHash: string,
    target: 'claude-code' | 'opencode',
    secrets: MCPSecrets
  ): Promise<void> {
    if (Object.keys(secrets.servers).length === 0) {
      return;
    }

    const targetDir = this.projectManager.getTargetConfigDir(projectPath, target);
    const configPath =
      target === 'claude-code'
        ? path.join(targetDir, 'settings.json')
        : path.join(targetDir, '.mcp.json');

    if (!existsSync(configPath)) {
      return;
    }

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      // Restore secrets to MCP servers
      if (config.mcp && config.mcp.servers) {
        for (const [serverName, serverSecrets] of Object.entries(secrets.servers)) {
          if (config.mcp.servers[serverName]) {
            // Restore env vars
            if (serverSecrets.env) {
              config.mcp.servers[serverName].env = serverSecrets.env;
            }

            // Restore args
            if (serverSecrets.args) {
              config.mcp.servers[serverName].args = serverSecrets.args;
            }
          }
        }
      }

      // Write updated config
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      // Config restore failed, skip
    }
  }

  /**
   * Encrypt secrets (optional - for enhanced security)
   */
  private async encrypt(data: string): Promise<string> {
    // Use machine ID + user HOME as stable key source
    const keySource = `${os.homedir()}-${os.hostname()}`;
    const key = crypto.scryptSync(keySource, 'sylphx-flow-salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt secrets (optional)
   */
  private async decrypt(encrypted: string): Promise<string> {
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');

    const keySource = `${os.homedir()}-${os.hostname()}`;
    const key = crypto.scryptSync(keySource, 'sylphx-flow-salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
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
