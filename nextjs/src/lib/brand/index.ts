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
  CORAL_PALETTE,
  SAGE_PALETTE,
  SEMANTIC_COLORS,
  BOLD_COLORS,
  CHART_COLORS,
  getContrastRatio,
  meetsWcagContrast,
  getWcagLevel,
} from "./colors";
