/**
 * Pure functions for common target operations
 * Shared logic between claude-code and opencode targets
 */

import fs from 'node:fs';
import path from 'node:path';
import type { CommonOptions, SetupResult, TargetConfig } from '../../types.js';
import { installToDirectory } from '../../core/installers/file-installer.js';
import { getAgentsDir, getSlashCommandsDir } from '../../utils/config/paths.js';
import { yamlUtils } from '../../utils/config/target-utils.js';

// ============================================================================
// Types
// ============================================================================

export type ContentTransformer = (content: string, sourcePath?: string) => Promise<string>;

export interface SetupOptions extends CommonOptions {
  showProgress?: boolean;
}

// ============================================================================
// Pure Functions - Environment Detection
// ============================================================================

/**
 * Check if target config file exists in directory
 */
export const detectTargetConfig = (cwd: string, configFile: string): boolean => {
  try {
    return fs.existsSync(path.join(cwd, configFile));
  } catch {
    return false;
  }
};

// ============================================================================
// Pure Functions - Content Transformation
// ============================================================================

/**
 * Strip YAML front matter from content
 * Used for rules transformation in both targets
 */
export const stripFrontMatter = (content: string): Promise<string> =>
  Promise.resolve(yamlUtils.stripFrontMatter(content));

/**
 * Identity transformer - returns content unchanged
 */
export const identityTransform: ContentTransformer = (content: string) =>
  Promise.resolve(content);

// ============================================================================
// Pure Functions - Setup Operations
// ============================================================================

/**
 * Setup agents to target directory
 * Generic function used by both targets
 */
export const setupAgentsTo = async (
  targetDir: string,
  transformer: ContentTransformer,
  options: SetupOptions = {}
): Promise<SetupResult> => {
  const results = await installToDirectory(
    getAgentsDir(),
    targetDir,
    transformer,
    { ...options, showProgress: false }
  );
  return { count: results.length };
};

/**
 * Setup slash commands to target directory
 * Generic function used by both targets
 */
export const setupSlashCommandsTo = async (
  targetDir: string,
  transformer: ContentTransformer = identityTransform,
  options: SetupOptions = {}
): Promise<SetupResult> => {
  const results = await installToDirectory(
    getSlashCommandsDir(),
    targetDir,
    transformer,
    { ...options, showProgress: false }
  );
  return { count: results.length };
};

// ============================================================================
// Pure Functions - Config Operations
// ============================================================================

/**
 * Ensure config has required structure
 * Returns new object, doesn't mutate input
 */
export const ensureConfigStructure = <T extends Record<string, unknown>>(
  config: T,
  key: string,
  defaultValue: unknown = {}
): T => {
  if (config[key] !== undefined) return config;
  return { ...config, [key]: defaultValue };
};

/**
 * Get MCP config key for target
 */
export const getMCPKey = (targetId: string): string =>
  targetId === 'claude-code' ? 'mcpServers' : 'mcp';

// ============================================================================
// Pure Functions - Path Resolution
// ============================================================================

/**
 * Resolve target directory paths
 */
export const resolveTargetPaths = (cwd: string, config: TargetConfig) => ({
  configDir: path.join(cwd, config.configDir),
  agentDir: path.join(cwd, config.agentDir),
  configFile: path.join(cwd, config.configFile),
  slashCommandsDir: config.slashCommandsDir
    ? path.join(cwd, config.slashCommandsDir)
    : undefined,
  rulesFile: config.rulesFile
    ? path.join(cwd, config.rulesFile)
    : undefined,
});
