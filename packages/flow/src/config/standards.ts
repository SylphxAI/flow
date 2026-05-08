/**
 * Standards configuration
 */

import { getStandardFile } from '../utils/config/paths.js';

export const CORE_STANDARDS = {
  'agent-native-standard': 'agent-native-standard.md',
  'engineering-standard': 'engineering-standard.md',
  'delivery-standard': 'delivery-standard.md',
  'prompt-architecture': 'prompt-architecture.md',
  'frontend-standard': 'frontend-standard.md',
  'ai-architecture': 'ai-architecture.md',
} as const;

/**
 * Get the path to a specific standard file.
 */
export function getStandardPath(
  standardType: keyof typeof CORE_STANDARDS = 'engineering-standard'
): string {
  return getStandardFile(CORE_STANDARDS[standardType]);
}

/**
 * Get all available standard types.
 */
export function getAllStandardTypes(): string[] {
  return Object.keys(CORE_STANDARDS);
}

/**
 * Check if a standard file exists.
 */
export function standardFileExists(standardType: keyof typeof CORE_STANDARDS): boolean {
  try {
    getStandardPath(standardType);
    return true;
  } catch {
    return false;
  }
}

/**
 * Instruction filename mapping by target.
 */
export const INSTRUCTION_FILES = {
  'claude-code': 'CLAUDE.md',
  opencode: 'AGENTS.md',
} as const;
