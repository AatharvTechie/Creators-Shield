class YouTubeRateLimiter {
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 50; // Conservative limit
  private readonly RESET_INTERVAL = 60 * 1000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Reset counter if a minute has passed
    if (now - this.lastResetTime > this.RESET_INTERVAL) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if we're under the limit
    if (this.requestCount < this.MAX_REQUESTS_PER_MINUTE) {
      this.requestCount++;
      return true;
    }

    return false;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    
    if (now - this.lastResetTime > this.RESET_INTERVAL) {
      return this.MAX_REQUESTS_PER_MINUTE;
    }

    return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - this.requestCount);
  }

  getTimeUntilReset(): number {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;
    return Math.max(0, this.RESET_INTERVAL - timeSinceReset);
  }
}

// Create a singleton instance
export const youtubeRateLimiter = new YouTubeRateLimiter();

export function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (!youtubeRateLimiter.canMakeRequest()) {
    const remainingTime = youtubeRateLimiter.getTimeUntilReset();
    throw new Error(`YouTube API rate limit exceeded. Please wait ${Math.ceil(remainingTime / 1000)} seconds.`);
  }
  
  return fn();
} 