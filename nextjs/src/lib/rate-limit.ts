/**
 * Simple rate limiting utility
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  /**
   * Unique identifier (usually IP address or user ID)
   */
  identifier: string;
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 */
export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { identifier, limit, windowMs } = options;
  const now = Date.now();
  
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers;
  
  // Vercel-specific headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return 'unknown';
}

