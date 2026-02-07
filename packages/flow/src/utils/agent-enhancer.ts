/**
 * Agent Enhancer - Append rules and output styles to agent content
 *
 * This module provides utilities to enhance agent files with:
 * - Rules (from assets/rules/core.md)
 * - Output Styles (from assets/output-styles/*.md)
 *
 * These are appended to agent content to ensure every agent has
 * access to the same rules and output styles without duplicating
 * them in CLAUDE.md or other system prompts.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { getAgentsDir, getOutputStylesDir, getRulesDir } from './config/paths.js';
import { yamlUtils } from './config/target-utils.js';
import { CLIError } from './errors.js';

/**
 * Load and combine rules and output styles
 */
export async function loadRulesAndStyles(
  ruleNames?: string[],
  outputStyleNames?: string[]
): Promise<string> {
  const sections: string[] = [];

  // Load rules (either specified rules or default to all)
  const rulesContent = await loadRules(ruleNames);
  if (rulesContent) {
    sections.push(rulesContent);
  }

  // Load output styles (either specified or all)
  const stylesContent = await loadOutputStyles(outputStyleNames);
  if (stylesContent) {
    sections.push(stylesContent);
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Load rules from assets/rules/*.md
 * @param ruleNames - Array of rule file names (without .md extension). Defaults to ['core']
 */
async function loadRules(ruleNames?: string[]): Promise<string> {
  try {
    const rulesDir = getRulesDir();
    const rulesToLoad = ruleNames && ruleNames.length > 0 ? ruleNames : ['core'];
    const sections: string[] = [];

    for (const ruleName of rulesToLoad) {
      const rulePath = path.join(rulesDir, `${ruleName}.md`);

      try {
        const content = await fs.readFile(rulePath, 'utf8');
        // Strip YAML front matter
        const stripped = await yamlUtils.stripFrontMatter(content);
        sections.push(stripped);
      } catch (_error) {
        // Silent - rule file not found, continue with other rules
      }
    }

    return sections.join('\n\n---\n\n');
  } catch (_error) {
    // If rules directory doesn't exist, return empty string
    return '';
  }
}

/**
 * Load output styles from assets/output-styles/
 * @param styleNames - Array of style file names (without .md extension). If not provided, loads all styles.
 */
async function loadOutputStyles(styleNames?: string[]): Promise<string> {
  try {
    const outputStylesDir = getOutputStylesDir();
    const sections: string[] = [];

    // If specific styles are requested, load only those
    if (styleNames && styleNames.length > 0) {
      for (const styleName of styleNames) {
        const filePath = path.join(outputStylesDir, `${styleName}.md`);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const stripped = await yamlUtils.stripFrontMatter(content);
          sections.push(stripped);
        } catch (_error) {
          // Silent - output style file not found, continue
        }
      }
    } else {
      // Load all styles
      const files = await fs.readdir(outputStylesDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      for (const file of mdFiles) {
        const filePath = path.join(outputStylesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const stripped = await yamlUtils.stripFrontMatter(content);
        sections.push(stripped);
      }
    }

    return sections.join('\n\n');
  } catch (_error) {
    // If output styles directory doesn't exist, return empty string
    return '';
  }
}

/**
 * Enhance agent content by appending rules and output styles
 * @param agentContent - The agent markdown content
 * @param ruleNames - Optional array of rule file names to include
 * @param outputStyleNames - Optional array of output style file names to include
 */
export async function enhanceAgentContent(
  agentContent: string,
  ruleNames?: string[],
  outputStyleNames?: string[]
): Promise<string> {
  const rulesAndStyles = await loadRulesAndStyles(ruleNames, outputStyleNames);

  if (!rulesAndStyles) {
    return agentContent;
  }

  return `${agentContent}\n\n---\n\n# Rules and Output Styles\n\n${rulesAndStyles}`;
}

/**
 * Filter rules: intersection of agent's required rules and globally enabled rules
 * @param agentRules - Rules defined in agent frontmatter
 * @param enabledRules - Globally enabled rules from user settings
 * @returns Intersection of both arrays (rules that are both required by agent AND enabled globally)
 */
function filterRules(agentRules?: string[], enabledRules?: string[]): string[] | undefined {
  // If agent doesn't define rules, return undefined (will use default)
  if (!agentRules || agentRules.length === 0) {
    return undefined;
  }

  // If no global filter, use all agent rules
  if (!enabledRules || enabledRules.length === 0) {
    return agentRules;
  }

  // Return intersection: rules that are both in agent's list AND globally enabled
  const filtered = agentRules.filter((rule) => enabledRules.includes(rule));
  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Load agent content from various locations
 * @param agentName - Name of the agent (without .md extension)
 * @param agentFilePath - Optional specific file path to load from
 * @param enabledRules - Globally enabled rules (filtered with agent's frontmatter rules)
 * @param enabledOutputStyles - Optional array of enabled output style names
 */
export async function loadAgentContent(
  agentName: string,
  agentFilePath?: string,
  enabledRules?: string[],
  enabledOutputStyles?: string[]
): Promise<string> {
  try {
    // If specific file path provided, load from there
    if (agentFilePath) {
      const content = await fs.readFile(path.resolve(agentFilePath), 'utf-8');
      // Extract rules from agent frontmatter
      const { metadata } = await yamlUtils.extractFrontMatter(content);
      const agentRules = metadata.rules as string[] | undefined;
      // Filter: intersection of agent's rules and globally enabled rules
      const rulesToLoad = filterRules(agentRules, enabledRules);
      // Enhance with filtered rules and enabled output styles
      return await enhanceAgentContent(content, rulesToLoad, enabledOutputStyles);
    }

    // First try to load from .claude/agents/ directory (processed agents with rules already included)
    const claudeAgentPath = path.join(process.cwd(), '.claude', 'agents', `${agentName}.md`);

    try {
      const content = await fs.readFile(claudeAgentPath, 'utf-8');
      // Enhance with enabled output styles (rules are already included in the file)
      return await enhanceAgentContent(content, [], enabledOutputStyles);
    } catch (_error) {
      // Try to load from local agents/ directory (user-defined agents)
      const localAgentPath = path.join(process.cwd(), 'agents', `${agentName}.md`);

      try {
        const content = await fs.readFile(localAgentPath, 'utf-8');
        // Extract rules from agent frontmatter
        const { metadata } = await yamlUtils.extractFrontMatter(content);
        const agentRules = metadata.rules as string[] | undefined;
        // Filter: intersection of agent's rules and globally enabled rules
        const rulesToLoad = filterRules(agentRules, enabledRules);
        // Enhance with filtered rules and enabled output styles
        return await enhanceAgentContent(content, rulesToLoad, enabledOutputStyles);
      } catch (_error2) {
        // Try to load from the package's agents directory
        const packageAgentsDir = getAgentsDir();
        const packageAgentPath = path.join(packageAgentsDir, `${agentName}.md`);

        const content = await fs.readFile(packageAgentPath, 'utf-8');
        // Extract rules from agent frontmatter
        const { metadata } = await yamlUtils.extractFrontMatter(content);
        const agentRules = metadata.rules as string[] | undefined;
        // Filter: intersection of agent's rules and globally enabled rules
        const rulesToLoad = filterRules(agentRules, enabledRules);
        // Enhance with filtered rules and enabled output styles
        return await enhanceAgentContent(content, rulesToLoad, enabledOutputStyles);
      }
    }
  } catch (_error) {
    throw new CLIError(
      `Agent '${agentName}' not found${agentFilePath ? ` at ${agentFilePath}` : ''}`,
      'AGENT_NOT_FOUND'
    );
  }
}

/**
 * Extract agent instructions from agent content (strip YAML front matter)
 */
export function extractAgentInstructions(agentContent: string): string {
  // Extract content after YAML front matter
  const yamlFrontMatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
  const match = agentContent.match(yamlFrontMatterRegex);

  if (match) {
    return agentContent.substring(match[0].length).trim();
  }

  // If no front matter, return the full content
  return agentContent.trim();
}
