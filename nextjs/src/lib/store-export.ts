/**
 * Store export utilities for sending shopping lists to external stores
 */

import type { ShoppingListItem } from "@/types/shopping-list";

export interface ExportableItem {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
}

/**
 * Format item for search query
 */
function formatItemForSearch(item: ExportableItem): string {
  // Combine quantity, unit, and ingredient for better search results
  const parts = [item.quantity, item.unit, item.ingredient].filter(Boolean);
  return parts.join(" ").trim();
}

/**
 * Generate Walmart search URL for a single item
 * Opens Walmart search with the ingredient
 */
export function getWalmartSearchUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(formatItemForSearch(item));
  return `https://www.walmart.com/search?q=${searchTerm}`;
}

/**
 * Generate Walmart grocery search URL
 * More specific to grocery items
 */
export function getWalmartGroceryUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(formatItemForSearch(item));
  return `https://www.walmart.com/browse/food/${searchTerm}`;
}

/**
 * Generate a shareable text list for Walmart
 * Users can paste this into Walmart's list feature
 */
export function formatForWalmartList(items: ExportableItem[]): string {
  return items
    .map((item) => {
      const display = formatItemForSearch(item);
      return display;
    })
    .join("\n");
}

/**
 * Generate Instacart search URL
 */
export function getInstacartSearchUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(item.ingredient);
  return `https://www.instacart.com/store/search/${searchTerm}`;
}

/**
 * Generate Instacart URL with multiple items
 * Note: Instacart doesn't have a public API for adding to cart,
 * but we can create a search-based flow
 */
export function getInstacartUrl(items: ExportableItem[]): string {
  // Instacart doesn't support bulk add via URL, so we use search
  const firstItem = items[0];
  if (!firstItem) {
    return "https://www.instacart.com";
  }
  return getInstacartSearchUrl(firstItem);
}

/**
 * Generate Amazon Fresh search URL
 */
export function getAmazonFreshSearchUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(item.ingredient);
  return `https://www.amazon.com/s?k=${searchTerm}&i=amazonfresh`;
}

/**
 * Generate Kroger search URL
 */
export function getKrogerSearchUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(item.ingredient);
  return `https://www.kroger.com/search?query=${searchTerm}`;
}

/**
 * Generate Target search URL for grocery
 */
export function getTargetSearchUrl(item: ExportableItem): string {
  const searchTerm = encodeURIComponent(item.ingredient);
  return `https://www.target.com/s?searchTerm=${searchTerm}&category=5xt1a`;
}

export type SupportedStore =
  | "walmart"
  | "instacart"
  | "amazon_fresh"
  | "kroger"
  | "target";

export interface StoreInfo {
  id: SupportedStore;
  name: string;
  icon: string;
  color: string;
  getSearchUrl: (item: ExportableItem) => string;
  supportsDirectAdd: boolean;
}

export const SUPPORTED_STORES: StoreInfo[] = [
  {
    id: "walmart",
    name: "Walmart",
    icon: "🔵",
    color: "#0071dc",
    getSearchUrl: getWalmartSearchUrl,
    supportsDirectAdd: false,
  },
  {
    id: "instacart",
    name: "Instacart",
    icon: "🥕",
    color: "#43b02a",
    getSearchUrl: getInstacartSearchUrl,
    supportsDirectAdd: false,
  },
  {
    id: "amazon_fresh",
    name: "Amazon Fresh",
    icon: "📦",
    color: "#ff9900",
    getSearchUrl: getAmazonFreshSearchUrl,
    supportsDirectAdd: false,
  },
  {
    id: "kroger",
    name: "Kroger",
    icon: "🛒",
    color: "#e31837",
    getSearchUrl: getKrogerSearchUrl,
    supportsDirectAdd: false,
  },
  {
    id: "target",
    name: "Target",
    icon: "🎯",
    color: "#cc0000",
    getSearchUrl: getTargetSearchUrl,
    supportsDirectAdd: false,
  },
];

/**
 * Get store info by ID
 */
export function getStoreById(id: SupportedStore): StoreInfo | undefined {
  return SUPPORTED_STORES.find((store) => store.id === id);
}

/**
 * Format shopping list for plain text export
 */
export function formatAsPlainText(
  items: ExportableItem[],
  groupedByCategory?: Record<string, ExportableItem[]>
): string {
  if (groupedByCategory) {
    let text = "";
    for (const [category, categoryItems] of Object.entries(groupedByCategory)) {
      text += `${category}:\n`;
      for (const item of categoryItems) {
        text += `  • ${formatItemForSearch(item)}\n`;
      }
      text += "\n";
    }
    return text.trim();
  }

  return items.map((item) => `• ${formatItemForSearch(item)}`).join("\n");
}

/**
 * Share list using Web Share API if available
 */
export async function shareList(
  items: ExportableItem[],
  title: string = "Shopping List"
): Promise<boolean> {
  const text = formatAsPlainText(items);

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
      return false;
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Open store with first item search (since bulk add isn't supported)
 * Returns the URL that was opened
 */
export function openStoreWithItems(
  store: SupportedStore,
  items: ExportableItem[]
): string | null {
  const storeInfo = getStoreById(store);
  if (!storeInfo || items.length === 0) {
    return null;
  }

  const url = storeInfo.getSearchUrl(items[0]);
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}

/**
 * Copy items to clipboard formatted for store use
 */
export async function copyForStore(
  items: ExportableItem[]
): Promise<boolean> {
  const text = items.map((item) => formatItemForSearch(item)).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

