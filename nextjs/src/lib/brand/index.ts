/**
 * Brand Identity Library
 *
 * Central exports for all brand-related constants and utilities.
 * Import from "@/lib/brand" for easy access.
 */

export * from "./colors";

// Re-export commonly used items for convenience
export {
  BRAND_COLORS,
  GRAY_PALETTE,
  COOK_COLORS,
  SEMANTIC_COLORS,
  BACKGROUNDS,
  CHART_COLORS,
  getContrastRatio,
  meetsWcagContrast,
  getWcagLevel,
} from "./colors";
