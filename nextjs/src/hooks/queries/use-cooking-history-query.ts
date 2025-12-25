"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCookingHistory,
  getRecipeHistory,
  markAsCooked,
  quickRate,
  updateCookingHistoryEntry,
  deleteCookingHistoryEntry,
} from "@/app/actions/cooking-history";
import type {
  CookingHistoryWithRecipe,
  MarkAsCookedInput,
} from "@/types/cooking-history";

// Query keys for cooking history cache management
export const cookingHistoryKeys = {
  all: ["cooking-history"] as const,
  lists: () => [...cookingHistoryKeys.all, "list"] as const,
  list: (limit?: number) => [...cookingHistoryKeys.lists(), { limit }] as const,
  recipe: (recipeId: string) =>
    [...cookingHistoryKeys.all, "recipe", recipeId] as const,
};

/**
 * Hook to fetch cooking history for the household.
 */
export function useCookingHistory(limit?: number) {
  return useQuery({
    queryKey: cookingHistoryKeys.list(limit),
    queryFn: async () => {
      const result = await getCookingHistory(limit);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as CookingHistoryWithRecipe[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to fetch cooking history for a specific recipe.
 */
export function useRecipeCookingHistory(recipeId: string) {
  return useQuery({
    queryKey: cookingHistoryKeys.recipe(recipeId),
    queryFn: async () => {
      const result = await getRecipeHistory(recipeId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!recipeId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook to mark a recipe as cooked.
 */
export function useMarkAsCooked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: MarkAsCookedInput & {
        modifications?: string | null;
        photo_url?: string | null;
      }
    ) => {
      const result = await markAsCooked(input);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the general list and recipe-specific history
      queryClient.invalidateQueries({ queryKey: cookingHistoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cookingHistoryKeys.recipe(variables.recipe_id),
      });
    },
  });
}

/**
 * Hook to quick-rate a recipe.
 */
export function useQuickRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      rating,
    }: {
      recipeId: string;
      rating: number;
    }) => {
      const result = await quickRate(recipeId, rating);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cookingHistoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: cookingHistoryKeys.recipe(variables.recipeId),
      });
      // Also invalidate recipes since rating updates the recipe
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

/**
 * Hook to update a cooking history entry.
 */
export function useUpdateCookingHistoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        rating?: number | null;
        notes?: string | null;
        modifications?: string | null;
        cooked_at?: string;
        photo_url?: string | null;
      };
    }) => {
      const result = await updateCookingHistoryEntry(id, updates);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookingHistoryKeys.all });
    },
  });
}

/**
 * Hook to delete a cooking history entry.
 */
export function useDeleteCookingHistoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCookingHistoryEntry(id);
      if (result.error) {
        throw new Error(result.error);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookingHistoryKeys.all });
    },
  });
}
