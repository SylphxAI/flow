/**
 * Target system type definitions
 * Types for target platforms (Claude Code, OpenCode, etc.)
 */

import type { CommonOptions, SetupResult } from './common.types.js';
import type { MCPServerConfigUnion } from './mcp.types.js';

/**
 * Target-specific configuration
 * Defines how agents, configs, and other artifacts are structured for each target
 */
export interface TargetConfig {
  /** Base configuration directory (e.g., '.claude', '.opencode') */
  configDir: string;
  /** Directory where agents are installed */
  agentDir: string;
  /** File extension for agent files */
  agentExtension: string;
  /** Format of agent files */
  agentFormat: 'yaml-frontmatter' | 'json' | 'yaml' | 'markdown';
  /** Whether to strip YAML front matter from content */
  stripYaml: boolean;
  /** Whether to flatten directory structure */
  flatten: boolean;
  /** Configuration file name */
  configFile: string;
  /** Configuration file schema URL (optional) */
  configSchema: string | null;
  /** Path to MCP configuration in config file */
  mcpConfigPath: string;
  /** Rules file path (optional, relative to project root) */
  rulesFile?: string;
  /** Output styles directory (optional, relative to project root) */
  outputStylesDir?: string;
  /** Slash commands directory (optional, relative to project root) */
  slashCommandsDir?: string;
  /** Skills directory (optional, relative to project root) */
  skillsDir?: string;
  /** Installation-specific configuration */
  installation: {
    /** Whether to create the agent directory */
    createAgentDir: boolean;
    /** Whether to create the config file */
    createConfigFile: boolean;
    /** Whether to use secret file references for sensitive environment variables */
    useSecretFiles?: boolean;
  };
  /** Whether this target supports MCP servers */
  supportsMCP?: boolean;
}

/**
 * Target interface - composition-based design
 * Targets are implemented as plain objects with functions, not classes
 *
 * Each target represents a platform that can host AI agents and MCP servers
 * (e.g., Claude Code CLI, OpenCode, VS Code with Continue, etc.)
 */
export interface Target {
  // Metadata
  /** Internal identifier used in CLI commands */
  readonly id: string;
  /** Display name for the target */
  readonly name: string;
  /** Human-readable description */
  readonly description: string;
  /** Target category for grouping */
  readonly category: 'ide' | 'editor' | 'cli';
  /** Whether this target is the default when no target is specified */
  readonly isDefault?: boolean;
  /** Whether this target is fully implemented */
  readonly isImplemented: boolean;

  // Configuration
  /** Target-specific configuration */
  readonly config: TargetConfig;

  // Required transformation methods
  /** Transform agent content for the target */
  transformAgentContent(
    content: string,
    metadata?: Record<string, unknown>,
    sourcePath?: string
  ): Promise<string>;

  /** Transform MCP server configuration for the target */
  transformMCPConfig(config: MCPServerConfigUnion, serverId?: string): Record<string, unknown>;

  // Required configuration methods
  /** Get the configuration file path for the target */
  getConfigPath(cwd: string): Promise<string>;

  /** Read the target's configuration file */
  readConfig(cwd: string): Promise<Record<string, unknown>>;

  /** Write the target's configuration file */
  writeConfig(cwd: string, config: Record<string, unknown>): Promise<void>;

  /** Validate target-specific requirements */
  validateRequirements(cwd: string): Promise<void>;

  /** Get target-specific help text */
  getHelpText(): string;

  // Optional methods
  /** Execute command with the target (optional - not all targets need to support execution) */
  executeCommand?(
    systemPrompt: string,
    userPrompt: string,
    options: Record<string, unknown>
  ): Promise<void>;

  /** Detect if this target is being used in the current environment (optional) */
  detectFromEnvironment?(): boolean;

  /** Approve MCP servers in target-specific configuration (optional - only for targets that need approval) */
  approveMCPServers?(cwd: string, serverNames: string[]): Promise<void>;

  /** Transform rules content for the target (optional - defaults to no transformation) */
  transformRulesContent?(content: string): Promise<string>;

  /** Apply target-specific settings to config (attribution, hooks, env, thinking mode) */
  applySettings?(cwd: string, options: CommonOptions): Promise<SetupResult>;
}
