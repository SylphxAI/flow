/**
 * Attach Manager
 * Handles merging Flow templates into user's project environment
 * Strategy: Direct override with backup, restore on cleanup
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { MCP_SERVER_REGISTRY } from '../config/servers.js';
import { GlobalConfigService } from '../services/global-config.js';
import type { Target } from '../types/target.types.js';
import { attachItemsToDir, attachRulesFile } from './attach/index.js';
import type { BackupManifest } from './backup-manager.js';
import type { ProjectManager } from './project-manager.js';
import { targetManager } from './target-manager.js';

export interface AttachResult {
  agentsAdded: string[];
  agentsOverridden: string[];
  commandsAdded: string[];
  commandsOverridden: string[];
  rulesAppended: boolean;
  mcpServersAdded: string[];
  mcpServersOverridden: string[];
  singleFilesMerged: string[];
  hooksAdded: string[];
  hooksOverridden: string[];
  conflicts: ConflictInfo[];
}

export interface ConflictInfo {
  type: 'agent' | 'command' | 'mcp' | 'hook';
  name: string;
  action: 'overridden' | 'merged';
  message: string;
}

export interface FlowTemplates {
  agents: Array<{ name: string; content: string }>;
  commands: Array<{ name: string; content: string }>;
  rules?: string;
  mcpServers: Array<{ name: string; config: Record<string, unknown> }>;
  hooks: Array<{ name: string; content: string }>;
  singleFiles: Array<{ path: string; content: string }>;
}

export class AttachManager {
  private configService: GlobalConfigService;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
    this.configService = new GlobalConfigService();
  }

  /**
   * Calculate SHA256 hash of file content
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return createHash('sha256').update(content).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Resolve target from ID string to Target object
   */
  private resolveTarget(targetId: string): Target {
    const targetOption = targetManager.getTarget(targetId);
    if (targetOption._tag === 'None') {
      throw new Error(`Unknown target: ${targetId}`);
    }
    return targetOption.value;
  }

  /**
   * Load global MCP servers from ~/.sylphx-flow/mcp-config.json
   */
  private async loadGlobalMCPServers(
    _target: Target
  ): Promise<Array<{ name: string; config: Record<string, unknown> }>> {
    try {
      const enabledServers = await this.configService.getEnabledMCPServers();
      const servers: Array<{ name: string; config: Record<string, unknown> }> = [];

      for (const [serverKey, serverConfig] of Object.entries(enabledServers)) {
        // Lookup server definition in registry
        const serverDef = MCP_SERVER_REGISTRY[serverKey];

        if (!serverDef) {
          console.warn(`MCP server '${serverKey}' not found in registry, skipping`);
          continue;
        }

        // Clone the server config from registry
        const config: Record<string, unknown> = { ...serverDef.config };

        // Merge environment variables from global config
        if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
          if (config.type === 'stdio' || config.type === 'local') {
            config.env = { ...config.env, ...serverConfig.env };
          }
        }

        servers.push({ name: serverDef.name, config });
      }

      return servers;
    } catch (_error) {
      // If global config doesn't exist or fails to load, return empty array
      return [];
    }
  }

  /**
   * Attach Flow templates to project
   * Strategy: Override with warning, backup handles restoration
   * @param projectPath - Project root path
   * @param _projectHash - Project hash (unused but kept for API compatibility)
   * @param targetOrId - Target object or target ID string
   * @param templates - Flow templates to attach
   * @param manifest - Backup manifest to track changes
   */
  async attach(
    projectPath: string,
    _projectHash: string,
    targetOrId: Target | string,
    templates: FlowTemplates,
    manifest: BackupManifest
  ): Promise<AttachResult> {
    // Resolve target from ID if needed
    const target = typeof targetOrId === 'string' ? this.resolveTarget(targetOrId) : targetOrId;

    const result: AttachResult = {
      agentsAdded: [],
      agentsOverridden: [],
      commandsAdded: [],
      commandsOverridden: [],
      rulesAppended: false,
      mcpServersAdded: [],
      mcpServersOverridden: [],
      singleFilesMerged: [],
      hooksAdded: [],
      hooksOverridden: [],
      conflicts: [],
    };

    // All paths are relative to projectPath, using target.config.* directly

    // 1. Attach agents
    await this.attachAgents(projectPath, target, templates.agents, result, manifest);

    // 2. Attach commands
    await this.attachCommands(projectPath, target, templates.commands, result, manifest);

    // 3. Attach rules (if applicable)
    if (templates.rules) {
      await this.attachRules(projectPath, target, templates.rules, result, manifest);
    }

    // 4. Attach MCP servers (merge global + template servers)
    const globalMCPServers = await this.loadGlobalMCPServers(target);
    const allMCPServers = [...globalMCPServers, ...templates.mcpServers];

    if (allMCPServers.length > 0) {
      await this.attachMCPServers(projectPath, target, allMCPServers, result, manifest);
    }

    // 5. Attach hooks
    if (templates.hooks.length > 0) {
      await this.attachHooks(projectPath, target, templates.hooks, result, manifest);
    }

    // 6. Attach single files
    if (templates.singleFiles.length > 0) {
      await this.attachSingleFiles(projectPath, templates.singleFiles, result, manifest);
    }

    // Show conflict warnings
    this.showConflictWarnings(result);

    return result;
  }

  /**
   * Attach agents (override strategy)
   * Uses shared attachItemsToDir function
   */
  private async attachAgents(
    projectPath: string,
    target: Target,
    agents: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const agentsDir = path.join(projectPath, target.config.agentDir);
    const { stats, manifest: itemManifest } = await attachItemsToDir(agents, agentsDir, 'agent');

    // Update result
    result.agentsAdded.push(...stats.added);
    result.agentsOverridden.push(...stats.overridden);
    result.conflicts.push(
      ...stats.conflicts.map((c) => ({ ...c, type: 'agent' as const }))
    );

    // Update manifest
    manifest.backup.agents.user.push(...itemManifest.user);
    manifest.backup.agents.flow.push(...itemManifest.flow);
  }

  /**
   * Attach commands (override strategy)
   * Uses shared attachItemsToDir function
   */
  private async attachCommands(
    projectPath: string,
    target: Target,
    commands: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const commandsDir = path.join(projectPath, target.config.slashCommandsDir);
    const { stats, manifest: itemManifest } = await attachItemsToDir(commands, commandsDir, 'command');

    // Update result
    result.commandsAdded.push(...stats.added);
    result.commandsOverridden.push(...stats.overridden);
    result.conflicts.push(
      ...stats.conflicts.map((c) => ({ ...c, type: 'command' as const }))
    );

    // Update manifest
    manifest.backup.commands.user.push(...itemManifest.user);
    manifest.backup.commands.flow.push(...itemManifest.flow);
  }

  /**
   * Attach rules (append strategy for AGENTS.md)
   * Uses shared attachRulesFile function
   */
  private async attachRules(
    projectPath: string,
    target: Target,
    rules: string,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const rulesPath = target.config.rulesFile
      ? path.join(projectPath, target.config.rulesFile)
      : path.join(projectPath, target.config.agentDir, 'AGENTS.md');

    const { originalSize, flowContentAdded } = await attachRulesFile(rulesPath, rules);

    if (flowContentAdded) {
      manifest.backup.rules = {
        path: rulesPath,
        originalSize,
        flowContentAdded: true,
      };
      result.rulesAppended = true;
    }
  }

  /**
   * Attach MCP servers (merge strategy)
   * Uses target.config.configFile and target.config.mcpConfigPath
   * Note: configFile is relative to project root, not targetDir
   */
  private async attachMCPServers(
    projectPath: string,
    target: Target,
    mcpServers: Array<{ name: string; config: Record<string, unknown> }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    // Use target config for file path and MCP config structure
    // Claude Code: .mcp.json at project root with mcpServers key
    // OpenCode: opencode.jsonc at project root with mcp key
    const configPath = path.join(projectPath, target.config.configFile);
    const mcpPath = target.config.mcpConfigPath;

    let config: Record<string, unknown> = {};

    if (existsSync(configPath)) {
      config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    }

    // Get or create the MCP servers object at the correct path
    // Claude Code: config.mcpServers = {}
    // OpenCode: config.mcp = {}
    let mcpContainer = config[mcpPath] as Record<string, unknown> | undefined;
    if (!mcpContainer) {
      mcpContainer = {};
      config[mcpPath] = mcpContainer;
    }

    // Add Flow MCP servers
    for (const server of mcpServers) {
      // Transform the server config for this target
      const transformedConfig = target.transformMCPConfig(server.config as any, server.name);

      if (mcpContainer[server.name]) {
        // Conflict: user has same MCP server
        result.mcpServersOverridden.push(server.name);
        result.conflicts.push({
          type: 'mcp',
          name: server.name,
          action: 'overridden',
          message: `MCP server '${server.name}' overridden (will be restored on exit)`,
        });
      } else {
        result.mcpServersAdded.push(server.name);
      }

      // Override with Flow config (transformed for target)
      mcpContainer[server.name] = transformedConfig;
    }

    // Write updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    // Track in manifest
    manifest.backup.config = {
      path: configPath,
      hash: await this.calculateFileHash(configPath),
      mcpServersCount: Object.keys(mcpContainer).length,
    };
  }

  /**
   * Attach hooks (override strategy)
   */
  private async attachHooks(
    projectPath: string,
    target: Target,
    hooks: Array<{ name: string; content: string }>,
    result: AttachResult,
    _manifest: BackupManifest
  ): Promise<void> {
    // Hooks are in configDir/hooks
    const hooksDir = path.join(projectPath, target.config.configDir, 'hooks');
    await fs.mkdir(hooksDir, { recursive: true });

    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook.name);
      const existed = existsSync(hookPath);

      if (existed) {
        result.hooksOverridden.push(hook.name);
        result.conflicts.push({
          type: 'hook',
          name: hook.name,
          action: 'overridden',
          message: `Hook '${hook.name}' overridden (will be restored on exit)`,
        });
      } else {
        result.hooksAdded.push(hook.name);
      }

      await fs.writeFile(hookPath, hook.content);
    }
  }

  /**
   * Attach single files (output styles like silent.md)
   * NOTE: These files are placed in the target config directory (.claude/ or .opencode/),
   * NOT in the project root directory.
   */
  private async attachSingleFiles(
    projectPath: string,
    singleFiles: Array<{ path: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    // Get target from manifest to determine config directory
    const targetOption = targetManager.getTarget(manifest.target);
    if (targetOption._tag === 'None') {
      return; // Unknown target, skip
    }
    const target = targetOption.value;

    for (const file of singleFiles) {
      // Write to target config directory (e.g., .claude/ or .opencode/)
      const filePath = path.join(projectPath, target.config.configDir, file.path);
      const existed = existsSync(filePath);

      if (existed) {
        // User has file, overwrite with Flow content (backed up already)
        await fs.writeFile(filePath, file.content);

        manifest.backup.singleFiles[file.path] = {
          existed: true,
          originalSize: (await fs.readFile(filePath, 'utf-8')).length,
          flowContentAdded: true,
        };
      } else {
        // Create new file
        await fs.writeFile(filePath, file.content);

        manifest.backup.singleFiles[file.path] = {
          existed: false,
          originalSize: 0,
          flowContentAdded: true,
        };
      }

      result.singleFilesMerged.push(file.path);
    }
  }

  /**
   * Show conflict warnings to user
   */
  private showConflictWarnings(result: AttachResult): void {
    if (result.conflicts.length === 0) {
      return;
    }

    console.log(chalk.yellow('\n⚠️  Conflicts detected:\n'));

    for (const conflict of result.conflicts) {
      console.log(chalk.yellow(`   • ${conflict.type}: ${conflict.name} - ${conflict.action}`));
    }

    console.log(chalk.dim("\n   Don't worry! All overridden content will be restored on exit.\n"));
  }
}
