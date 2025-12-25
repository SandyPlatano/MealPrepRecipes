/**
 * Recent Items LocalStorage Utility
 *
 * Manages recent search selections in localStorage with FIFO queue (max 8 items).
 * Browser-only module with graceful error handling.
 */

import type { RecentItem } from "@/types/global-search";

const STORAGE_KEY = "global-search-recent-items";
const MAX_RECENT_ITEMS = 8;

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Get recent items from localStorage
 * @returns Array of recent items, newest first
 */
export function getRecentItems(): RecentItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate that we got an array
    if (!Array.isArray(parsed)) {
      console.warn("[recent-items] Invalid data format in localStorage, clearing");
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("[recent-items] Failed to parse localStorage data:", error);
    // Clear corrupted data
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

/**
 * Add an item to recent items list
 * Maintains FIFO queue with max 8 items, newest first
 * @param item - Item to add (must include visitedAt timestamp)
 */
export function addRecentItem(item: RecentItem): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const current = getRecentItems();

    // Remove existing entry for this item (by id + type)
    const filtered = current.filter(
      (existing) => !(existing.id === item.id && existing.type === item.type)
    );

    // Add new item at the beginning and limit to MAX_RECENT_ITEMS
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[recent-items] Failed to save to localStorage:", error);
    // Non-critical failure, don't throw
  }
}

/**
 * Clear all recent items from localStorage
 */
export function clearRecentItems(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[recent-items] Failed to clear localStorage:", error);
    // Non-critical failure, don't throw
  }
}
