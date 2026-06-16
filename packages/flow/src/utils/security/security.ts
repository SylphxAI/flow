/**
 * Security utilities for input validation, sanitization, and safe operations
 * Implements defense-in-depth security principles
 *
 * This module is a barrel that re-exports the cohesive security utility
 * groups from their dedicated implementation files. The public surface
 * (named exports and the aggregate default export) is unchanged.
 */

import { commandSecurity } from './command.js';
import { cryptoUtils } from './crypto.js';
import { envSecurity } from './env.js';
import { pathSecurity } from './path.js';
import { RateLimiter } from './rate-limiter.js';
import { sanitize } from './sanitize.js';
import { securitySchemas } from './schemas.js';

export { commandSecurity } from './command.js';
export { cryptoUtils } from './crypto.js';
export { envSecurity } from './env.js';
export { pathSecurity } from './path.js';
export { RateLimiter } from './rate-limiter.js';
export { sanitize } from './sanitize.js';
export { securitySchemas } from './schemas.js';

export default {
  securitySchemas,
  pathSecurity,
  commandSecurity,
  sanitize,
  envSecurity,
  cryptoUtils,
  RateLimiter,
};
