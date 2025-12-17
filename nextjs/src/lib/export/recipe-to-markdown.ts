import type { RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { RecipeExportPreferences } from "@/types/settings";
import {
  generateRecipeMarkdown,
  downloadRecipeAsMarkdown,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
} from "./recipe-markdown";

/**
 * Get user's export preferences from localStorage (with fallback to defaults)
 */
function getStoredExportPreferences(): RecipeExportPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_RECIPE_EXPORT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem("userSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings.recipe_export_preferences) {
        return {
          ...DEFAULT_RECIPE_EXPORT_PREFERENCES,
          ...settings.recipe_export_preferences,
        };
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  return DEFAULT_RECIPE_EXPORT_PREFERENCES;
}

/**
 * Convert a recipe to formatted markdown string
 * Uses user's export preferences from localStorage for section selection
 */
export function recipeToMarkdown(
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null }
): string {
  const preferences = getStoredExportPreferences();

  return generateRecipeMarkdown({
    recipe,
    nutrition: recipe.nutrition ?? undefined,
    preferences,
  });
}

/**
 * Copy markdown to clipboard
 * Uses user's export preferences from localStorage
 */
export async function copyMarkdownToClipboard(
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null }
): Promise<boolean> {
  const markdown = recipeToMarkdown(recipe);

  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (error) {
    console.error("Failed to copy markdown to clipboard:", error);
    return false;
  }
}

/**
 * Download recipe as markdown file
 * Uses user's export preferences from localStorage
 */
export function downloadMarkdownFile(
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null }
): void {
  const preferences = getStoredExportPreferences();

  downloadRecipeAsMarkdown({
    recipe,
    nutrition: recipe.nutrition ?? undefined,
    preferences,
  });
}

/**
 * Sanitize filename by removing special characters
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
