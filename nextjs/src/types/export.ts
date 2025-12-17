/**
 * Export & Import Types
 *
 * Type definitions for the recipe export/import system.
 */

import type { Recipe, RecipeWithNutrition } from "./recipe";
import type { RecipeNutrition } from "./nutrition";

// =============================================================================
// Export Format Types
// =============================================================================

export type ExportFormat = "png" | "jpeg" | "markdown" | "json" | "pdf";

export type BulkExportFormat = "json" | "markdown";

export interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: string;
  description: string;
  extension: string;
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    format: "png",
    label: "PNG",
    icon: "image",
    description: "High-quality image",
    extension: ".png",
  },
  {
    format: "jpeg",
    label: "JPEG",
    icon: "image",
    description: "Compressed image",
    extension: ".jpeg",
  },
  {
    format: "markdown",
    label: "Markdown",
    icon: "file-text",
    description: "Text with formatting",
    extension: ".md",
  },
  {
    format: "json",
    label: "JSON",
    icon: "braces",
    description: "Data backup format",
    extension: ".json",
  },
  {
    format: "pdf",
    label: "PDF",
    icon: "file",
    description: "Print-ready document",
    extension: ".pdf",
  },
];

// =============================================================================
// JSON Export Types
// =============================================================================

/**
 * Recipe data exported in JSON format
 * Includes all recipe fields plus optional nutrition
 */
export interface RecipeExportData {
  /** Export metadata */
  _export: {
    version: "1.0";
    exported_at: string;
    source: "mealpreprecipes";
  };
  /** Recipe data */
  recipe: Recipe;
  /** Nutrition data if available */
  nutrition: RecipeNutrition | null;
}

/**
 * Bulk export manifest included in ZIP
 */
export interface BulkExportManifest {
  version: "1.0";
  exported_at: string;
  source: "mealpreprecipes";
  format: BulkExportFormat;
  recipe_count: number;
  recipes: Array<{
    id: string;
    title: string;
    filename: string;
  }>;
}

// =============================================================================
// Bulk Export Types
// =============================================================================

export interface BulkExportOptions {
  recipeIds: string[];
  format: BulkExportFormat;
}

export interface BulkExportResult {
  success: boolean;
  zipBlob?: Blob;
  filename?: string;
  error?: string;
}

// =============================================================================
// Import Types
// =============================================================================

export type ImportFormat = "json" | "paprika";

export type DuplicateHandling = "skip" | "replace" | "keep_both";

export interface ImportOptions {
  file: File;
  duplicateHandling: DuplicateHandling;
}

/**
 * Result of validating a single recipe for import
 */
export interface ImportValidationResult {
  index: number;
  title: string;
  isValid: boolean;
  isDuplicate: boolean;
  existingRecipeId?: string;
  errors: string[];
  warnings: string[];
  /** Parsed recipe data ready for import */
  parsedRecipe: Partial<Recipe> | null;
}

/**
 * Result of parsing an import file
 */
export interface ImportParseResult {
  success: boolean;
  format: ImportFormat;
  recipes: ImportValidationResult[];
  totalCount: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  error?: string;
}

/**
 * Result of executing the import
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  replaced: number;
  failed: number;
  errors: Array<{
    title: string;
    error: string;
  }>;
}

// =============================================================================
// Paprika Format Types
// =============================================================================

/**
 * Paprika recipe format (from .paprikarecipes files)
 * Based on Paprika 3 export format
 */
export interface PaprikaRecipe {
  uid?: string;
  name: string;
  ingredients?: string;
  directions?: string;
  description?: string;
  notes?: string;
  nutritional_info?: string;
  servings?: string;
  source?: string;
  source_url?: string;
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  difficulty?: string;
  rating?: number;
  photo?: string; // Base64 encoded image
  photo_hash?: string;
  photo_large?: string;
  scale?: string;
  hash?: string;
  categories?: string[];
  image_url?: string;
  on_favorites?: boolean;
  created?: string;
  in_trash?: boolean;
}

/**
 * Paprika archive structure (gzipped)
 */
export interface PaprikaArchive {
  recipes: PaprikaRecipe[];
}
