/**
 * Cryptographic utilities for security.
 */

import crypto from 'node:crypto';

/**
 * Cryptographic utilities for security
 */
export const cryptoUtils = {
  /**
   * Generates a secure random string
   */
  generateSecureRandom: (length = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Generates a cryptographically secure random ID
   */
  generateSecureId: (): string => {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString('hex');
    return `${timestamp}-${random}`;
  },

  /**
   * Creates a secure hash of data
   */
  hash: (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Verifies data integrity with HMAC
   */
  verifyHMAC: (data: string, signature: string, secret: string): boolean => {
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  },
};
