"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getNetworkErrorMessage } from "@/lib/utils";
import type { RecipeFormData } from "@/types/recipe";

interface ParsedRecipe {
  title: string;
  recipe_type: string;
  category: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  base_servings?: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  notes: string;
  source_url?: string;
}

export interface UrlImportStatus {
  url: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
  recipe?: RecipeFormData;
}

export interface ImportStats {
  remaining: number;
  limit: number;
}

export function useRecipeImport() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<RecipeFormData | null>(null);
  const [parsedRecipes, setParsedRecipes] = useState<RecipeFormData[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [importStatuses, setImportStatuses] = useState<UrlImportStatus[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [nutritionEnabled, setNutritionEnabled] = useState(false);

  // Check if nutrition tracking is enabled and fetch import stats
  useEffect(() => {
    async function checkNutritionTracking() {
      try {
        const response = await fetch("/api/nutrition/tracking-status");
        if (response.ok) {
          const data = await response.json();
          setNutritionEnabled(data.enabled || false);
        }
      } catch (error) {
        console.error("Failed to check nutrition tracking status:", error);
      }
    }

    async function fetchImportStats() {
      try {
        const response = await fetch("/api/import-stats");
        if (response.ok) {
          const data = await response.json();
          setImportStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch import stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    checkNutritionTracking();
    fetchImportStats();
  }, []);

  const transformParsedRecipe = (parsed: ParsedRecipe, sourceUrl?: string): RecipeFormData => ({
    title: parsed.title,
    recipe_type: parsed.recipe_type as RecipeFormData["recipe_type"],
    category: parsed.category,
    prep_time: parsed.prep_time,
    cook_time: parsed.cook_time,
    servings: parsed.servings,
    base_servings: parsed.base_servings,
    ingredients: parsed.ingredients,
    instructions: parsed.instructions,
    tags: parsed.tags,
    notes: parsed.notes,
    source_url: parsed.source_url || sourceUrl,
    is_shared_with_household: true,
  });

  const handlePasteSubmit = useCallback(async (pasteText: string) => {
    if (!pasteText.trim()) {
      toast.error("You gotta paste something first");
      return;
    }

    setIsParsing(true);
    try {
      const response = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });

      if (!response.ok) {
        if (!response.body) {
          throw new Error("Network error. Please check your connection.");
        }
        const error = await response.json().catch(() => ({
          error: "Failed to parse recipe",
        }));
        throw new Error(error.error || "Failed to parse recipe");
      }

      const parsed: ParsedRecipe = await response.json();
      setParsedRecipe(transformParsedRecipe(parsed));
      toast.success("Got it! Review and save when ready.");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error(getNetworkErrorMessage(error));
    } finally {
      setIsParsing(false);
    }
  }, []);

  const importSingleUrl = useCallback(async (
    url: string
  ): Promise<{ success: boolean; recipe?: RecipeFormData; error?: string }> => {
    try {
      // First scrape the URL
      const scrapeResponse = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        if (!scrapeResponse.body) {
          throw new Error("Network error");
        }
        const error = await scrapeResponse.json().catch(() => ({
          error: "Failed to fetch recipe page",
        }));
        throw new Error(error.error || "Failed to fetch recipe page");
      }

      const { html } = await scrapeResponse.json();

      // Then parse the HTML
      const parseResponse = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: html, sourceUrl: url }),
      });

      if (!parseResponse.ok) {
        if (!parseResponse.body) {
          throw new Error("Network error");
        }
        const error = await parseResponse.json().catch(() => ({
          error: "Failed to parse recipe",
        }));
        throw new Error(error.error || "Failed to parse recipe");
      }

      const parsed: ParsedRecipe = await parseResponse.json();
      return {
        success: true,
        recipe: transformParsedRecipe(parsed, url),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to import recipe",
      };
    }
  }, []);

  const handleUrlSubmit = useCallback(async (validUrls: string[]) => {
    if (validUrls.length === 0) {
      toast.error("Enter at least one valid URL");
      return;
    }

    // Check daily limit
    if (importStats && validUrls.length > importStats.remaining) {
      toast.error(
        `You can only import ${importStats.remaining} more recipe${importStats.remaining === 1 ? "" : "s"} today`
      );
      return;
    }

    setIsParsing(true);

    // Initialize statuses
    const initialStatuses: UrlImportStatus[] = validUrls.map((url) => ({
      url,
      status: "pending",
    }));
    setImportStatuses(initialStatuses);

    const successfulRecipes: RecipeFormData[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process URLs sequentially
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];

      // Update status to processing
      setImportStatuses((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "processing" } : s
        )
      );

      const result = await importSingleUrl(url);

      if (result.success && result.recipe) {
        successfulRecipes.push(result.recipe);
        successCount++;
        setImportStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "success", recipe: result.recipe } : s
          )
        );
      } else {
        errorCount++;
        setImportStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "error", error: result.error } : s
          )
        );
      }
    }

    // Update import stats after batch
    if (successCount > 0 && importStats) {
      setImportStats({
        ...importStats,
        remaining: importStats.remaining - successCount,
      });
    }

    setIsParsing(false);

    // Show result summary
    if (successCount > 0 && errorCount === 0) {
      toast.success(
        `Successfully imported ${successCount} recipe${successCount === 1 ? "" : "s"}!`
      );
      setParsedRecipes(successfulRecipes);
      setCurrentReviewIndex(0);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(
        `Imported ${successCount} recipe${successCount === 1 ? "" : "s"}, ${errorCount} failed`
      );
      setParsedRecipes(successfulRecipes);
      setCurrentReviewIndex(0);
    } else {
      toast.error("All imports failed. Try pasting the recipe text instead.");
    }
  }, [importStats, importSingleUrl]);

  const handleClearParsed = useCallback(() => {
    setParsedRecipe(null);
    setParsedRecipes([]);
    setCurrentReviewIndex(0);
    setImportStatuses([]);
  }, []);

  const handleNextRecipe = useCallback(() => {
    if (currentReviewIndex < parsedRecipes.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }
  }, [currentReviewIndex, parsedRecipes.length]);

  const handlePrevRecipe = useCallback(() => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }
  }, [currentReviewIndex]);

  const handleRecipeSaved = useCallback(() => {
    // Remove the saved recipe from the list
    const newRecipes = parsedRecipes.filter((_, i) => i !== currentReviewIndex);
    setParsedRecipes(newRecipes);

    // Adjust index if needed
    if (currentReviewIndex >= newRecipes.length && newRecipes.length > 0) {
      setCurrentReviewIndex(newRecipes.length - 1);
    } else if (newRecipes.length === 0) {
      handleClearParsed();
      toast.success("All recipes saved!");
    }
  }, [parsedRecipes, currentReviewIndex, handleClearParsed]);

  const handleRemoveFromQueue = useCallback((index: number) => {
    const recipeTitle = parsedRecipes[index]?.title || `Recipe ${index + 1}`;
    const newRecipes = parsedRecipes.filter((_, i) => i !== index);
    setParsedRecipes(newRecipes);

    // Adjust current index if needed
    if (newRecipes.length === 0) {
      handleClearParsed();
    } else if (currentReviewIndex >= newRecipes.length) {
      setCurrentReviewIndex(newRecipes.length - 1);
    } else if (index < currentReviewIndex) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }

    toast.success(`Removed "${recipeTitle}" from queue`);
  }, [parsedRecipes, currentReviewIndex, handleClearParsed]);

  return {
    // State
    isParsing,
    parsedRecipe,
    parsedRecipes,
    currentReviewIndex,
    importStatuses,
    importStats,
    isLoadingStats,
    nutritionEnabled,

    // Setters
    setCurrentReviewIndex,

    // Handlers
    handlePasteSubmit,
    handleUrlSubmit,
    handleClearParsed,
    handleNextRecipe,
    handlePrevRecipe,
    handleRecipeSaved,
    handleRemoveFromQueue,
  };
}
