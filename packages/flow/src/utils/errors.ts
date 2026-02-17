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

/**
 * Child process exited with non-zero code.
 * Since stdio is inherited, the child already displayed its own error —
 * upstream handlers should cleanup and exit silently without printing anything.
 */
export class ChildProcessExitError extends Error {
  constructor(public exitCode: number) {
    super(`Child process exited with code ${exitCode}`);
    this.name = 'ChildProcessExitError';
  }
}
