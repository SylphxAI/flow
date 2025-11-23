/**
 * Attach Manager
 * Handles merging Flow templates into user's project environment
 * Strategy: Direct override with backup, restore on cleanup
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import chalk from 'chalk';
import { ProjectManager } from './project-manager.js';
import type { BackupManifest } from './backup-manager.js';

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
  mcpServers: Array<{ name: string; config: any }>;
  hooks: Array<{ name: string; content: string }>;
  singleFiles: Array<{ path: string; content: string }>;
}

export class AttachManager {
  private projectManager: ProjectManager;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  /**
   * Get target-specific directory names
   */
  private getTargetDirs(target: 'claude-code' | 'opencode'): {
    agents: string;
    commands: string;
  } {
    return target === 'claude-code'
      ? { agents: 'agents', commands: 'commands' }
      : { agents: 'agent', commands: 'command' };
  }

  /**
   * Attach Flow templates to project
   * Strategy: Override with warning, backup handles restoration
   */
  async attach(
    projectPath: string,
    projectHash: string,
    target: 'claude-code' | 'opencode',
    templates: FlowTemplates,
    manifest: BackupManifest
  ): Promise<AttachResult> {
    const targetDir = this.projectManager.getTargetConfigDir(projectPath, target);

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

    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // 1. Attach agents
    await this.attachAgents(targetDir, target, templates.agents, result, manifest);

    // 2. Attach commands
    await this.attachCommands(targetDir, target, templates.commands, result, manifest);

    // 3. Attach rules (if applicable)
    if (templates.rules) {
      await this.attachRules(targetDir, target, templates.rules, result, manifest);
    }

    // 4. Attach MCP servers
    if (templates.mcpServers.length > 0) {
      await this.attachMCPServers(
        targetDir,
        target,
        templates.mcpServers,
        result,
        manifest
      );
    }

    // 5. Attach hooks
    if (templates.hooks.length > 0) {
      await this.attachHooks(targetDir, templates.hooks, result, manifest);
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
   */
  private async attachAgents(
    targetDir: string,
    target: 'claude-code' | 'opencode',
    agents: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const dirs = this.getTargetDirs(target);
    const agentsDir = path.join(targetDir, dirs.agents);
    await fs.mkdir(agentsDir, { recursive: true });

    for (const agent of agents) {
      const agentPath = path.join(agentsDir, agent.name);
      const existed = existsSync(agentPath);

      if (existed) {
        // Conflict: user has same agent
        result.agentsOverridden.push(agent.name);
        result.conflicts.push({
          type: 'agent',
          name: agent.name,
          action: 'overridden',
          message: `Agent '${agent.name}' overridden (will be restored on exit)`,
        });

        // Track in manifest
        manifest.backup.agents.user.push(agent.name);
      } else {
        result.agentsAdded.push(agent.name);
      }

      // Write Flow agent (override)
      await fs.writeFile(agentPath, agent.content);

      // Track Flow agent
      manifest.backup.agents.flow.push(agent.name);
    }
  }

  /**
   * Attach commands (override strategy)
   */
  private async attachCommands(
    targetDir: string,
    target: 'claude-code' | 'opencode',
    commands: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const dirs = this.getTargetDirs(target);
    const commandsDir = path.join(targetDir, dirs.commands);
    await fs.mkdir(commandsDir, { recursive: true });

    for (const command of commands) {
      const commandPath = path.join(commandsDir, command.name);
      const existed = existsSync(commandPath);

      if (existed) {
        // Conflict: user has same command
        result.commandsOverridden.push(command.name);
        result.conflicts.push({
          type: 'command',
          name: command.name,
          action: 'overridden',
          message: `Command '${command.name}' overridden (will be restored on exit)`,
        });

        // Track in manifest
        manifest.backup.commands.user.push(command.name);
      } else {
        result.commandsAdded.push(command.name);
      }

      // Write Flow command (override)
      await fs.writeFile(commandPath, command.content);

      // Track Flow command
      manifest.backup.commands.flow.push(command.name);
    }
  }

  /**
   * Attach rules (append strategy for AGENTS.md)
   */
  private async attachRules(
    targetDir: string,
    target: 'claude-code' | 'opencode',
    rules: string,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    // Claude Code: .claude/agents/AGENTS.md
    // OpenCode: .opencode/AGENTS.md
    const dirs = this.getTargetDirs(target);
    const rulesPath =
      target === 'claude-code'
        ? path.join(targetDir, dirs.agents, 'AGENTS.md')
        : path.join(targetDir, 'AGENTS.md');

    if (existsSync(rulesPath)) {
      // User has AGENTS.md, append Flow rules
      const userRules = await fs.readFile(rulesPath, 'utf-8');

      // Check if already appended (avoid duplicates)
      if (userRules.includes('<!-- Sylphx Flow Rules -->')) {
        // Already appended, skip
        return;
      }

      const merged = `${userRules}

<!-- ========== Sylphx Flow Rules (Auto-injected) ========== -->

${rules}

<!-- ========== End of Sylphx Flow Rules ========== -->
`;

      await fs.writeFile(rulesPath, merged);

      manifest.backup.rules = {
        path: rulesPath,
        originalSize: userRules.length,
        flowContentAdded: true,
      };
    } else {
      // User doesn't have AGENTS.md, create new
      await fs.mkdir(path.dirname(rulesPath), { recursive: true });
      await fs.writeFile(rulesPath, rules);

      manifest.backup.rules = {
        path: rulesPath,
        originalSize: 0,
        flowContentAdded: true,
      };
    }

    result.rulesAppended = true;
  }

  /**
   * Attach MCP servers (merge strategy)
   */
  private async attachMCPServers(
    targetDir: string,
    target: 'claude-code' | 'opencode',
    mcpServers: Array<{ name: string; config: any }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    // Claude Code: .claude/settings.json (mcp.servers)
    // OpenCode: .opencode/.mcp.json
    const configPath =
      target === 'claude-code'
        ? path.join(targetDir, 'settings.json')
        : path.join(targetDir, '.mcp.json');

    let config: any = {};

    if (existsSync(configPath)) {
      config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    }

    // Ensure mcp.servers exists
    if (!config.mcp) config.mcp = {};
    if (!config.mcp.servers) config.mcp.servers = {};

    // Add Flow MCP servers
    for (const server of mcpServers) {
      if (config.mcp.servers[server.name]) {
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

      // Override with Flow config
      config.mcp.servers[server.name] = server.config;
    }

    // Write updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    // Track in manifest
    manifest.backup.config = {
      path: configPath,
      hash: '', // TODO: calculate hash
      mcpServersCount: Object.keys(config.mcp.servers).length,
    };
  }

  /**
   * Attach hooks (override strategy)
   */
  private async attachHooks(
    targetDir: string,
    hooks: Array<{ name: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    const hooksDir = path.join(targetDir, 'hooks');
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
   * Attach single files (CLAUDE.md, .cursorrules, etc.)
   */
  private async attachSingleFiles(
    projectPath: string,
    singleFiles: Array<{ path: string; content: string }>,
    result: AttachResult,
    manifest: BackupManifest
  ): Promise<void> {
    for (const file of singleFiles) {
      const filePath = path.join(projectPath, file.path);
      const existed = existsSync(filePath);

      if (existed) {
        // User has file, append Flow content
        const userContent = await fs.readFile(filePath, 'utf-8');

        // Check if already appended
        if (userContent.includes('<!-- Sylphx Flow Enhancement -->')) {
          continue;
        }

        const merged = `${userContent}

---

**Sylphx Flow Enhancement:**

${file.content}
`;

        await fs.writeFile(filePath, merged);

        manifest.backup.singleFiles[file.path] = {
          existed: true,
          originalSize: userContent.length,
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
      console.log(
        chalk.yellow(`   • ${conflict.type}: ${conflict.name} - ${conflict.action}`)
      );
    }

    console.log(
      chalk.dim('\n   Don\'t worry! All overridden content will be restored on exit.\n')
    );
  }
}
