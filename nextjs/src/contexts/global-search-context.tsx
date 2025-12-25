"use client";

/**
 * Global Search Context
 *
 * Manages state for the Notion-style global search modal.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type {
  GlobalSearchContextValue,
  SearchResults,
  SearchableAction,
  SearchResultItem,
  RecentItem,
} from "@/types/global-search";
import { globalSearch } from "@/lib/search/search-actions";
import { searchActions } from "@/lib/search/global-search-index";
import {
  getRecentItems,
  addRecentItem as saveRecentItem,
  clearRecentItems as clearStoredRecentItems,
} from "@/lib/search/recent-items";

// ============================================================================
// Context
// ============================================================================

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface GlobalSearchProviderProps {
  children: ReactNode;
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // Modal state
  const [isOpen, setIsOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Recent items
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Matched actions (client-side)
  const matchedActions = useMemo(() => {
    return query.trim() ? searchActions(query) : [];
  }, [query]);

  // Flatten all results for keyboard navigation
  const flatResults = useMemo((): SearchResultItem[] => {
    const items: SearchResultItem[] = [];

    // Add recipes
    if (results?.recipes) {
      for (const recipe of results.recipes) {
        items.push({
          type: "recipe",
          id: recipe.id,
          label: recipe.title,
          subtitle: [recipe.recipe_type, recipe.protein_type]
            .filter(Boolean)
            .join(" • "),
          imageUrl: recipe.image_url,
          href: `/app/recipes/${recipe.id}`,
          recipe,
        });
      }
    }

    // Add actions
    for (const action of matchedActions) {
      items.push({
        type: "action",
        id: action.id,
        label: action.label,
        subtitle: action.description,
        icon: action.icon,
        href: action.href,
        action,
      });
    }

    // Add profiles
    if (results?.profiles) {
      for (const profile of results.profiles) {
        items.push({
          type: "profile",
          id: profile.id,
          label: profile.username,
          subtitle: [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ") || profile.bio || undefined,
          imageUrl: profile.avatar_url,
          href: `/profile/${profile.username}`,
          profile,
        });
      }
    }

    return items;
  }, [results, matchedActions]);

  // ──────────────────────────────────────────────────────────────────────────
  // Load recent items on mount
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setRecentItems(getRecentItems());
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Search when query changes (debounced)
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const trimmed = query.trim();

    // Clear results for empty query
    if (!trimmed) {
      setResults(null);
      setError(null);
      setSelectedIndex(0);
      return;
    }

    // Skip search for very short queries
    if (trimmed.length < 2) {
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const response = await globalSearch(trimmed);

      if (response.error) {
        setError(response.error);
        setResults(null);
      } else {
        setResults(response.data);
      }

      setIsLoading(false);
      setSelectedIndex(0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // ──────────────────────────────────────────────────────────────────────────
  // Listen for keyboard shortcut event
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
    };

    window.addEventListener("keyboard:openSearch", handleOpenSearch);
    return () => {
      window.removeEventListener("keyboard:openSearch", handleOpenSearch);
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Modal controls
  // ──────────────────────────────────────────────────────────────────────────

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
    setSelectedIndex(0);
    setError(null);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Recent items management
  // ──────────────────────────────────────────────────────────────────────────

  const addRecentItem = useCallback((item: Omit<RecentItem, "visitedAt">) => {
    // Add timestamp before saving
    const itemWithTimestamp: RecentItem = {
      ...item,
      visitedAt: Date.now(),
    };
    saveRecentItem(itemWithTimestamp);
    setRecentItems(getRecentItems());
  }, []);

  const clearRecentItems = useCallback(() => {
    clearStoredRecentItems();
    setRecentItems([]);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Handle selection
  // ──────────────────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      // Capture href before any state changes
      const targetHref = item.href;
      const itemData = {
        type: item.type === "action" ? "page" : item.type,
        id: item.id,
        label: item.label,
        href: item.href,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
        icon: item.icon,
      };

      // Handle function-based actions
      if (item.type === "action" && item.action?.behavior === "function") {
        closeSearch();
        switch (item.action.functionId) {
          case "toggleDarkMode":
            setTheme(theme === "dark" ? "light" : "dark");
            return;

          case "openImportDialog":
            // Navigate to recipes and trigger import dialog
            router.push("/app/recipes?import=true");
            return;

          case "openAddShoppingItem":
            // Navigate to shopping list
            router.push("/app/shop");
            return;

          default:
            console.warn(`Unknown function action: ${item.action.functionId}`);
            return;
        }
      }

      // Handle navigation - navigate first, then close
      if (targetHref) {
        // Add to recent items
        addRecentItem(itemData as Omit<RecentItem, "visitedAt">);

        // Navigate immediately
        router.push(targetHref);

        // Close search after navigation is initiated
        closeSearch();
      }
    },
    [closeSearch, router, setTheme, theme, addRecentItem]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Context value
  // ──────────────────────────────────────────────────────────────────────────

  const value: GlobalSearchContextValue = useMemo(
    () => ({
      isOpen,
      openSearch,
      closeSearch,
      query,
      setQuery,
      results,
      groupedResults: results ? { ...results, actions: matchedActions.map(a => ({
        id: a.id,
        category: "actions" as const,
        title: a.label,
        subtitle: a.description,
        label: a.label,
        description: a.description,
        keywords: a.keywords,
        action_category: a.category,
        icon: a.icon,
        action_type: a.behavior === "navigate" ? "navigation" as const : "command" as const,
        behavior: a.behavior,
        destination: a.href,
        href: a.href,
        command: a.functionId,
        functionId: a.functionId,
      })) } : null,
      matchedActions,
      isLoading,
      error,
      selectedIndex,
      setSelectedIndex,
      flatResults,
      recentItems,
      addRecentItem,
      clearRecentItems,
      handleSelect,
    }),
    [
      isOpen,
      openSearch,
      closeSearch,
      query,
      results,
      matchedActions,
      isLoading,
      error,
      selectedIndex,
      flatResults,
      recentItems,
      addRecentItem,
      clearRecentItems,
      handleSelect,
    ]
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useGlobalSearch(): GlobalSearchContextValue {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error("useGlobalSearch must be used within a GlobalSearchProvider");
  }

  return context;
}
