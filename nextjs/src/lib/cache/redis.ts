/**
 * Redis Cache Utility
 * Provides a simple caching layer for server-side data using Upstash Redis.
 * Falls back to direct fetching if Redis is not configured.
 */

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Check if Redis caching is available
 */
export function isRedisCacheEnabled(): boolean {
  return redis !== null;
}

/**
 * Get a cached value or fetch it if not in cache
 * @param key - Unique cache key
 * @param fetcher - Function to fetch the data if not cached
 * @param ttlSeconds - Time-to-live in seconds (default: 60)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // If Redis is not configured, just fetch directly
  if (!redis) {
    return fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Store in cache with TTL
    await redis.set(key, fresh, { ex: ttlSeconds });

    return fresh;
  } catch (error) {
    // Redis failed, fall back to direct fetch
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis Cache] Failed, fetching directly:", error);
    }
    return fetcher();
  }
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis Cache] Failed to invalidate key:", key, error);
    }
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * @param pattern - Redis key pattern (e.g., "recipes:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    // Scan for matching keys
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis Cache] Failed to invalidate pattern:", pattern, error);
    }
  }
}

/**
 * Get a value from cache without fetching
 * Returns null if not found or Redis is not available
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    return await redis.get<T>(key);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis Cache] Failed to get key:", key, error);
    }
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function setInCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 60
): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis Cache] Failed to set key:", key, error);
    }
  }
}

// =====================================================
// CACHE KEY GENERATORS
// =====================================================

/**
 * Generate cache key for recipes list
 */
export function recipesListKey(householdId: string): string {
  return `recipes:list:${householdId}`;
}

/**
 * Generate cache key for a single recipe
 */
export function recipeDetailKey(recipeId: string): string {
  return `recipes:detail:${recipeId}`;
}

/**
 * Generate cache key for user settings
 */
export function settingsKey(userId: string): string {
  return `settings:${userId}`;
}

/**
 * Generate cache key for nutrition data
 */
export function nutritionKey(householdId: string): string {
  return `nutrition:${householdId}`;
}

/**
 * Generate cache key for folders
 */
export function foldersKey(householdId: string): string {
  return `folders:${householdId}`;
}

/**
 * Generate cache key for smart folder cache
 */
export function smartFolderCacheKey(householdId: string): string {
  return `smartcache:${householdId}`;
}

// =====================================================
// CACHE TTL CONSTANTS
// =====================================================

export const CACHE_TTL = {
  RECIPES_LIST: 300, // 5 minutes
  RECIPE_DETAIL: 300, // 5 minutes
  SETTINGS: 600, // 10 minutes
  NUTRITION: 600, // 10 minutes
  FOLDERS: 300, // 5 minutes
  SMART_FOLDER_CACHE: 300, // 5 minutes
  FAVORITES: 300, // 5 minutes
  COOK_COUNTS: 300, // 5 minutes
} as const;
