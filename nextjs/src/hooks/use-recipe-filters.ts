"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecipeType } from "@/types/recipe";

// Filter state interface
export interface RecipeFilterState {
  search: string;
  typeFilter: RecipeType | "all";
  proteinTypeFilter: string;
  tagFilter: string;
  dietFilter: string;
  favoritesOnly: boolean;
  ratingFilter: number[];
  ratedFilter: "all" | "rated" | "unrated";
  sortBy: "recent" | "most-cooked" | "highest-rated" | "alphabetical";
  showFilters: boolean;
}

// Default values for all filters
const DEFAULT_FILTER_STATE: RecipeFilterState = {
  search: "",
  typeFilter: "all",
  proteinTypeFilter: "all",
  tagFilter: "all",
  dietFilter: "all",
  favoritesOnly: false,
  ratingFilter: [],
  ratedFilter: "all",
  sortBy: "recent",
  showFilters: false,
};

const STORAGE_KEY = "recipe_filter_state";
const FILTER_VERSION = 1;

interface StoredFilterState {
  version: number;
  state: RecipeFilterState;
}

// Read filter state from localStorage
function getStoredFilters(): RecipeFilterState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredFilterState = JSON.parse(stored);
      // Version check for future migrations
      if (parsed.version === FILTER_VERSION) {
        return parsed.state;
      }
      // Clear outdated version
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RecipeFilters] Failed to read stored filters:", error);
    }
  }
  return null;
}

// Write filter state to localStorage
function setStoredFilters(state: RecipeFilterState): void {
  if (typeof window === "undefined") return;

  try {
    const stored: StoredFilterState = {
      version: FILTER_VERSION,
      state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RecipeFilters] Failed to save filters:", error);
    }
  }
}

// Clear stored filters from localStorage
export function clearStoredFilters(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RecipeFilters] Failed to clear filters:", error);
    }
  }
}

/**
 * Custom hook for managing recipe filter state with localStorage persistence.
 * Automatically saves filter state to localStorage and restores on mount.
 *
 * @param persistSearch - Whether to persist the search term (default: false)
 *                        Setting to false prevents stale searches on return
 */
export function useRecipeFilters(persistSearch = false) {
  // Initialize with defaults, will hydrate from localStorage in useEffect
  const [filters, setFiltersState] = useState<RecipeFilterState>(DEFAULT_FILTER_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = getStoredFilters();
    if (stored) {
      // Optionally clear search on load
      const hydratedState = persistSearch
        ? stored
        : { ...stored, search: "" };
      setFiltersState(hydratedState);
    }
    setIsHydrated(true);
  }, [persistSearch]);

  // Save to localStorage whenever filters change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      setStoredFilters(filters);
    }
  }, [filters, isHydrated]);

  // Update a single filter value
  const setFilter = useCallback(<K extends keyof RecipeFilterState>(
    key: K,
    value: RecipeFilterState[K]
  ) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const setFilters = useCallback((updates: Partial<RecipeFilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset all filters to defaults
  const clearFilters = useCallback((clearFromStorage = false) => {
    const clearedState = { ...DEFAULT_FILTER_STATE, showFilters: filters.showFilters };
    setFiltersState(clearedState);
    if (clearFromStorage) {
      clearStoredFilters();
    }
  }, [filters.showFilters]);

  // Toggle rating filter
  const toggleRatingFilter = useCallback((rating: number) => {
    setFiltersState((prev) => ({
      ...prev,
      ratingFilter: prev.ratingFilter.includes(rating)
        ? prev.ratingFilter.filter((r) => r !== rating)
        : [...prev.ratingFilter, rating],
    }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters =
    filters.typeFilter !== "all" ||
    filters.proteinTypeFilter !== "all" ||
    filters.tagFilter !== "all" ||
    filters.dietFilter !== "all" ||
    filters.favoritesOnly ||
    filters.ratingFilter.length > 0 ||
    filters.ratedFilter !== "all";

  return {
    // Current filter values
    ...filters,
    // Computed
    hasActiveFilters,
    isHydrated,
    // Actions
    setFilter,
    setFilters,
    clearFilters,
    toggleRatingFilter,
  };
}
