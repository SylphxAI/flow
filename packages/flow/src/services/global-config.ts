/**
 * Global Configuration Service
 * Manages all Flow settings in ~/.sylphx-flow/
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';

export interface GlobalSettings {
  version: string;
  defaultTarget?: 'claude-code' | 'opencode';
  firstRun: boolean;
  lastUpdated: string;
}

export interface ProviderConfig {
  claudeCode: {
    defaultProvider: 'default' | 'kimi' | 'zai' | 'ask-every-time';
    providers: {
      kimi?: {
        apiKey?: string;
        enabled: boolean;
      };
      zai?: {
        apiKey?: string;
        enabled: boolean;
      };
    };
  };
}

export interface MCPServerConfig {
  enabled: boolean;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPConfig {
  version: string;
  servers: Record<string, MCPServerConfig>;
}

export class GlobalConfigService {
  private flowHomeDir: string;

  constructor() {
    this.flowHomeDir = path.join(os.homedir(), '.sylphx-flow');
  }

  /**
   * Get Flow home directory
   */
  getFlowHomeDir(): string {
    return this.flowHomeDir;
  }

  /**
   * Initialize Flow home directory structure
   */
  async initialize(): Promise<void> {
    const dirs = [
      this.flowHomeDir,
      path.join(this.flowHomeDir, 'sessions'),
      path.join(this.flowHomeDir, 'backups'),
      path.join(this.flowHomeDir, 'secrets'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Get global settings file path
   */
  private getSettingsPath(): string {
    return path.join(this.flowHomeDir, 'settings.json');
  }

  /**
   * Get provider config file path
   */
  private getProviderConfigPath(): string {
    return path.join(this.flowHomeDir, 'provider-config.json');
  }

  /**
   * Get MCP config file path
   */
  private getMCPConfigPath(): string {
    return path.join(this.flowHomeDir, 'mcp-config.json');
  }

  /**
   * Check if this is first run
   */
  async isFirstRun(): Promise<boolean> {
    const settingsPath = this.getSettingsPath();
    if (!existsSync(settingsPath)) {
      return true;
    }

    try {
      const settings = await this.loadSettings();
      return settings.firstRun !== false;
    } catch {
      return true;
    }
  }

  /**
   * Load global settings
   */
  async loadSettings(): Promise<GlobalSettings> {
    const settingsPath = this.getSettingsPath();

    if (!existsSync(settingsPath)) {
      return {
        version: '1.0.0',
        firstRun: true,
        lastUpdated: new Date().toISOString(),
      };
    }

    const data = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Save global settings
   */
  async saveSettings(settings: GlobalSettings): Promise<void> {
    await this.initialize();
    const settingsPath = this.getSettingsPath();
    settings.lastUpdated = new Date().toISOString();
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  }

  /**
   * Load provider config
   */
  async loadProviderConfig(): Promise<ProviderConfig> {
    const configPath = this.getProviderConfigPath();

    if (!existsSync(configPath)) {
      return {
        claudeCode: {
          defaultProvider: 'ask-every-time',
          providers: {
            kimi: { enabled: false },
            zai: { enabled: false },
          },
        },
      };
    }

    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Save provider config
   */
  async saveProviderConfig(config: ProviderConfig): Promise<void> {
    await this.initialize();
    const configPath = this.getProviderConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Load MCP config
   */
  async loadMCPConfig(): Promise<MCPConfig> {
    const configPath = this.getMCPConfigPath();

    if (!existsSync(configPath)) {
      return {
        version: '1.0.0',
        servers: {},
      };
    }

    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Save MCP config
   */
  async saveMCPConfig(config: MCPConfig): Promise<void> {
    await this.initialize();
    const configPath = this.getMCPConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Get enabled MCP servers
   */
  async getEnabledMCPServers(): Promise<Record<string, MCPServerConfig>> {
    const config = await this.loadMCPConfig();
    const enabled: Record<string, MCPServerConfig> = {};

    for (const [name, serverConfig] of Object.entries(config.servers)) {
      if (serverConfig.enabled) {
        enabled[name] = serverConfig;
      }
    }

    return enabled;
  }

  /**
   * Update default target
   */
  async setDefaultTarget(target: 'claude-code' | 'opencode'): Promise<void> {
    const settings = await this.loadSettings();
    settings.defaultTarget = target;
    await this.saveSettings(settings);
  }

  /**
   * Get default target
   */
  async getDefaultTarget(): Promise<'claude-code' | 'opencode' | undefined> {
    const settings = await this.loadSettings();
    return settings.defaultTarget;
  }

  /**
   * Mark first run as complete
   */
  async markFirstRunComplete(): Promise<void> {
    const settings = await this.loadSettings();
    settings.firstRun = false;
    await this.saveSettings(settings);
  }
}
