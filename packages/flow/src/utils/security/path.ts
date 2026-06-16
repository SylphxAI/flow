/**
 * Secure path utilities to prevent path traversal attacks.
 */

import path from 'node:path';
import { securitySchemas } from './schemas.js';

/**
 * Secure path utilities to prevent path traversal attacks
 */
export const pathSecurity = {
  /**
   * Validates and sanitizes a file path to prevent path traversal
   */
  validatePath: (inputPath: string, allowedBase?: string): string => {
    const validated = securitySchemas.filePath.parse(inputPath);

    // Normalize the path
    const normalizedPath = path.normalize(validated);

    // Check for path traversal attempts
    if (normalizedPath.includes('..')) {
      throw new Error('Path traversal detected in file path');
    }

    // If base path is provided, ensure the resolved path is within bounds
    if (allowedBase) {
      const resolvedPath = path.resolve(allowedBase, normalizedPath);
      const resolvedBase = path.resolve(allowedBase);

      if (!resolvedPath.startsWith(resolvedBase)) {
        throw new Error('File path escapes allowed base directory');
      }

      return resolvedPath;
    }

    return normalizedPath;
  },

  /**
   * Checks if a path is within allowed boundaries
   */
  isPathSafe: (targetPath: string, allowedBase: string): boolean => {
    try {
      const resolvedTarget = path.resolve(targetPath);
      const resolvedBase = path.resolve(allowedBase);
      return resolvedTarget.startsWith(resolvedBase);
    } catch {
      return false;
    }
  },

  /**
   * Creates a safe file path within a base directory
   */
  safeJoin: (basePath: string, ...paths: string[]): string => {
    const result = path.join(basePath, ...paths);

    // Normalize and verify it stays within base
    const normalized = path.normalize(result);
    const resolvedBase = path.resolve(basePath);
    const resolvedResult = path.resolve(normalized);

    if (!resolvedResult.startsWith(resolvedBase)) {
      throw new Error('Path traversal attempt detected in safeJoin');
    }

    return resolvedResult;
  },
};
