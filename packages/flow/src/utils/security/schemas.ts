/**
 * Security-focused input validation schemas.
 */

import { z } from 'zod';

/**
 * Security-focused validation schemas
 */
export const securitySchemas = {
  /** Project name validation - prevents command injection and path traversal */
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name too long')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Project name can only contain letters, numbers, hyphens, and underscores'
    )
    .refine((name) => !/^\.+$/.test(name), 'Project name cannot be only dots')
    .refine((name) => !/[<>:"|?*]/.test(name), 'Project name contains invalid characters'),

  /** Branch name validation - prevents command injection */
  branchName: z
    .string()
    .min(1, 'Branch name is required')
    .max(255, 'Branch name too long')
    .regex(
      /^[a-zA-Z0-9/_-]+$/,
      'Branch name can only contain letters, numbers, slashes, hyphens, and underscores'
    )
    .refine((name) => !name.includes('..'), 'Branch name cannot contain ".."')
    .refine((name) => !/^[/\\]/.test(name), 'Branch name cannot start with path separators')
    .refine((name) => !/[<>:"|?*$]/.test(name), 'Branch name contains invalid characters'),

  /** File path validation - prevents path traversal */
  filePath: z
    .string()
    .min(1, 'File path is required')
    .max(1000, 'File path too long')
    .refine(
      (filePath) => !filePath.includes('..'),
      'File path cannot contain ".." for path traversal protection'
    )
    .refine((filePath) => !/^[<>:"|?*]/.test(filePath), 'File path contains invalid characters'),

  /** Command argument validation - prevents command injection */
  commandArg: z
    .string()
    .max(1000, 'Command argument too long')
    .refine(
      (arg) => !/[<>|;&$`'"\\]/.test(arg),
      'Command argument contains potentially dangerous characters'
    ),

  /** Environment variable validation */
  envVarName: z
    .string()
    .regex(/^[A-Z_][A-Z0-9_]*$/, 'Invalid environment variable name format')
    .max(100, 'Environment variable name too long'),

  /** URL validation for API endpoints */
  url: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => url.startsWith('https://') || url.startsWith('http://localhost'),
      'URL must be HTTPS or localhost'
    )
    .refine((url) => !url.includes('javascript:'), 'URL cannot contain javascript protocol'),

  /** API key validation */
  apiKey: z
    .string()
    .min(10, 'API key too short')
    .max(500, 'API key too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid API key format'),
};
