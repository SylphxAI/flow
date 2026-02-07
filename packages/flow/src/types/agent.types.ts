/**
 * Agent Types
 * Defines agents with custom system prompts and metadata
 */

/**
 * Simple agent definition from front matter (name, description, rules).
 * Not to be confused with AgentMetadata in target-config.types.ts which is
 * a richer metadata structure for target configuration.
 */
export interface AgentDefinition {
  name: string;
  description: string;
  rules?: string[]; // Optional list of rule files to include (e.g., ['core', 'code-standards'])
}

/**
 * Agent definition
 */
export interface Agent {
  id: string; // File name without extension (e.g., 'coder', 'planner')
  metadata: AgentDefinition;
  systemPrompt: string;
  isBuiltin: boolean; // Whether this is a system-provided agent
  filePath?: string; // Path to the agent file (for user-defined agents)
}

/**
 * Agent source location
 */
export interface AgentSource {
  type: 'global' | 'project' | 'builtin';
  path: string;
}
