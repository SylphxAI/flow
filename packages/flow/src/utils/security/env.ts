/**
 * Environment variable validation utilities.
 */

import type { z } from 'zod';
import { securitySchemas } from './schemas.js';

/**
 * Environment variable validation utilities
 */
export const envSecurity = {
  /**
   * Validates an environment variable name and value
   */
  validateEnvVar: (name: string, value?: string): { name: string; value: string } => {
    const validatedName = securitySchemas.envVarName.parse(name);

    if (value === undefined) {
      throw new Error(`Environment variable ${validatedName} is required but not set`);
    }

    // Validate based on variable type
    if (validatedName.includes('URL') || validatedName.includes('BASE_URL')) {
      securitySchemas.url.parse(value);
    } else if (validatedName.includes('KEY') || validatedName.includes('SECRET')) {
      // For keys, check minimum length and allowed characters
      if (value.length < 10) {
        throw new Error(`API key ${validatedName} is too short`);
      }
    }

    return { name: validatedName, value };
  },

  /**
   * Safely gets an environment variable with validation
   */
  getEnvVar: (name: string, defaultValue?: string): string | undefined => {
    try {
      const value = process.env[name];
      if (value === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Environment variable ${name} is not set`);
      }

      const validated = envSecurity.validateEnvVar(name, value);
      return validated.value;
    } catch (error) {
      console.warn(`Environment variable validation failed for ${name}:`, error);
      return defaultValue;
    }
  },

  /**
   * Validates multiple environment variables
   */
  validateEnvVars: (
    vars: Record<string, { required?: boolean; schema?: z.ZodSchema }>
  ): Record<string, string> => {
    const result: Record<string, string> = {};

    for (const [name, config] of Object.entries(vars)) {
      const value = process.env[name];

      if (value === undefined) {
        if (config.required) {
          throw new Error(`Required environment variable ${name} is not set`);
        }
        continue;
      }

      try {
        // Use custom schema if provided, otherwise use default validation
        if (config.schema) {
          result[name] = config.schema.parse(value);
        } else {
          const validated = envSecurity.validateEnvVar(name, value);
          result[name] = validated.value;
        }
      } catch (error) {
        throw new Error(`Environment variable ${name} validation failed: ${error}`);
      }
    }

    return result;
  },
};
