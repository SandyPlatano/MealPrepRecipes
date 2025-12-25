/**
 * Global Search Type Definitions
 *
 * Comprehensive type system for global search functionality covering:
 * - Recipes, Quick Actions, and Public User Profiles
 * - Grouped search results with category organization
 * - Recent items with localStorage persistence (max 8)
 * - Keyboard navigation state management
 */

// ─────────────────────────────────────────────────────────────────────────────
// Base Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Category types for search result grouping
 */
export type SearchCategory = 'recipes' | 'actions' | 'profiles';

/**
 * Base search result interface
 * All search result types extend this foundation
 */
export interface SearchResult {
  /** Unique identifier for the search result */
  id: string;
  /** Category for result grouping */
  category: SearchCategory;
  /** Display title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recipe Search Results
// ─────────────────────────────────────────────────────────────────────────────

export interface RecipeSearchResult extends SearchResult {
  category: 'recipes';
  id: string;
  title: string;
  recipe_type: string | null;
  category_name: string | null;
  image_url: string | null;
  protein_type: string | null;
  cook_time: number | null;
  prep_time: number | null;
  servings: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  tags: string[];
  description: string | null;
  relevance: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Search Results
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileSearchResult extends SearchResult {
  category: 'profiles';
  id: string;
  username: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_recipe_count: number;
  follower_count: number | null;
  is_following: boolean | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Search Results
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Action type definitions for quick actions
 */
export type QuickActionType =
  | 'navigation'      // Navigate to a route
  | 'modal'           // Open a modal dialog
  | 'command'         // Execute a command/function
  | 'external';       // Open external link

export type ActionCategory = "navigation" | "create" | "utility";
export type ActionBehavior = "navigate" | "function";

export interface ActionSearchResult extends SearchResult {
  category: 'actions';
  id: string;
  label: string;
  description: string;
  keywords: string[];
  action_category: ActionCategory;
  icon: string; // Lucide icon name
  action_type: QuickActionType;
  behavior: ActionBehavior;
  destination?: string; // href for navigation
  href?: string; // For navigation actions
  command?: string; // command function name
  functionId?: string; // For function actions
  shortcut?: string; // Keyboard shortcut display
}

/**
 * Searchable action for the quick actions index
 * Simpler interface for action definitions
 */
export interface SearchableAction {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: ActionCategory;
  icon: string;
  behavior: ActionBehavior;
  href?: string;
  functionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouped Search Results
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search results grouped by category
 * Used for organizing and rendering results by section
 */
export interface GroupedSearchResults {
  recipes: RecipeSearchResult[];
  actions: ActionSearchResult[];
  profiles: ProfileSearchResult[];
}

/**
 * Legacy search results interface
 * @deprecated Use GroupedSearchResults instead
 */
export interface SearchResults {
  recipes: RecipeSearchResult[];
  profiles: ProfileSearchResult[];
}

/**
 * Flattened search result union type
 * For handling any search result type generically
 */
export type AnySearchResult = RecipeSearchResult | ActionSearchResult | ProfileSearchResult;

// ─────────────────────────────────────────────────────────────────────────────
// Recent Items (localStorage persistence - max 8 items)
// ─────────────────────────────────────────────────────────────────────────────

export type RecentItemType = "recipe" | "action" | "page" | "profile";

/**
 * Recent item stored in localStorage
 * Lightweight version for persistence with timestamp ordering
 */
export interface RecentItem {
  type: RecentItemType;
  id: string;
  label: string;
  href: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string; // Lucide icon name for pages/actions
  visitedAt: number; // timestamp (ms since epoch)
  metadata?: RecentItemMetadata;
}

/**
 * Metadata union type for recent items
 * Stores minimal data needed to reconstruct search results
 */
export type RecentItemMetadata =
  | RecentRecipeMetadata
  | RecentActionMetadata
  | RecentProfileMetadata;

/**
 * Recipe-specific recent item metadata
 */
export interface RecentRecipeMetadata {
  type: 'recipe';
  recipeId: string;
  recipeName: string;
  imageUrl?: string | null;
  cookTime?: number | null;
}

/**
 * Action-specific recent item metadata
 */
export interface RecentActionMetadata {
  type: 'action';
  actionType: QuickActionType;
  icon: string;
  destination?: string;
  command?: string;
}

/**
 * Profile-specific recent item metadata
 */
export interface RecentProfileMetadata {
  type: 'profile';
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Result Item (for keyboard navigation)
// ─────────────────────────────────────────────────────────────────────────────

export type SearchResultItemType = "recipe" | "action" | "profile";

/**
 * Unified search result item for keyboard navigation
 * Flattened representation for sequential keyboard traversal
 */
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
// Global Search State Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global search modal state
 * Manages search UI, results, navigation, and recent items
 */
export interface GlobalSearchState {
  /** Whether search modal is open */
  isOpen: boolean;
  /** Current search query string */
  query: string;
  /** Grouped search results */
  results: GroupedSearchResults;
  /** Currently selected result index (for keyboard navigation) */
  selectedIndex: number;
  /** Recent search items (max 8, stored in localStorage) */
  recentItems: RecentItem[];
  /** Loading state for async search */
  isLoading: boolean;
  /** Error message if search fails */
  error: string | null;
}

/**
 * Context value for Global Search Provider
 */
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
  groupedResults: GroupedSearchResults | null;
  matchedActions: SearchableAction[];
  isLoading: boolean;
  error: string | null;

  // Keyboard navigation
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  flatResults: SearchResultItem[];

  // Recent items (max 8)
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, "visitedAt">) => void;
  clearRecentItems: () => void;

  // Selection handler
  handleSelect: (item: SearchResultItem) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Action Types (for state management reducers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Action types for search state reducer
 */
export type SearchAction =
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: GroupedSearchResults }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INCREMENT_SELECTION' }
  | { type: 'DECREMENT_SELECTION' }
  | { type: 'RESET_SELECTION' }
  | { type: 'ADD_RECENT_ITEM'; payload: RecentItem }
  | { type: 'CLEAR_RECENT_ITEMS' };

// ─────────────────────────────────────────────────────────────────────────────
// Search Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global search configuration constants
 */
export interface SearchConfig {
  /** Maximum number of recent items to store */
  maxRecentItems: number;
  /** Debounce delay for search input (ms) */
  debounceMs: number;
  /** Minimum query length to trigger search */
  minQueryLength: number;
  /** localStorage key for recent items */
  recentItemsKey: string;
  /** Maximum results per category */
  maxResultsPerCategory: number;
}

/**
 * Default search configuration
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxRecentItems: 8,
  debounceMs: 300,
  minQueryLength: 1,
  recentItemsKey: 'global-search-recent',
  maxResultsPerCategory: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards and Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type guard for recipe results
 */
export function isRecipeResult(result: AnySearchResult): result is RecipeSearchResult {
  return result.category === 'recipes';
}

/**
 * Type guard for action results
 */
export function isActionResult(result: AnySearchResult): result is ActionSearchResult {
  return result.category === 'actions';
}

/**
 * Type guard for profile results
 */
export function isProfileResult(result: AnySearchResult): result is ProfileSearchResult {
  return result.category === 'profiles';
}

/**
 * Extract category from result
 */
export function getResultCategory(result: AnySearchResult): SearchCategory {
  return result.category;
}

/**
 * Convert grouped results to flat array for keyboard navigation
 */
export function flattenResults(grouped: GroupedSearchResults): AnySearchResult[] {
  return [
    ...grouped.recipes,
    ...grouped.actions,
    ...grouped.profiles,
  ];
}

/**
 * Get total result count from grouped results
 */
export function getTotalResultCount(grouped: GroupedSearchResults): number {
  return grouped.recipes.length + grouped.actions.length + grouped.profiles.length;
}
