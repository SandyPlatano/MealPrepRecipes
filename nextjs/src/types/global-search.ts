/**
 * Global Search Types
 *
 * Types for the Notion-style global search feature.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Result Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecipeSearchResult {
  id: string;
  title: string;
  recipe_type: string | null;
  category: string | null;
  image_url: string | null;
  protein_type: string | null;
  relevance: number;
}

export interface ProfileSearchResult {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_recipe_count: number;
}

export interface SearchResults {
  recipes: RecipeSearchResult[];
  profiles: ProfileSearchResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export type ActionCategory = "navigation" | "create" | "utility";
export type ActionBehavior = "navigate" | "function";

export interface SearchableAction {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: ActionCategory;
  icon: string; // Lucide icon name
  behavior: ActionBehavior;
  href?: string; // For navigation actions
  functionId?: string; // For function actions
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Items Types
// ─────────────────────────────────────────────────────────────────────────────

export type RecentItemType = "recipe" | "page" | "profile";

export interface RecentItem {
  type: RecentItemType;
  id: string;
  label: string;
  href: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string; // Lucide icon name for pages
  visitedAt: number; // timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Result Item (for keyboard navigation)
// ─────────────────────────────────────────────────────────────────────────────

export type SearchResultItemType = "recipe" | "action" | "profile";

export interface SearchResultItem {
  type: SearchResultItemType;
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string;
  href?: string;
  action?: SearchableAction;
  recipe?: RecipeSearchResult;
  profile?: ProfileSearchResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GlobalSearchContextValue {
  // Modal state
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Search state
  query: string;
  setQuery: (query: string) => void;

  // Results
  results: SearchResults | null;
  matchedActions: SearchableAction[];
  isLoading: boolean;
  error: string | null;

  // Keyboard navigation
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  flatResults: SearchResultItem[];

  // Recent items
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, "visitedAt">) => void;
  clearRecentItems: () => void;

  // Selection handler
  handleSelect: (item: SearchResultItem) => void;
}
