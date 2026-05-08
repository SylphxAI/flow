/**
 * Pure functions for file attachment operations
 * Generic utilities for attaching files with conflict tracking
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// Types
// ============================================================================

export interface AttachItem {
  name: string;
  content: string;
}

export interface ConflictInfo {
  type: string;
  name: string;
  action: 'overridden' | 'added' | 'skipped';
  message: string;
}

export interface AttachStats {
  added: string[];
  overridden: string[];
  conflicts: ConflictInfo[];
}

export interface ManifestTracker {
  user: string[];
  flow: string[];
}

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Create conflict info object
 */
export const createConflict = (
  type: string,
  name: string,
  action: 'overridden' | 'added' | 'skipped' = 'overridden'
): ConflictInfo => ({
  type,
  name,
  action,
  message: `${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' ${action} (will be restored on exit)`,
});

/**
 * Check if file exists at path
 */
export const fileExists = (filePath: string): boolean => existsSync(filePath);

/**
 * Ensure directory exists
 */
export const ensureDir = (dirPath: string): Promise<void> =>
  fs.mkdir(dirPath, { recursive: true }).then(() => {});

/**
 * Write file content
 */
export const writeFile = (filePath: string, content: string): Promise<void> =>
  fs.writeFile(filePath, content);

/**
 * Read file content
 */
export const readFile = (filePath: string): Promise<string> => fs.readFile(filePath, 'utf-8');

// ============================================================================
// Generic Attach Function
// ============================================================================

/**
 * Attach multiple items to a directory with conflict tracking
 * Pure function that returns stats and manifest updates
 */
export const attachItemsToDir = async (
  items: AttachItem[],
  targetDir: string,
  itemType: string
): Promise<{ stats: AttachStats; manifest: ManifestTracker }> => {
  await ensureDir(targetDir);

  const stats: AttachStats = {
    added: [],
    overridden: [],
    conflicts: [],
  };

  const manifest: ManifestTracker = {
    user: [],
    flow: [],
  };

  for (const item of items) {
    const itemPath = path.join(targetDir, item.name);
    const existed = fileExists(itemPath);

    if (existed) {
      stats.overridden.push(item.name);
      stats.conflicts.push(createConflict(itemType, item.name, 'overridden'));
      manifest.user.push(item.name);
    } else {
      stats.added.push(item.name);
    }

    await writeFile(itemPath, item.content);
    manifest.flow.push(item.name);
  }

  return { stats, manifest };
};

// ============================================================================
// Instructions Attachment (Append Strategy)
// ============================================================================

const FLOW_INSTRUCTIONS_START = '<!-- ========== Sylphx Flow Instructions (Auto-injected) ========== -->';
const FLOW_INSTRUCTIONS_END = '<!-- ========== End of Sylphx Flow Instructions ========== -->';
const FLOW_INSTRUCTIONS_MARKER = '<!-- Sylphx Flow Instructions -->';

/**
 * Check if content already has Flow instructions appended
 */
export const hasFlowInstructions = (content: string): boolean => content.includes(FLOW_INSTRUCTIONS_MARKER);

/**
 * Wrap instructions content with markers
 */
export const wrapInstructionsContent = (instructions: string): string =>
  `\n\n${FLOW_INSTRUCTIONS_START}\n\n${instructions}\n\n${FLOW_INSTRUCTIONS_END}\n`;

/**
 * Append instructions to existing content
 */
export const appendInstructions = (existingContent: string, instructions: string): string =>
  existingContent + wrapInstructionsContent(instructions);

/**
 * Attach instructions file with append strategy
 */
export const attachInstructionsFile = async (
  instructionsPath: string,
  instructions: string
): Promise<{ originalSize: number; flowContentAdded: boolean }> => {
  if (fileExists(instructionsPath)) {
    const existingContent = await readFile(instructionsPath);

    // Skip if already appended
    if (hasFlowInstructions(existingContent)) {
      return { originalSize: existingContent.length, flowContentAdded: false };
    }

    await writeFile(instructionsPath, appendInstructions(existingContent, instructions));
    return { originalSize: existingContent.length, flowContentAdded: true };
  }

  // Create new file
  await ensureDir(path.dirname(instructionsPath));
  await writeFile(instructionsPath, instructions);
  return { originalSize: 0, flowContentAdded: true };
};
