/**
 * Target Resolver
 * Shared utility for resolving target IDs to Target objects
 * Eliminates duplication across BackupManager and SecretsManager
 */

import type { Target } from '../types/target.types.js';
import { targetManager } from './target-manager.js';

/**
 * Resolve a target from ID string to Target object
 * @throws Error if target ID is not found
 */
export function resolveTarget(targetId: string): Target {
  const targetOption = targetManager.getTarget(targetId);
  if (targetOption._tag === 'None') {
    throw new Error(`Unknown target: ${targetId}`);
  }
  return targetOption.value;
}

/**
 * Resolve target, accepting either string ID or Target object
 * Returns the Target object in both cases
 */
export function resolveTargetOrId(targetOrId: Target | string): Target {
  return typeof targetOrId === 'string' ? resolveTarget(targetOrId) : targetOrId;
}
