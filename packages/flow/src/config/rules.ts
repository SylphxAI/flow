/**
 * Rules configuration
 */

import { getRuleFile } from '../utils/config/paths.js';

export const CORE_RULES = {
  'agent-native-standard': 'agent-native-standard.md',
  'engineering-standard': 'engineering-standard.md',
  'delivery-standard': 'delivery-standard.md',
  'prompt-architecture': 'prompt-architecture.md',
  'frontend-standard': 'frontend-standard.md',
  'ai-architecture': 'ai-architecture.md',
} as const;

/**
 * Get the path to a specific core rules file
 */
export function getRulesPath(ruleType: keyof typeof CORE_RULES = 'engineering-standard'): string {
  return getRuleFile(CORE_RULES[ruleType]);
}

/**
 * Get all available rule types
 */
export function getAllRuleTypes(): string[] {
  return Object.keys(CORE_RULES);
}

/**
 * Check if a rule file exists
 */
export function ruleFileExists(ruleType: keyof typeof CORE_RULES): boolean {
  try {
    getRulesPath(ruleType);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rules filename mapping by target
 */
export const RULES_FILES = {
  'claude-code': 'CLAUDE.md',
  opencode: 'AGENTS.md',
} as const;
