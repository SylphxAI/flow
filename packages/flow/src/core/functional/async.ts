/**
 * Async/Promise utilities for functional programming
 * Handle promises with Result types
 *
 * DESIGN RATIONALE:
 * - Convert Promise rejections to Result types
 * - Composable async operations
 * - No unhandled promise rejections
 * - Type-safe async error handling
 */

import type { AppError } from './error-types.js';
import { toAppError } from './error-types.js';
import type { Result } from './result.js';
import { failure, isSuccess, success } from './result.js';

/**
 * Async Result type
 */
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

/**
 * Convert Promise to AsyncResult
 * Catches rejections and converts to Result
 */
export const fromPromise = async <T>(
  promise: Promise<T>,
  onError?: (error: unknown) => AppError
): AsyncResult<T> => {
  try {
    const value = await promise;
    return success(value);
  } catch (error) {
    return failure(onError ? onError(error) : toAppError(error));
  }
};

/**
 * Run async operation with timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => AppError
): AsyncResult<T> => {
  return fromPromise(
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      ),
    ]),
    onTimeout
  );
};

/**
 * Retry async operation
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    delayMs?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: AppError) => void;
  }
): AsyncResult<T> => {
  const { maxAttempts, delayMs = 1000, backoff = 2, onRetry } = options;

  let lastError: AppError = { type: 'unknown', message: 'No attempts made', code: 'NO_ATTEMPTS' };
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fromPromise(fn());

    if (isSuccess(result)) {
      return result;
    }

    lastError = result.error;

    if (attempt < maxAttempts) {
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }

  return failure(lastError);
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
