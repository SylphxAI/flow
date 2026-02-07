import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigService } from '../services/config-service.js';
import type { Target } from '../types/target.types.js';
import { tryResolveTarget } from './target-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProjectState {
  initialized: boolean;
  version: string | null;
  latestVersion: string | null;
  target: string | null;
  targetVersion: string | null;
  targetLatestVersion: string | null;
  components: {
    agents: { installed: boolean; count: number; version: string | null };
    rules: { installed: boolean; count: number; version: string | null };
    hooks: { installed: boolean; version: string | null };
    mcp: { installed: boolean; serverCount: number; version: string | null };
    outputStyles: { installed: boolean; version: string | null };
    slashCommands: { installed: boolean; count: number; version: string | null };
  };
  corrupted: boolean;
  outdated: boolean;
  lastUpdated: Date | null;
}

export type RecommendedAction =
  | 'FULL_INIT'
  | 'RUN_ONLY'
  | 'REPAIR'
  | 'UPGRADE'
  | 'UPGRADE_TARGET'
  | 'CLEAN_INIT';

export class StateDetector {
  private projectPath: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
  }

  async detect(): Promise<ProjectState> {
    const state: ProjectState = {
      initialized: false,
      version: null,
      latestVersion: await this.getLatestFlowVersion(),
      target: null,
      targetVersion: null,
      targetLatestVersion: null,
      components: {
        agents: { installed: false, count: 0, version: null },
        rules: { installed: false, count: 0, version: null },
        hooks: { installed: false, version: null },
        mcp: { installed: false, serverCount: 0, version: null },
        outputStyles: { installed: false, version: null },
        slashCommands: { installed: false, count: 0, version: null },
      },
      corrupted: false,
      outdated: false,
      lastUpdated: null,
    };

    try {
      // Check if initialized - use ConfigService for consistency
      state.initialized = await ConfigService.isInitialized(this.projectPath);

      if (!state.initialized) {
        return state; // Not initialized
      }

      // Read project settings
      const config = await ConfigService.loadProjectSettings(this.projectPath);
      state.version = config.version || null;
      state.target = config.target || null;
      state.lastUpdated = config.lastUpdated ? new Date(config.lastUpdated) : null;

      // Check if outdated
      if (state.version && state.latestVersion) {
        state.outdated = this.isVersionOutdated(state.version, state.latestVersion);
      }

      // Resolve target to get config
      const target = state.target ? tryResolveTarget(state.target) : null;

      // Check components based on target config
      if (target) {
        await this.checkComponentsForTarget(target, state);
      }

      // Check MCP
      const mcpConfig = await this.checkMCPConfig(target);
      state.components.mcp.installed = mcpConfig.exists;
      state.components.mcp.serverCount = mcpConfig.serverCount;
      state.components.mcp.version = mcpConfig.version;

      // Check target version
      if (state.target) {
        const targetInfo = await this.checkTargetVersion(state.target);
        state.targetVersion = targetInfo.version;
        state.targetLatestVersion = targetInfo.latestVersion;
      }

      // Check corruption
      state.corrupted = await this.checkCorruption(state);
    } catch (_error) {
      state.corrupted = true;
    }

    return state;
  }

  /**
   * Check components based on target configuration
   */
  private async checkComponentsForTarget(target: Target, state: ProjectState): Promise<void> {
    // Check agents using target's agentDir
    await this.checkComponent('agents', target.config.agentDir, '*.md', state);

    // Check rules based on target config
    if (target.config.rulesFile) {
      // Target has separate rules file (e.g., OpenCode's AGENTS.md)
      await this.checkFileComponent('rules', target.config.rulesFile, state);
      // Check output styles in rules file
      state.components.outputStyles.installed = await this.checkOutputStylesInFile(
        target.config.rulesFile
      );
    } else {
      // Rules are included in agent files (e.g., Claude Code)
      state.components.rules.installed = state.components.agents.installed;
      state.components.rules.count = state.components.agents.count;
      state.components.outputStyles.installed = state.components.agents.installed;
    }

    // Check hooks - look for hooks directory in configDir
    const hooksDir = path.join(target.config.configDir, 'hooks');
    await this.checkComponent('hooks', hooksDir, '*.js', state);

    // Check slash commands using target's slashCommandsDir
    if (target.config.slashCommandsDir) {
      await this.checkComponent('slashCommands', target.config.slashCommandsDir, '*.md', state);
    }
  }

  recommendAction(state: ProjectState): RecommendedAction {
    if (!state.initialized) {
      return 'FULL_INIT';
    }

    if (state.corrupted) {
      return 'REPAIR';
    }

    if (state.outdated && state.version !== state.latestVersion) {
      return 'UPGRADE';
    }

    if (
      state.targetVersion &&
      state.targetLatestVersion &&
      this.isVersionOutdated(state.targetVersion, state.targetLatestVersion)
    ) {
      return 'UPGRADE_TARGET';
    }

    return 'RUN_ONLY';
  }

  async explainState(state: ProjectState): Promise<string[]> {
    const explanations: string[] = [];

    if (!state.initialized) {
      explanations.push('Project not initialized yet');
      explanations.push('Run `bun dev:flow` to start initialization');
      return explanations;
    }

    if (state.corrupted) {
      explanations.push('Configuration corruption detected');
      explanations.push('Run `bun dev:flow --clean` to repair');
      return explanations;
    }

    if (state.outdated) {
      explanations.push(`Flow version outdated: ${state.version} → ${state.latestVersion}`);
      explanations.push('Run `bun dev:flow upgrade` to upgrade');
    }

    if (
      state.targetVersion &&
      state.targetLatestVersion &&
      this.isVersionOutdated(state.targetVersion, state.targetLatestVersion)
    ) {
      explanations.push(`${state.target} update available`);
      explanations.push(`Run \`bun dev:flow upgrade-target\` to upgrade`);
    }

    // Check components
    Object.entries(state.components).forEach(([name, component]) => {
      if (!component.installed) {
        explanations.push(`Missing ${name}`);
      }
    });

    if (explanations.length === 0) {
      explanations.push('Project status is normal');
      explanations.push('Run `bun dev:flow` to start Claude Code');
    }

    return explanations;
  }

  private async getLatestFlowVersion(): Promise<string | null> {
    try {
      // 从 package.json 获取当前版本
      const packagePath = path.join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      return packageJson.version || null;
    } catch {
      return null;
    }
  }

  private async checkComponent(
    componentName: keyof ProjectState['components'],
    componentPath: string,
    pattern: string,
    state: ProjectState
  ): Promise<void> {
    try {
      const fullPath = path.join(this.projectPath, componentPath);
      const exists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        state.components[componentName].installed = false;
        return;
      }

      // 计算文件数量
      const files = await fs.readdir(fullPath).catch(() => []);
      const count =
        pattern === '*.js'
          ? files.filter((f) => f.endsWith('.js')).length
          : pattern === '*.md'
            ? files.filter((f) => f.endsWith('.md')).length
            : files.length;

      // Component is only installed if it has files
      state.components[componentName].installed = count > 0;

      if (
        componentName === 'agents' ||
        componentName === 'slashCommands' ||
        componentName === 'rules'
      ) {
        state.components[componentName].count = count;
      }

      // 这里可以读取版本信息（如果保存了的话）
      const versionPath = path.join(fullPath, '.version');
      const versionExists = await fs
        .access(versionPath)
        .then(() => true)
        .catch(() => false);
      if (versionExists) {
        state.components[componentName].version = await fs.readFile(versionPath, 'utf-8');
      }
    } catch {
      state.components[componentName].installed = false;
    }
  }

  private async checkFileComponent(
    componentName: keyof ProjectState['components'],
    filePath: string,
    state: ProjectState
  ): Promise<void> {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const exists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);

      state.components[componentName].installed = exists;

      if (exists && componentName === 'rules') {
        // For AGENTS.md, count is always 1
        state.components[componentName].count = 1;
      }
    } catch {
      state.components[componentName].installed = false;
    }
  }

  private async checkOutputStylesInFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const exists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return false;
      }

      // Check if file contains output styles section
      const content = await fs.readFile(fullPath, 'utf-8');
      return content.includes('# Output Styles');
    } catch {
      return false;
    }
  }

  private async checkMCPConfig(
    target?: Target | null
  ): Promise<{ exists: boolean; serverCount: number; version: string | null }> {
    try {
      if (!target) {
        return { exists: false, serverCount: 0, version: null };
      }

      // Use target config for MCP file path and servers key
      const mcpPath = path.join(this.projectPath, target.config.configFile);
      const serversKey = target.config.mcpConfigPath;

      const exists = await fs
        .access(mcpPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return { exists: false, serverCount: 0, version: null };
      }

      // Use target's readConfig method for proper parsing (handles JSONC, etc.)
      let content: any;
      try {
        content = await target.readConfig(this.projectPath);
      } catch {
        // Fallback to plain JSON parsing
        content = JSON.parse(await fs.readFile(mcpPath, 'utf-8'));
      }

      const servers = content[serversKey] || {};

      return {
        exists: true,
        serverCount: Object.keys(servers).length,
        version: content.version || null,
      };
    } catch {
      return { exists: false, serverCount: 0, version: null };
    }
  }

  private async checkTargetVersion(
    targetId: string
  ): Promise<{ version: string | null; latestVersion: string | null }> {
    try {
      const target = tryResolveTarget(targetId);
      if (!target) {
        return { version: null, latestVersion: null };
      }

      // Check if target has executeCommand (CLI-based target)
      // Only CLI targets like claude-code have version checking capability
      if (target.executeCommand && target.id === 'claude-code') {
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);

        try {
          const { stdout } = await execAsync('claude --version');
          const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
          return {
            version: match ? match[1] : null,
            latestVersion: await this.getLatestClaudeVersion(),
          };
        } catch {
          return { version: null, latestVersion: null };
        }
      }

      return { version: null, latestVersion: null };
    } catch {
      return { version: null, latestVersion: null };
    }
  }

  private async getLatestClaudeVersion(): Promise<string | null> {
    // 可以从 npm 或官方网站获取最新版本
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('npm view @anthropic-ai/claude-code version');
      return stdout.trim();
    } catch {
      return null;
    }
  }

  private async checkCorruption(state: ProjectState): Promise<boolean> {
    // Check for contradictory states
    if (state.initialized && !state.target) {
      return true; // Initialized but no target
    }

    // Check required components based on target
    if (state.initialized && state.target) {
      const target = tryResolveTarget(state.target);
      // CLI-based targets (category: 'cli') require agents to be installed
      if (target && target.category === 'cli' && !state.components.agents.installed) {
        return true; // CLI target initialized but no agents
      }
    }

    return false;
  }

  private isVersionOutdated(current: string, latest: string): boolean {
    try {
      return this.compareVersions(current, latest) < 0;
    } catch {
      return false;
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
      if (parts1[i] !== parts2[i]) {
        return parts1[i] - parts2[i];
      }
    }

    return parts1.length - parts2.length;
  }
}
