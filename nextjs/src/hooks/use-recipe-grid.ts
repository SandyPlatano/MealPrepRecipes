"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import { useRecipeFilters } from "./use-recipe-filters";

interface UseRecipeGridParams {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts: Record<string, number>;
  folderRecipeIds: string[] | null;
}

const RECIPES_PER_PAGE = 20;

export function useRecipeGrid({
  recipes,
  recipeCookCounts,
  folderRecipeIds,
}: UseRecipeGridParams) {
  const {
    search,
    typeFilter,
    proteinTypeFilter,
    tagFilter,
    dietFilter,
    favoritesOnly,
    ratingFilter,
    minRating,
    ratedFilter,
    sortBy,
    isHydrated,
  } = useRecipeFilters();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Extract unique proteins and tags from recipes
  const { proteins, tags } = useMemo(() => {
    const proteinSet = new Set<string>();
    const tagSet = new Set<string>();

    recipes.forEach((recipe) => {
      if (recipe.protein_type) {
        proteinSet.add(recipe.protein_type);
      }
      recipe.tags.forEach((tag) => tagSet.add(tag));
    });

    return {
      proteins: Array.from(proteinSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [recipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
      // Folder filter (applied first if set) - always apply regardless of hydration
      if (folderRecipeIds !== null) {
        if (!folderRecipeIds.includes(recipe.id)) {
          return false;
        }
      }

      // Only apply localStorage-based filters after hydration
      if (!isHydrated) {
        return true;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((i) => i.toLowerCase().includes(searchLower)) ||
          recipe.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
          recipe.category?.toLowerCase().includes(searchLower) ||
          recipe.protein_type?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "all" && recipe.recipe_type !== typeFilter) {
        return false;
      }

      // Protein type filter
      if (proteinTypeFilter !== "all" && recipe.protein_type !== proteinTypeFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter !== "all" && !recipe.tags.includes(tagFilter)) {
        return false;
      }

      // Diet filter (searches tags for matching diet type)
      if (dietFilter !== "all") {
        const hasDietTag = recipe.tags.some(
          (tag) => tag.toLowerCase() === dietFilter.toLowerCase()
        );
        if (!hasDietTag) return false;
      }

      // Favorites filter
      if (favoritesOnly && !recipe.is_favorite) {
        return false;
      }

      // Rating filter - legacy checkbox style
      if (ratingFilter.length > 0) {
        if (recipe.rating === null || !ratingFilter.includes(recipe.rating)) {
          return false;
        }
      }

      // Minimum rating filter - new interactive style
      if (minRating !== null) {
        if (recipe.rating === null || recipe.rating < minRating) {
          return false;
        }
      }

      // Rated/Unrated filter
      if (ratedFilter === "rated" && recipe.rating === null) {
        return false;
      }
      if (ratedFilter === "unrated" && recipe.rating !== null) {
        return false;
      }

      return true;
    });

    // Sort recipes
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "most-cooked":
          const countA = recipeCookCounts[a.id] || 0;
          const countB = recipeCookCounts[b.id] || 0;
          return countB - countA;
        case "highest-rated":
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    recipes,
    search,
    typeFilter,
    proteinTypeFilter,
    tagFilter,
    dietFilter,
    favoritesOnly,
    ratingFilter,
    minRating,
    ratedFilter,
    sortBy,
    recipeCookCounts,
    folderRecipeIds,
    isHydrated,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, proteinTypeFilter, tagFilter, dietFilter, favoritesOnly, ratingFilter, minRating, ratedFilter, sortBy, folderRecipeIds]);

  // Scroll to top of grid when page changes (smooth scroll)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;

  // Get recipes to display (paginated)
  const visibleRecipes = useMemo(() => {
    return filteredRecipes.slice(startIndex, endIndex);
  }, [filteredRecipes, startIndex, endIndex]);

  // Generate page numbers to display (show current ± 2 pages with ellipsis)
  const getPageNumbers = useCallback(() => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // Maximum page numbers to show

    if (totalPages <= showPages + 2) {
      // Show all pages if there aren't many
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // Computed data
    proteins,
    tags,
    filteredRecipes,
    visibleRecipes,
    totalPages,
    startIndex,
    endIndex,
    // State
    currentPage,
    gridRef,
    // Actions
    setCurrentPage,
    getPageNumbers,
  };
}
