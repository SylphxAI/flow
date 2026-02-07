/**
 * MCP (Model Context Protocol) Configuration Types
 * Defines configuration formats for different MCP server implementations
 */

/**
 * Base MCP server configuration with stdio transport
 */
export type MCPServerConfig = {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

/**
 * MCP server configuration with HTTP transport
 */
export type MCPServerConfigHTTP = {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
};

/**
 * MCP server configuration with local transport (OpenCode format for stdio)
 */
export type MCPServerConfigLocal = {
  type: 'local';
  command: string[];
  environment?: Record<string, string>;
};

/**
 * MCP server configuration with remote transport (OpenCode format for http)
 */
export type MCPServerConfigRemote = {
  type: 'remote';
  url: string;
  headers?: Record<string, string>;
};

/**
 * Union of all possible MCP server configurations
 * Includes both Claude Code formats (stdio/http) and OpenCode formats (local/remote)
 */
export type MCPServerConfigUnion =
  | MCPServerConfig
  | MCPServerConfigHTTP
  | MCPServerConfigLocal
  | MCPServerConfigRemote;

/**
 * OpenCode-specific configuration format
 */
export type OpenCodeConfig = {
  type: 'local' | 'remote';
  command?: string[];
  url?: string;
  headers?: Record<string, string>;
  environment?: Record<string, string>;
};

/**
 * Type guard for stdio config
 */
export function isStdioConfig(config: MCPServerConfigUnion): config is MCPServerConfig {
  return config.type === 'stdio';
}

/**
 * Type guard for HTTP config
 */
export function isHttpConfig(config: MCPServerConfigUnion): config is MCPServerConfigHTTP {
  return config.type === 'http';
}

/**
 * Type guard for local config (OpenCode stdio equivalent)
 */
export function isLocalConfig(config: MCPServerConfigUnion): config is MCPServerConfigLocal {
  return config.type === 'local';
}

/**
 * Type guard for remote config (OpenCode http equivalent)
 */
export function isRemoteConfig(config: MCPServerConfigUnion): config is MCPServerConfigRemote {
  return config.type === 'remote';
}

/**
 * Type guard for CLI command config (stdio)
 */
export function isCLICommandConfig(config: MCPServerConfigUnion): config is MCPServerConfig {
  return isStdioConfig(config);
}
