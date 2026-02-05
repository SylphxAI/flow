/**
 * Centralized Clack Prompts Wrapper
 * Unified prompt utilities with consistent error handling and cancellation support
 */

import * as clack from '@clack/prompts';
import chalk from 'chalk';
import { UserCancelledError } from '../errors.js';

// Re-export clack utilities for convenience
export { cancel, group, intro, isCancel, log, note, outro } from '@clack/prompts';

// ============================================================================
// Types
// ============================================================================

export interface SelectOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface MultiselectOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface SpinnerInstance {
  start: (message?: string) => void;
  stop: (message?: string) => void;
  message: (message: string) => void;
}

// ============================================================================
// Cancellation Handling
// ============================================================================

/**
 * Handle cancellation by checking if result is a cancel symbol
 * Throws UserCancelledError if cancelled
 */
export function handleCancellation<T>(
  result: T | symbol,
  message = 'Operation cancelled'
): asserts result is T {
  if (clack.isCancel(result)) {
    clack.cancel(message);
    throw new UserCancelledError(message);
  }
}

/**
 * Wrap a prompt result with automatic cancellation handling
 */
export function withCancellation<T>(result: T | symbol, message = 'Operation cancelled'): T {
  handleCancellation(result, message);
  return result;
}

// ============================================================================
// Prompt Wrappers with Cancellation Handling
// ============================================================================

/**
 * Select prompt with automatic cancellation handling
 */
export async function promptSelect<T extends string | number | boolean>(options: {
  message: string;
  options: SelectOption<T>[];
  initialValue?: T;
}): Promise<T> {
  const result = await clack.select({
    message: options.message,
    options: options.options,
    initialValue: options.initialValue,
  });

  handleCancellation(result, 'Selection cancelled');
  return result as T;
}

/**
 * Multiselect prompt with automatic cancellation handling
 */
export async function promptMultiselect<T extends string | number | boolean>(options: {
  message: string;
  options: MultiselectOption<T>[];
  initialValues?: T[];
  required?: boolean;
}): Promise<T[]> {
  const result = await clack.multiselect({
    message: options.message,
    options: options.options,
    initialValues: options.initialValues,
    required: options.required ?? false,
  });

  handleCancellation(result, 'Selection cancelled');
  return result as T[];
}

/**
 * Confirm prompt with automatic cancellation handling
 */
export async function promptConfirm(options: {
  message: string;
  initialValue?: boolean;
}): Promise<boolean> {
  const result = await clack.confirm({
    message: options.message,
    initialValue: options.initialValue ?? true,
  });

  handleCancellation(result, 'Confirmation cancelled');
  return result;
}

/**
 * Text input prompt with automatic cancellation handling
 */
export async function promptText(options: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}): Promise<string> {
  const result = await clack.text({
    message: options.message,
    placeholder: options.placeholder,
    defaultValue: options.defaultValue,
    validate: options.validate,
  });

  handleCancellation(result, 'Input cancelled');
  return result;
}

/**
 * Password input prompt with automatic cancellation handling
 */
export async function promptPassword(options: {
  message: string;
  mask?: string;
  validate?: (value: string) => string | undefined;
}): Promise<string> {
  const result = await clack.password({
    message: options.message,
    mask: options.mask ?? '*',
    validate: options.validate,
  });

  handleCancellation(result, 'Password input cancelled');
  return result;
}

// ============================================================================
// Spinner Wrapper
// ============================================================================

/**
 * Create a spinner instance with consistent API
 * Wraps Clack's spinner with additional convenience methods
 */
export function createSpinner(): SpinnerInstance {
  const s = clack.spinner();

  return {
    start: (message?: string) => s.start(message),
    stop: (message?: string) => s.stop(message),
    message: (message: string) => s.message(message),
  };
}

/**
 * Run an async operation with a spinner
 */
export async function withSpinner<T>(
  message: string,
  fn: () => Promise<T>,
  options?: {
    successMessage?: string | ((result: T) => string);
    errorMessage?: string | ((error: Error) => string);
  }
): Promise<T> {
  const s = clack.spinner();
  s.start(message);

  try {
    const result = await fn();
    const successMsg =
      typeof options?.successMessage === 'function'
        ? options.successMessage(result)
        : (options?.successMessage ?? message);
    s.stop(chalk.green(`✓ ${successMsg}`));
    return result;
  } catch (error) {
    const errorMsg =
      typeof options?.errorMessage === 'function'
        ? options.errorMessage(error as Error)
        : (options?.errorMessage ?? `Failed: ${message}`);
    s.stop(chalk.red(`✗ ${errorMsg}`));
    throw error;
  }
}

// ============================================================================
// Group Prompts with Cancellation
// ============================================================================

/**
 * Group multiple prompts together with shared cancellation handling
 * If any prompt is cancelled, the entire group is cancelled
 */
export async function promptGroup<T extends Record<string, unknown>>(
  prompts: {
    [K in keyof T]: () => Promise<T[K] | symbol>;
  },
  options?: {
    onCancel?: () => void;
  }
): Promise<T> {
  const result = await clack.group(prompts, {
    onCancel: () => {
      options?.onCancel?.();
      clack.cancel('Operation cancelled');
      throw new UserCancelledError('Operation cancelled');
    },
  });

  return result as T;
}
