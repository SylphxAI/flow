/**
 * Prompt Helpers
 * Utilities for handling user prompts and error handling
 */

import { UserCancelledError } from './errors.js';

/**
 * Check if error is a user cancellation (Ctrl+C or force closed)
 * @param error - Error to check
 * @returns True if error represents user cancellation
 */
export function isUserCancellation(error: any): boolean {
  return error?.name === 'ExitPromptError' || error?.message?.includes('force closed');
}

/**
 * Handle inquirer prompt errors with consistent error handling
 * Throws UserCancelledError for user cancellations, re-throws other errors
 * @param error - Error from inquirer prompt
 * @param message - Custom cancellation message
 * @throws {UserCancelledError} If user cancelled the prompt
 * @throws Original error if not a cancellation
 */
export function handlePromptError(error: any, message: string): never {
  if (isUserCancellation(error)) {
    throw new UserCancelledError(message);
  }
  throw error;
}

/**
 * Wrap an inquirer prompt with consistent error handling
 * @param promptFn - Function that returns a promise from inquirer
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
