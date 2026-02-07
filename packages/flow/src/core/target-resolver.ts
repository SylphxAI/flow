/**
 * Target Resolver — Single Source of Truth for target ID → Target resolution
 */

import type { Target } from '../types/target.types.js';
import { targetManager } from './target-manager.js';

/**
 * Resolve target ID to Target object, returns null if not found
 */
export function tryResolveTarget(targetId: string): Target | null {
  const targetOption = targetManager.getTarget(targetId);
  return targetOption._tag === 'Some' ? targetOption.value : null;
}

/**
 * Resolve target ID to Target object
 * @throws Error if target ID is not found
 */
export function resolveTarget(targetId: string): Target {
  const target = tryResolveTarget(targetId);
  if (!target) {
    throw new Error(`Unknown target: ${targetId}`);
  }
  return target;
}

/**
 * Resolve target from either string ID or Target object
 */
export function resolveTargetOrId(targetOrId: Target | string): Target {
  return typeof targetOrId === 'string' ? resolveTarget(targetOrId) : targetOrId;
}
