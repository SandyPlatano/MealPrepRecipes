/**
 * Recent Items Storage
 *
 * Manages recently viewed items in localStorage for the global search feature.
 */

import type { RecentItem } from "@/types/global-search";

const STORAGE_KEY = "mealprep-recent-items";
const MAX_RECENT_ITEMS = 8;

/**
 * Get all recent items from localStorage
 */
export function getRecentItems(): RecentItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const items: RecentItem[] = JSON.parse(stored);

    // Validate and filter out malformed items
    return items.filter(
      (item) =>
        item &&
        typeof item.type === "string" &&
        typeof item.id === "string" &&
        typeof item.label === "string" &&
        typeof item.href === "string" &&
        typeof item.visitedAt === "number"
    );
  } catch {
    return [];
  }
}

/**
 * Add a recent item to localStorage
 * - Removes duplicate if exists (same type + id)
 * - Adds new item at the front
 * - Trims to MAX_RECENT_ITEMS
 */
export function addRecentItem(item: Omit<RecentItem, "visitedAt">): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getRecentItems();

    // Remove duplicate if exists
    const filtered = existing.filter(
      (i) => !(i.type === item.type && i.id === item.id)
    );

    // Add new item at the front with timestamp
    const newItems: RecentItem[] = [
      { ...item, visitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (error) {
    console.error("[recent-items] Failed to save recent item:", error);
  }
}

/**
 * Remove a specific recent item
 */
export function removeRecentItem(type: string, id: string): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getRecentItems();
    const filtered = existing.filter(
      (i) => !(i.type === type && i.id === id)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[recent-items] Failed to remove recent item:", error);
  }
}

/**
 * Clear all recent items
 */
export function clearRecentItems(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[recent-items] Failed to clear recent items:", error);
  }
}
