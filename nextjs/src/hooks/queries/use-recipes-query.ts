"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "@/app/actions/recipes";
import type { Recipe, RecipeFormData } from "@/types/recipe";

// Query keys for consistent cache management
export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

/**
 * Hook to fetch all recipes for the current user/household.
 * Uses React Query for caching with 5 minute staleTime.
 */
export function useRecipes() {
  return useQuery({
    queryKey: recipeKeys.lists(),
    queryFn: async () => {
      const result = await getRecipes();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as Recipe[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single recipe by ID.
 */
export function useRecipe(id: string) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      const result = await getRecipe(id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as Recipe;
    },
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new recipe with cache invalidation.
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: RecipeFormData) => {
      const result = await createRecipe(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as Recipe;
    },
    onSuccess: () => {
      // Invalidate recipes list to trigger refetch
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Hook to update a recipe with optimistic updates.
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: Partial<RecipeFormData>;
    }) => {
      const result = await updateRecipe(id, formData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as Recipe;
    },
    onSuccess: (data) => {
      // Update both the list and the individual recipe cache
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.setQueryData(recipeKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete a recipe with optimistic updates.
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRecipe(id);
      if (result.error) {
        throw new Error(result.error);
      }
      return id;
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.lists() });

      // Snapshot the previous value
      const previousRecipes = queryClient.getQueryData<Recipe[]>(
        recipeKeys.lists()
      );

      // Optimistically remove from the list
      if (previousRecipes) {
        queryClient.setQueryData(
          recipeKeys.lists(),
          previousRecipes.filter((r) => r.id !== deletedId)
        );
      }

      return { previousRecipes };
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      if (context?.previousRecipes) {
        queryClient.setQueryData(recipeKeys.lists(), context.previousRecipes);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}
