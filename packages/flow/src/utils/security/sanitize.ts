/**
 * Input sanitization utilities.
 */

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitizes a string for safe display
   */
  string: (input: string, maxLength = 1000): string => {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Remove null bytes and control characters except newlines and tabs
    const sanitized = input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .substring(0, maxLength);

    return sanitized;
  },

  /**
   * Sanitizes text for log messages (prevents log injection)
   */
  logMessage: (input: string): string => {
    return input
      .replace(/[\r\n]/g, ' ') // Remove line breaks
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .substring(0, 500); // Limit length
  },

  /**
   * Sanitizes user input for file names
   */
  fileName: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .toLowerCase();
  },

  /**
   * Sanitizes content for YAML front matter
   */
  yamlContent: (input: string): string => {
    // Basic YAML sanitization - remove potentially dangerous content
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/<!\[CDATA\[.*?\]\]>/gs, '') // Remove CDATA sections
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove scripts
  },
};
