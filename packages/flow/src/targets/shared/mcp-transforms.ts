/**
 * Pure functions for MCP configuration transformations
 * Bidirectional conversion between Claude Code and OpenCode formats
 */

import type { MCPServerConfigUnion } from '../../types.js';

// ============================================================================
// Platform Detection
// ============================================================================

const isWindows = process.platform === 'win32';

/**
 * Commands that require cmd /c wrapper on Windows
 */
const WINDOWS_WRAPPED_COMMANDS = ['npx', 'npm', 'pnpm', 'yarn', 'bun', 'node'];

// ============================================================================
// Types
// ============================================================================

export type MCPFormat = 'claude-code' | 'opencode';

export interface StdioConfig {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface HttpConfig {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}

export interface LocalConfig {
  type: 'local';
  command: string[];
  environment?: Record<string, string>;
}

export interface RemoteConfig {
  type: 'remote';
  url: string;
  headers?: Record<string, string>;
}

// ============================================================================
// Windows Command Wrapper
// ============================================================================

/**
 * Wrap command for Windows if needed
 * On Windows, npx/npm/etc. need to be executed via cmd /c
 */
const wrapCommandForWindows = (
  command: string,
  args?: string[]
): { command: string; args: string[] } => {
  if (!isWindows) {
    return { command, args: args || [] };
  }

  // Check if command needs wrapping
  const needsWrapper = WINDOWS_WRAPPED_COMMANDS.some(
    (cmd) => command === cmd || command.endsWith(`\\${cmd}`) || command.endsWith(`/${cmd}`)
  );

  if (needsWrapper) {
    // Wrap with cmd /c
    return {
      command: 'cmd',
      args: ['/c', command, ...(args || [])],
    };
  }

  return { command, args: args || [] };
};

// ============================================================================
// Pure Transform Functions
// ============================================================================

/**
 * Convert stdio format to local format (Claude Code → OpenCode)
 */
export const stdioToLocal = (config: StdioConfig): LocalConfig => ({
  type: 'local',
  command: config.args ? [config.command, ...config.args] : [config.command],
  ...(config.env && { environment: config.env }),
});

/**
 * Convert local format to stdio format (OpenCode → Claude Code)
 * On Windows, wraps npx/npm/etc. with cmd /c
 */
export const localToStdio = (config: LocalConfig): StdioConfig => {
  const [command, ...args] = config.command;
  const wrapped = wrapCommandForWindows(command, args);

  return {
    type: 'stdio',
    command: wrapped.command,
    ...(wrapped.args.length > 0 && { args: wrapped.args }),
    ...(config.environment && { env: config.environment }),
  };
};

/**
 * Convert http format to remote format (Claude Code → OpenCode)
 */
export const httpToRemote = (config: HttpConfig): RemoteConfig => ({
  type: 'remote',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

/**
 * Convert remote format to http format (OpenCode → Claude Code)
 */
export const remoteToHttp = (config: RemoteConfig): HttpConfig => ({
  type: 'http',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

/**
 * Normalize stdio config (ensure consistent structure)
 * On Windows, wraps npx/npm/etc. with cmd /c
 */
export const normalizeStdio = (config: StdioConfig): StdioConfig => {
  const wrapped = wrapCommandForWindows(config.command, config.args);

  return {
    type: 'stdio',
    command: wrapped.command,
    ...(wrapped.args.length > 0 && { args: wrapped.args }),
    ...(config.env && { env: config.env }),
  };
};

/**
 * Normalize http config (ensure consistent structure)
 */
export const normalizeHttp = (config: HttpConfig): HttpConfig => ({
  type: 'http',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * Transform MCP config to target format
 * Pure function - no side effects
 */
export const transformMCPConfig = (
  config: MCPServerConfigUnion,
  targetFormat: MCPFormat
): Record<string, unknown> => {
  // Claude Code format (stdio/http)
  if (targetFormat === 'claude-code') {
    switch (config.type) {
      case 'local':
        return localToStdio(config as LocalConfig);
      case 'remote':
        return remoteToHttp(config as RemoteConfig);
      case 'stdio':
        return normalizeStdio(config as StdioConfig);
      case 'http':
        return normalizeHttp(config as HttpConfig);
      default:
        return config;
    }
  }

  // OpenCode format (local/remote)
  if (targetFormat === 'opencode') {
    switch (config.type) {
      case 'stdio':
        return stdioToLocal(config as StdioConfig);
      case 'http':
        return httpToRemote(config as HttpConfig);
      case 'local':
      case 'remote':
        return config;
      default:
        return config;
    }
  }

  return config;
};
