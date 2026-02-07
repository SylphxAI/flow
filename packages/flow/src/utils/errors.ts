/**
 * Custom error for user cancellation (Ctrl+C)
 */
export class UserCancelledError extends Error {
  constructor(message = 'Operation cancelled by user') {
    super(message);
    this.name = 'UserCancelledError';
  }
}

/**
 * CLI error with optional error code
 */
export class CLIError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'CLIError';
  }
}
