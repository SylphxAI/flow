/**
 * Secure command execution utilities to prevent command injection.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathSecurity } from './path.js';
import { securitySchemas } from './schemas.js';

const execFileAsync = promisify(execFile);

/**
 * Secure command execution utilities to prevent command injection
 */
export const commandSecurity = {
  /**
   * Safely executes a command with arguments, preventing command injection
   */
  async safeExecFile(
    command: string,
    args: string[],
    options: {
      cwd?: string;
      timeout?: number;
      maxBuffer?: number;
      env?: Record<string, string>;
    } = {}
  ): Promise<{ stdout: string; stderr: string }> {
    // Validate command
    if (!/^[a-zA-Z0-9._-]+$/.test(command)) {
      throw new Error(`Invalid command: ${command}`);
    }

    // Validate arguments
    const validatedArgs = args.map((arg) => {
      try {
        return securitySchemas.commandArg.parse(arg);
      } catch (_error) {
        throw new Error(`Invalid command argument: ${arg}`);
      }
    });

    // Set secure defaults
    const secureOptions = {
      timeout: options.timeout || 30000, // 30 seconds default
      maxBuffer: options.maxBuffer || 1024 * 1024, // 1MB default
      env: { ...process.env, ...options.env },
      cwd: options.cwd || process.cwd(),
      shell: false, // Never use shell to prevent injection
      encoding: 'utf8' as const,
    };

    // Validate working directory
    if (secureOptions.cwd) {
      pathSecurity.validatePath(secureOptions.cwd);
    }

    try {
      return await execFileAsync(command, validatedArgs, secureOptions);
    } catch (error: unknown) {
      // Sanitize error message to prevent information disclosure
      const err = error as NodeJS.ErrnoException & { signal?: string };
      const sanitizedError = new Error(`Command execution failed: ${command}`) as Error & {
        code?: string;
        signal?: string;
      };
      sanitizedError.code = err.code;
      sanitizedError.signal = err.signal;
      throw sanitizedError;
    }
  },

  /**
   * Validates that a command argument is safe for execution
   */
  validateCommandArgs: (args: string[]): string[] => {
    return args.map((arg) => {
      const validated = securitySchemas.commandArg.parse(arg);

      // Additional checks for common injection patterns
      const dangerousPatterns = [
        /[;&|`'"\\$()]/,
        /\.\./,
        /\/etc\//,
        /\/proc\//,
        /windows\\system32/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(validated)) {
          throw new Error(`Dangerous pattern detected in command argument: ${arg}`);
        }
      }

      return validated;
    });
  },
};
