"use client";

import { useState, useEffect } from "react";
import { getCustomRecipeTypes } from "@/app/actions/custom-recipe-types";
import type { CustomRecipeType } from "@/types/custom-recipe-type";

interface UseCustomRecipeTypesResult {
  recipeTypes: CustomRecipeType[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache custom recipe types for a household.
 * Used primarily by the RecipeForm to populate the recipe type dropdown.
 */
export function useCustomRecipeTypes(
  householdId: string | null | undefined
): UseCustomRecipeTypesResult {
  const [recipeTypes, setRecipeTypes] = useState<CustomRecipeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipeTypes = async () => {
    if (!householdId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getCustomRecipeTypes(householdId);

    if (result.error) {
      setError(result.error);
      setRecipeTypes([]);
    } else {
      setRecipeTypes(result.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecipeTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId]);

  return {
    recipeTypes,
    isLoading,
    error,
    refresh: fetchRecipeTypes,
  };
}
