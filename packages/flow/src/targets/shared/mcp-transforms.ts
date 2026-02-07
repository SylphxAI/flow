/**
 * Pure functions for MCP configuration transformations
 * Bidirectional conversion between Claude Code and OpenCode formats
 */

import type {
  MCPServerConfig,
  MCPServerConfigHTTP,
  MCPServerConfigLocal,
  MCPServerConfigRemote,
  MCPServerConfigUnion,
} from '../../types.js';

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
export const stdioToLocal = (config: MCPServerConfig): MCPServerConfigLocal => ({
  type: 'local',
  command: config.args ? [config.command, ...config.args] : [config.command],
  ...(config.env && { environment: config.env }),
});

/**
 * Convert local format to stdio format (OpenCode → Claude Code)
 * On Windows, wraps npx/npm/etc. with cmd /c
 */
export const localToStdio = (config: MCPServerConfigLocal): MCPServerConfig => {
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
export const httpToRemote = (config: MCPServerConfigHTTP): MCPServerConfigRemote => ({
  type: 'remote',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

/**
 * Convert remote format to http format (OpenCode → Claude Code)
 */
export const remoteToHttp = (config: MCPServerConfigRemote): MCPServerConfigHTTP => ({
  type: 'http',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

/**
 * Normalize stdio config (ensure consistent structure)
 * On Windows, wraps npx/npm/etc. with cmd /c
 */
export const normalizeStdio = (config: MCPServerConfig): MCPServerConfig => {
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
export const normalizeHttp = (config: MCPServerConfigHTTP): MCPServerConfigHTTP => ({
  type: 'http',
  url: config.url,
  ...(config.headers && { headers: config.headers }),
});

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * Transform MCP config to target format
 * Pure function - no side effects, uses discriminated union narrowing
 */
export const transformMCPConfig = (
  config: MCPServerConfigUnion,
  targetFormat: MCPFormat
): Record<string, unknown> => {
  // Claude Code format (stdio/http)
  if (targetFormat === 'claude-code') {
    switch (config.type) {
      case 'local':
        return localToStdio(config);
      case 'remote':
        return remoteToHttp(config);
      case 'stdio':
        return normalizeStdio(config);
      case 'http':
        return normalizeHttp(config);
    }
  }

  // OpenCode format (local/remote)
  if (targetFormat === 'opencode') {
    switch (config.type) {
      case 'stdio':
        return stdioToLocal(config);
      case 'http':
        return httpToRemote(config);
      case 'local':
      case 'remote':
        return config;
    }
  }

  return config;
};
