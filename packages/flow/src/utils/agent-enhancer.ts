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
import { getOutputStylesDir, getRulesDir } from './config/paths.js';
import { yamlUtils } from './config/target-utils.js';

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
      } catch (error) {
        // Log warning if rule file not found, but continue with other rules
        console.warn(`Warning: Rule file not found: ${ruleName}.md`);
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
        } catch (error) {
          console.warn(`Warning: Output style file not found: ${styleName}.md`);
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
