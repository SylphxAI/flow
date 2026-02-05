/**
 * Prompt Helpers
 * Utilities for handling user prompts and error handling
 *
 * This module provides backward-compatible error handling that works with
 * both legacy inquirer errors and the new Clack cancellation pattern.
 */

import { isCancel } from '@clack/prompts';
import { UserCancelledError } from './errors.js';

/**
 * Check if error is a user cancellation (Ctrl+C or force closed)
 * Supports both legacy inquirer errors and Clack cancellation symbols
 * @param error - Error or symbol to check
 * @returns True if error represents user cancellation
 */
export function isUserCancellation(error: unknown): boolean {
  // Handle Clack cancellation symbol
  if (isCancel(error)) {
    return true;
  }

  // Handle legacy inquirer errors
  if (error === null || typeof error !== 'object') {
    return false;
  }
  const errorObj = error as { name?: string; message?: string };
  return errorObj.name === 'ExitPromptError' || errorObj.message?.includes('force closed') === true;
}

/**
 * Handle inquirer/clack prompt errors with consistent error handling
 * Throws UserCancelledError for user cancellations, re-throws other errors
 * @param error - Error from prompt
 * @param message - Custom cancellation message
 * @throws {UserCancelledError} If user cancelled the prompt
 * @throws Original error if not a cancellation
 */
export function handlePromptError(error: unknown, message: string): never {
  if (isUserCancellation(error)) {
    throw new UserCancelledError(message);
  }
  throw error;
}

/**
 * Wrap a prompt with consistent error handling
 * @param promptFn - Function that returns a promise from a prompt library
 * @param errorMessage - Message to use if user cancels
 * @returns Promise with the prompt result
 * @throws {UserCancelledError} If user cancels the prompt
 */
export async function withPromptErrorHandling<T>(
  promptFn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await promptFn();
  } catch (error) {
    handlePromptError(error, errorMessage);
  }
}
