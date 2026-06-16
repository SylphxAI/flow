/**
 * Simple in-memory rate limiting.
 */

/**
 * Simple in-memory rate limiting
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests = 100,
    private windowMs = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter((timestamp) => timestamp > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, filtered);
      }
    }
  }
}
