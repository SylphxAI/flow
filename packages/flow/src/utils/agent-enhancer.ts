/**
 * Agent Enhancer - append standards and output styles to agent content.
 *
 * Agents declare the standards they need through `standards` frontmatter. Legacy
 * `rules` frontmatter is still accepted as an input migration path, but new
 * canonical assets must use `standards`.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { getAgentsDir, getOutputStylesDir, getStandardsDir } from './config/paths.js';
import { yamlUtils } from './config/target-utils.js';
import { CLIError } from './errors.js';

const DEFAULT_STANDARD_NAMES = [
  'agent-native-standard',
  'engineering-standard',
  'delivery-standard',
  'prompt-architecture',
  'frontend-standard',
  'ai-architecture',
] as const;

/**
 * Load and combine standards and output styles.
 */
export async function loadStandardsAndStyles(
  standardNames?: string[],
  outputStyleNames?: string[]
): Promise<string> {
  const sections: string[] = [];

  const standardsContent = await loadStandards(standardNames);
  if (standardsContent) {
    sections.push(standardsContent);
  }

  const stylesContent = await loadOutputStyles(outputStyleNames);
  if (stylesContent) {
    sections.push(stylesContent);
  }

  return sections.join('\n\n---\n\n');
}

async function loadStandards(standardNames?: string[]): Promise<string> {
  try {
    const standardsDir = getStandardsDir();
    const standardsToLoad =
      standardNames && standardNames.length > 0 ? standardNames : [...DEFAULT_STANDARD_NAMES];
    const sections: string[] = [];

    for (const standardName of standardsToLoad) {
      const standardPath = path.join(standardsDir, `${standardName}.md`);

      try {
        const content = await fs.readFile(standardPath, 'utf8');
        const stripped = await yamlUtils.stripFrontMatter(content);
        sections.push(stripped);
      } catch (_error) {
        // Missing optional standards should not block agent loading.
      }
    }

    return sections.join('\n\n---\n\n');
  } catch (_error) {
    return '';
  }
}

async function loadOutputStyles(styleNames?: string[]): Promise<string> {
  try {
    const outputStylesDir = getOutputStylesDir();
    const sections: string[] = [];

    if (styleNames && styleNames.length > 0) {
      for (const styleName of styleNames) {
        const filePath = path.join(outputStylesDir, `${styleName}.md`);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const stripped = await yamlUtils.stripFrontMatter(content);
          sections.push(stripped);
        } catch (_error) {
          // Missing optional output styles should not block agent loading.
        }
      }
    } else {
      const files = await fs.readdir(outputStylesDir);
      const mdFiles = files.filter((file) => file.endsWith('.md'));

      for (const file of mdFiles) {
        const filePath = path.join(outputStylesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const stripped = await yamlUtils.stripFrontMatter(content);
        sections.push(stripped);
      }
    }

    return sections.join('\n\n');
  } catch (_error) {
    return '';
  }
}

export async function enhanceAgentContent(
  agentContent: string,
  standardNames?: string[],
  outputStyleNames?: string[]
): Promise<string> {
  const standardsAndStyles = await loadStandardsAndStyles(standardNames, outputStyleNames);

  if (!standardsAndStyles) {
    return agentContent;
  }

  return `${agentContent}\n\n---\n\n# Standards and Output Styles\n\n${standardsAndStyles}`;
}

function filterStandards(
  agentStandards?: string[],
  enabledStandards?: string[]
): string[] | undefined {
  if (!agentStandards || agentStandards.length === 0) {
    return undefined;
  }

  if (!enabledStandards || enabledStandards.length === 0) {
    return agentStandards;
  }

  const filtered = agentStandards.filter((standard) => enabledStandards.includes(standard));
  return filtered.length > 0 ? filtered : undefined;
}

function getAgentStandards(metadata: Record<string, unknown>): string[] | undefined {
  const standards = metadata.standards;
  if (Array.isArray(standards) && standards.every((standard) => typeof standard === 'string')) {
    return standards;
  }

  const legacyRules = metadata.rules;
  if (Array.isArray(legacyRules) && legacyRules.every((rule) => typeof rule === 'string')) {
    return legacyRules;
  }

  return undefined;
}

/**
 * Load agent content from explicit, project-local, or package asset locations.
 */
export async function loadAgentContent(
  agentName: string,
  agentFilePath?: string,
  enabledStandards?: string[],
  enabledOutputStyles?: string[]
): Promise<string> {
  try {
    if (agentFilePath) {
      const content = await fs.readFile(path.resolve(agentFilePath), 'utf-8');
      const { metadata } = await yamlUtils.extractFrontMatter(content);
      const standardsToLoad = filterStandards(getAgentStandards(metadata), enabledStandards);
      return await enhanceAgentContent(content, standardsToLoad, enabledOutputStyles);
    }

    const claudeAgentPath = path.join(process.cwd(), '.claude', 'agents', `${agentName}.md`);

    try {
      const content = await fs.readFile(claudeAgentPath, 'utf-8');
      return await enhanceAgentContent(content, [], enabledOutputStyles);
    } catch (_error) {
      const localAgentPath = path.join(process.cwd(), 'agents', `${agentName}.md`);

      try {
        const content = await fs.readFile(localAgentPath, 'utf-8');
        const { metadata } = await yamlUtils.extractFrontMatter(content);
        const standardsToLoad = filterStandards(getAgentStandards(metadata), enabledStandards);
        return await enhanceAgentContent(content, standardsToLoad, enabledOutputStyles);
      } catch (_error2) {
        const packageAgentsDir = getAgentsDir();
        const packageAgentPath = path.join(packageAgentsDir, `${agentName}.md`);
        const content = await fs.readFile(packageAgentPath, 'utf-8');
        const { metadata } = await yamlUtils.extractFrontMatter(content);
        const standardsToLoad = filterStandards(getAgentStandards(metadata), enabledStandards);
        return await enhanceAgentContent(content, standardsToLoad, enabledOutputStyles);
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
 * Extract agent instructions from agent content by stripping YAML frontmatter.
 */
export function extractAgentInstructions(agentContent: string): string {
  const yamlFrontMatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
  const match = agentContent.match(yamlFrontMatterRegex);

  if (match) {
    return agentContent.substring(match[0].length).trim();
  }

  return agentContent.trim();
}
