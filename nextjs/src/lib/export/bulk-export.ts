/**
 * Bulk Export Utility
 *
 * Creates ZIP archives containing multiple recipe exports.
 * Supports JSON and Markdown formats.
 */

import JSZip from "jszip";
import type { Recipe, RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type {
  BulkExportFormat,
  BulkExportManifest,
  BulkExportResult,
} from "@/types/export";
import { recipeToJson, generateJsonFilename } from "./recipe-to-json";
import {
  generateRecipeMarkdown,
  generateRecipeFilename,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
} from "./recipe-markdown";
import type { RecipeExportPreferences } from "@/types/settings";

export interface BulkExportOptions {
  recipes: Array<Recipe | RecipeWithNutrition>;
  nutritionMap?: Map<string, RecipeNutrition>;
  format: BulkExportFormat;
  preferences?: RecipeExportPreferences;
}

/**
 * Generate a safe filename from recipe title
 * Ensures uniqueness by appending index if needed
 */
function generateSafeFilename(
  title: string,
  extension: string,
  usedFilenames: Set<string>
): string {
  let base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  if (base.length === 0) {
    base = "recipe";
  }

  let filename = `${base}${extension}`;
  let counter = 1;

  while (usedFilenames.has(filename)) {
    filename = `${base}-${counter}${extension}`;
    counter++;
  }

  usedFilenames.add(filename);
  return filename;
}

/**
 * Format current date for filename
 */
function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Create a ZIP archive with exported recipes
 */
export async function createExportZip(
  options: BulkExportOptions
): Promise<BulkExportResult> {
  const { recipes, nutritionMap, format, preferences } = options;

  if (recipes.length === 0) {
    return {
      success: false,
      error: "No recipes to export",
    };
  }

  try {
    const zip = new JSZip();
    const usedFilenames = new Set<string>();
    const manifestRecipes: BulkExportManifest["recipes"] = [];

    const exportPrefs = preferences ?? DEFAULT_RECIPE_EXPORT_PREFERENCES;
    const extension = format === "json" ? ".json" : ".md";

    // Add each recipe to the ZIP
    for (const recipe of recipes) {
      const nutrition = nutritionMap?.get(recipe.id) ?? null;
      const filename = generateSafeFilename(
        recipe.title,
        extension,
        usedFilenames
      );

      let content: string;

      if (format === "json") {
        const exportData = recipeToJson(recipe, nutrition);
        content = JSON.stringify(exportData, null, 2);
      } else {
        content = generateRecipeMarkdown({
          recipe,
          nutrition,
          preferences: exportPrefs,
        });
      }

      zip.file(filename, content);

      manifestRecipes.push({
        id: recipe.id,
        title: recipe.title,
        filename,
      });
    }

    // Create and add manifest
    const manifest: BulkExportManifest = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      source: "mealpreprecipes",
      format,
      recipe_count: recipes.length,
      recipes: manifestRecipes,
    };

    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const dateStr = formatDateForFilename();
    const filename = `recipes-export-${dateStr}.zip`;

    return {
      success: true,
      zipBlob,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create export: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Trigger download of a ZIP blob
 */
export function downloadZipBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create and download a bulk export ZIP
 */
export async function downloadBulkExport(
  options: BulkExportOptions
): Promise<BulkExportResult> {
  const result = await createExportZip(options);

  if (result.success && result.zipBlob && result.filename) {
    downloadZipBlob(result.zipBlob, result.filename);
  }

  return result;
}

/**
 * Estimate the size of a bulk export (in bytes)
 * Useful for showing progress or warnings for large exports
 */
export function estimateExportSize(
  recipes: Recipe[],
  format: BulkExportFormat
): number {
  // Rough estimates based on typical recipe sizes
  const avgJsonSize = 2000; // ~2KB per recipe JSON
  const avgMarkdownSize = 1500; // ~1.5KB per recipe markdown

  const perRecipeSize = format === "json" ? avgJsonSize : avgMarkdownSize;
  const manifestSize = 500 + recipes.length * 100; // Base + per recipe entry

  // Estimate compression ratio (ZIP typically achieves 50-70% reduction for text)
  const compressionRatio = 0.4;

  return Math.round(
    (recipes.length * perRecipeSize + manifestSize) * compressionRatio
  );
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
