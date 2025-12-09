/**
 * Production-ready rate limiting with Upstash Redis
 * Falls back to in-memory if Redis is not configured
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

// Initialize Redis client if credentials are available
let redis: Redis | null = null;
const rateLimiters: Map<string, Ratelimit> = new Map();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Get or create a rate limiter for a specific limit/window combination
 */
function getRateLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;

  const key = `${limit}-${windowMs}`;
  
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
    analytics: true,
    prefix: "ratelimit",
  });

  rateLimiters.set(key, limiter);
  return limiter;
}

/**
 * In-memory fallback for development or when Redis is not configured
 */
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    inMemoryStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => inMemoryStore.delete(key));
  }, 10 * 60 * 1000);
}

function rateLimitInMemory(options: RateLimitOptions): RateLimitResult {
  const { identifier, limit, windowMs } = options;
  const now = Date.now();
  
  const entry = inMemoryStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    inMemoryStore.set(identifier, { count: 1, resetTime });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }
  
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis in production, falls back to in-memory for development
 */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { identifier, limit, windowMs } = options;
  
  const limiter = getRateLimiter(limit, windowMs);
  
  // Use Redis if available
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      // Redis failed, fall back to in-memory
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Rate Limit] Redis failed, using in-memory fallback:', error);
      }
    }
  }
  
  // Fallback to in-memory
  return rateLimitInMemory(options);
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string {
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
  
  return 'unknown';
}

