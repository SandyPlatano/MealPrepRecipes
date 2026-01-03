import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { RecipeFormData } from "@/types/recipe";
import { getNetworkErrorMessage } from "@/lib/utils";
import { createRecipe } from "@/app/actions/recipes";

export type ImportMode = "manual" | "paste" | "url";

const MAX_URLS = 5;

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
  const [mode, setMode] = useState<ImportMode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<RecipeFormData | null>(null);
  const [parsedRecipes, setParsedRecipes] = useState<RecipeFormData[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [nutritionEnabled, setNutritionEnabled] = useState(false);
  const [importStatuses, setImportStatuses] = useState<UrlImportStatus[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isCreatingAll, setIsCreatingAll] = useState(false);
  const [createAllProgress, setCreateAllProgress] = useState(0);

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

  // URL input management
  const addUrlInput = () => {
    if (urlInputs.length < MAX_URLS) {
      setUrlInputs([...urlInputs, ""]);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  };

  const updateUrlInput = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = value;
    setUrlInputs(newInputs);
  };

  const validUrls = urlInputs.filter((url) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });

  const handlePasteSubmit = async () => {
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
      setParsedRecipe({
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
        source_url: parsed.source_url,
        is_shared_with_household: true,
      });
      toast.success("Got it! Review and save when ready.");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error(getNetworkErrorMessage(error));
    } finally {
      setIsParsing(false);
    }
  };

  const importSingleUrl = async (
    url: string
  ): Promise<{ success: boolean; recipe?: RecipeFormData; error?: string }> => {
    try {
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
        recipe: {
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
          source_url: parsed.source_url || url,
          is_shared_with_household: true,
        },
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
  };

  const handleUrlSubmit = async () => {
    if (validUrls.length === 0) {
      toast.error("Enter at least one valid URL");
      return;
    }

    if (importStats && validUrls.length > importStats.remaining) {
      toast.error(
        `You can only import ${importStats.remaining} more recipe${importStats.remaining === 1 ? "" : "s"} today`
      );
      return;
    }

    setIsParsing(true);

    const initialStatuses: UrlImportStatus[] = validUrls.map((url) => ({
      url,
      status: "pending",
    }));
    setImportStatuses(initialStatuses);

    const successfulRecipes: RecipeFormData[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];

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

    if (successCount > 0 && importStats) {
      setImportStats({
        ...importStats,
        remaining: importStats.remaining - successCount,
      });
    }

    setIsParsing(false);

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
  };

  const handleClearParsed = () => {
    setParsedRecipe(null);
    setParsedRecipes([]);
    setCurrentReviewIndex(0);
    setPasteText("");
    setUrlInputs([""]);
    setImportStatuses([]);
  };

  const handleNextRecipe = () => {
    if (currentReviewIndex < parsedRecipes.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }
  };

  const handlePrevRecipe = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }
  };

  const handleRecipeSaved = () => {
    const newRecipes = parsedRecipes.filter((_, i) => i !== currentReviewIndex);
    setParsedRecipes(newRecipes);

    if (currentReviewIndex >= newRecipes.length && newRecipes.length > 0) {
      setCurrentReviewIndex(newRecipes.length - 1);
    } else if (newRecipes.length === 0) {
      handleClearParsed();
      toast.success("All recipes saved!");
    }
  };

  const handleRemoveFromQueue = (index: number) => {
    const recipeTitle = parsedRecipes[index]?.title || `Recipe ${index + 1}`;
    const newRecipes = parsedRecipes.filter((_, i) => i !== index);
    setParsedRecipes(newRecipes);

    if (newRecipes.length === 0) {
      handleClearParsed();
    } else if (currentReviewIndex >= newRecipes.length) {
      setCurrentReviewIndex(newRecipes.length - 1);
    } else if (index < currentReviewIndex) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }

    toast.success(`Removed "${recipeTitle}" from queue`);
  };

  const handleCreateAllRecipes = async () => {
    if (parsedRecipes.length === 0) return;

    setIsCreatingAll(true);
    setCreateAllProgress(0);

    let successCount = 0;
    let failCount = 0;
    const total = parsedRecipes.length;

    for (let i = 0; i < parsedRecipes.length; i++) {
      const recipe = parsedRecipes[i];
      try {
        const result = await createRecipe(recipe);
        if (result.error) {
          failCount++;
          console.error(`Failed to create "${recipe.title}":`, result.error);
        } else {
          successCount++;
        }
      } catch (error) {
        failCount++;
        console.error(`Failed to create "${recipe.title}":`, error);
      }
      setCreateAllProgress(((i + 1) / total) * 100);
    }

    setIsCreatingAll(false);
    setCreateAllProgress(0);

    if (failCount === 0) {
      toast.success(`Successfully created ${successCount} recipe${successCount !== 1 ? "s" : ""}!`);
      handleClearParsed();
    } else if (successCount > 0) {
      toast.warning(`Created ${successCount} recipe${successCount !== 1 ? "s" : ""}, ${failCount} failed`);
      handleClearParsed();
    } else {
      toast.error("Failed to create recipes. Please try again.");
    }
  };

  return {
    mode,
    setMode,
    pasteText,
    setPasteText,
    urlInputs,
    addUrlInput,
    removeUrlInput,
    updateUrlInput,
    validUrls,
    isParsing,
    parsedRecipe,
    parsedRecipes,
    currentReviewIndex,
    setCurrentReviewIndex,
    nutritionEnabled,
    importStatuses,
    importStats,
    isLoadingStats,
    isCreatingAll,
    createAllProgress,
    handlePasteSubmit,
    handleUrlSubmit,
    handleClearParsed,
    handleNextRecipe,
    handlePrevRecipe,
    handleRecipeSaved,
    handleRemoveFromQueue,
    handleCreateAllRecipes,
    MAX_URLS,
  };
}
