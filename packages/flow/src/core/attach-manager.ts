/**
 * Attach Manager
 * Handles merging Flow templates into user's project environment
 * Strategy: Direct override with backup, restore on cleanup
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MCP_SERVER_REGISTRY, type MCPServerID } from '../config/servers.js';
import { GlobalConfigService } from '../services/global-config.js';
import type { Target } from '../types/target.types.js';
import { attachItemsToDir, attachRulesFile } from './attach/index.js';
import type { BackupManifest } from './backup-manager.js';
import { resolveTargetOrId } from './target-resolver.js';

export interface AttachResult {
  agentsAdded: string[];
  agentsOverridden: string[];
  commandsAdded: string[];
  commandsOverridden: string[];
  skillsAdded: string[];
  skillsOverridden: string[];
  rulesAppended: boolean;
  mcpServersAdded: string[];
  mcpServersOverridden: string[];
  singleFilesMerged: string[];
  conflicts: ConflictInfo[];
}

export interface ConflictInfo {
  type: 'agent' | 'command' | 'skill' | 'mcp';
  name: string;
  action: 'overridden' | 'merged';
  message: string;
}

export interface FlowTemplates {
  agents: Array<{ name: string; content: string }>;
  commands: Array<{ name: string; content: string }>;
  skills: Array<{ name: string; content: string }>;
  rules?: string;
  mcpServers: Array<{ name: string; config: Record<string, unknown> }>;
  singleFiles: Array<{ path: string; content: string }>;
}

export class AttachManager {
  private configService: GlobalConfigService;

  constructor() {
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
   * Load global MCP servers from ~/.sylphx-flow/mcp-config.json
   * Uses SSOT: computeEffectiveServers for determining enabled servers
   */
  private async loadGlobalMCPServers(
    _target: Target
  ): Promise<Array<{ name: string; config: Record<string, unknown> }>> {
    try {
      const mcpConfig = await this.configService.loadMCPConfig();
      const enabledServerIds = this.configService.getEnabledServerIds(mcpConfig.servers);
      const effectiveServers = this.configService.getEffectiveMCPServers(mcpConfig.servers);

      const servers: Array<{ name: string; config: Record<string, unknown> }> = [];

      for (const serverId of enabledServerIds) {
        const serverDef = MCP_SERVER_REGISTRY[serverId as MCPServerID];
        const effective = effectiveServers[serverId as MCPServerID];

        if (!serverDef) {
          continue;
        }

        // Clone the server config from registry
        const config: Record<string, unknown> = { ...serverDef.config };

        // Merge environment variables from effective config (SSOT)
        if (effective.env && Object.keys(effective.env).length > 0) {
          if (config.type === 'stdio' || config.type === 'local') {
            config.env = { ...config.env, ...effective.env };
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
   */
  async attach(
    projectPath: string,
    targetOrId: Target | string,
    templates: FlowTemplates,
    manifest: BackupManifest
  ): Promise<AttachResult> {
    const target = resolveTargetOrId(targetOrId);

    const result: AttachResult = {
      agentsAdded: [],
      agentsOverridden: [],
      commandsAdded: [],
      commandsOverridden: [],
      skillsAdded: [],
      skillsOverridden: [],
      rulesAppended: false,
      mcpServersAdded: [],
      mcpServersOverridden: [],
      singleFilesMerged: [],
      conflicts: [],
    };

    // All paths are relative to projectPath, using target.config.* directly

    // 1. Attach agents
    await this.attachAgents(projectPath, target, templates.agents, result, manifest);

    // 2. Attach commands
    await this.attachCommands(projectPath, target, templates.commands, result, manifest);

    // 3. Attach skills (if target supports them)
    if (target.config.skillsDir && templates.skills.length > 0) {
      await this.attachSkills(projectPath, target, templates.skills, result, manifest);
    }

    // 4. Attach rules (if applicable)
    if (templates.rules) {
      await this.attachRules(projectPath, target, templates.rules, result, manifest);
    }

    // 5. Attach MCP servers (merge global + template servers)
    const globalMCPServers = await this.loadGlobalMCPServers(target);
    const allMCPServers = [...globalMCPServers, ...templates.mcpServers];

    if (allMCPServers.length > 0) {
      await this.attachMCPServers(projectPath, target, allMCPServers, result, manifest);
    }

    // 6. Attach single files
    if (templates.singleFiles.length > 0) {
      await this.attachSingleFiles(projectPath, target, templates.singleFiles, result, manifest);
    }

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
    result.conflicts.push(...stats.conflicts.map((c) => ({ ...c, type: 'agent' as const })));

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
    const { stats, manifest: itemManifest } = await attachItemsToDir(
      commands,
      commandsDir,
      'command'
    );

    // Update result
    result.commandsAdded.push(...stats.added);
    result.commandsOverridden.push(...stats.overridden);
    result.conflicts.push(...stats.conflicts.map((c) => ({ ...c, type: 'command' as const })));

    // Update manifest
    manifest.backup.commands.user.push(...itemManifest.user);
    manifest.backup.commands.flow.push(...itemManifest.flow);
  }

  /**
   * Attach skills (override strategy)
   * Skills are stored as <domain>/SKILL.md subdirectories
   */
  private async attachSkills(
    projectPath: string,
    target: Target,
    skills: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const skillsDir = path.join(projectPath, target.config.skillsDir!);
    await fs.mkdir(skillsDir, { recursive: true });

    for (const skill of skills) {
      // skill.name is like "auth/SKILL.md" - create subdirectory
      const skillPath = path.join(skillsDir, skill.name);
      const skillSubDir = path.dirname(skillPath);
      await fs.mkdir(skillSubDir, { recursive: true });

      const existed = existsSync(skillPath);
      if (existed) {
        result.skillsOverridden.push(skill.name);
        result.conflicts.push({
          type: 'skill',
          name: skill.name,
          action: 'overridden',
          message: `Skill '${skill.name}' overridden (will be restored on exit)`,
        });
        manifest.backup.skills.user.push(skillPath);
      } else {
        result.skillsAdded.push(skill.name);
      }

      await fs.writeFile(skillPath, skill.content);
      manifest.backup.skills.flow.push(skillPath);
    }
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

    // Approve MCP servers if target supports it (e.g., Claude Code needs enabledMcpjsonServers)
    if (target.approveMCPServers) {
      const serverNames = mcpServers.map((s) => s.name);
      await target.approveMCPServers(projectPath, serverNames);
    }

    // Track in manifest
    manifest.backup.config = {
      path: configPath,
      hash: await this.calculateFileHash(configPath),
      mcpServersCount: Object.keys(mcpContainer).length,
    };
  }

  /**
   * Attach single files (currently unused, output styles merged into core.md)
   * NOTE: These files are placed in the target config directory (.claude/ or .opencode/),
   * NOT in the project root directory.
   */
  private async attachSingleFiles(
    projectPath: string,
    target: Target,
    singleFiles: Array<{ path: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
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
}
