"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, ShieldAlert, Ban, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AggregatedDietaryRestrictions, SpiceTolerance } from "@/types/household";

// ============================================================================
// Types
// ============================================================================

type WarningLevel = "critical" | "warning" | "info";

interface DietaryWarning {
  type: "allergen" | "restriction" | "dislike" | "spice";
  item: string;
  level: WarningLevel;
}

interface DietaryWarningBadgeProps {
  warnings: DietaryWarning[];
  compact?: boolean;
  className?: string;
}

interface RecipeDietaryCheckProps {
  recipeIngredients: string[];
  recipeSpiceLevel?: SpiceTolerance | null;
  householdDietary: AggregatedDietaryRestrictions;
  householdMinSpiceTolerance?: SpiceTolerance | null;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// Warning Level Configuration
// ============================================================================

const WARNING_CONFIG: Record<WarningLevel, { icon: typeof AlertTriangle; colors: string }> = {
  critical: {
    icon: ShieldAlert,
    colors: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
  },
  warning: {
    icon: AlertTriangle,
    colors: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700",
  },
  info: {
    icon: Ban,
    colors: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if any ingredient matches a dietary item (case-insensitive, partial match)
 */
function ingredientMatches(ingredient: string, dietaryItem: string): boolean {
  const normalizedIngredient = ingredient.toLowerCase();
  const normalizedDietary = dietaryItem.toLowerCase();
  return normalizedIngredient.includes(normalizedDietary) || normalizedDietary.includes(normalizedIngredient);
}

/**
 * Get the most severe warning level from a list of warnings
 */
function getHighestWarningLevel(warnings: DietaryWarning[]): WarningLevel | null {
  if (warnings.length === 0) return null;
  if (warnings.some(w => w.level === "critical")) return "critical";
  if (warnings.some(w => w.level === "warning")) return "warning";
  return "info";
}

/**
 * Compare spice levels to check if recipe is too spicy
 */
const SPICE_ORDER: SpiceTolerance[] = ["none", "mild", "medium", "hot", "extra-hot"];

function isSpiceTooHigh(recipeSpice: SpiceTolerance, tolerance: SpiceTolerance): boolean {
  const recipeIndex = SPICE_ORDER.indexOf(recipeSpice);
  const toleranceIndex = SPICE_ORDER.indexOf(tolerance);
  return recipeIndex > toleranceIndex;
}

// ============================================================================
// DietaryWarningBadge Component
// ============================================================================

/**
 * Display dietary warnings as a badge with tooltip details
 */
export function DietaryWarningBadge({
  warnings,
  compact = false,
  className,
}: DietaryWarningBadgeProps) {
  if (warnings.length === 0) return null;

  const highestLevel = getHighestWarningLevel(warnings);
  if (!highestLevel) return null;

  const config = WARNING_CONFIG[highestLevel];
  const Icon = config.icon;

  // Group warnings by type for tooltip
  const allergenWarnings = warnings.filter(w => w.type === "allergen");
  const restrictionWarnings = warnings.filter(w => w.type === "restriction");
  const dislikeWarnings = warnings.filter(w => w.type === "dislike");
  const spiceWarnings = warnings.filter(w => w.type === "spice");

  const content = compact ? (
    <Badge className={cn(config.colors, "gap-1", className)}>
      <Icon className="h-3 w-3" />
      {warnings.length}
    </Badge>
  ) : (
    <Badge className={cn(config.colors, "gap-1.5", className)}>
      <Icon className="h-3.5 w-3.5" />
      {warnings.length} dietary {warnings.length === 1 ? "concern" : "concerns"}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex flex-col gap-2 text-sm">
            {allergenWarnings.length > 0 && (
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Allergens:
                </p>
                <p>{allergenWarnings.map(w => w.item).join(", ")}</p>
              </div>
            )}
            {restrictionWarnings.length > 0 && (
              <div>
                <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Dietary Restrictions:
                </p>
                <p>{restrictionWarnings.map(w => w.item).join(", ")}</p>
              </div>
            )}
            {dislikeWarnings.length > 0 && (
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Ban className="h-3.5 w-3.5" />
                  Dislikes:
                </p>
                <p>{dislikeWarnings.map(w => w.item).join(", ")}</p>
              </div>
            )}
            {spiceWarnings.length > 0 && (
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  Spice Level:
                </p>
                <p>Too spicy for some household members</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// RecipeDietaryCheck Component
// ============================================================================

/**
 * Check a recipe's ingredients against household dietary restrictions
 * and display warnings if conflicts are found
 */
export function RecipeDietaryCheck({
  recipeIngredients,
  recipeSpiceLevel,
  householdDietary,
  householdMinSpiceTolerance,
  compact = false,
  className,
}: RecipeDietaryCheckProps) {
  const warnings: DietaryWarning[] = [];

  // Check allergens (critical level)
  for (const allergen of householdDietary.all_allergens) {
    for (const ingredient of recipeIngredients) {
      if (ingredientMatches(ingredient, allergen)) {
        warnings.push({
          type: "allergen",
          item: allergen,
          level: "critical",
        });
        break;
      }
    }
  }

  // Check dietary restrictions (warning level)
  // Note: This is simplified - real implementation would need more sophisticated matching
  // e.g., checking if recipe has meat for vegetarian restriction
  for (const restriction of householdDietary.all_restrictions) {
    // Example: if restriction is "Vegetarian" and ingredients contain "beef", "chicken", etc.
    const meatKeywords = ["beef", "chicken", "pork", "lamb", "turkey", "bacon", "ham", "sausage"];
    const dairyKeywords = ["milk", "cheese", "butter", "cream", "yogurt"];
    const glutenKeywords = ["flour", "bread", "pasta", "wheat"];

    let hasConflict = false;

    if (restriction.toLowerCase().includes("vegetarian") || restriction.toLowerCase().includes("vegan")) {
      hasConflict = recipeIngredients.some(ing =>
        meatKeywords.some(meat => ing.toLowerCase().includes(meat))
      );
    }
    if (restriction.toLowerCase().includes("dairy-free") || restriction.toLowerCase().includes("vegan")) {
      hasConflict = hasConflict || recipeIngredients.some(ing =>
        dairyKeywords.some(dairy => ing.toLowerCase().includes(dairy))
      );
    }
    if (restriction.toLowerCase().includes("gluten-free")) {
      hasConflict = hasConflict || recipeIngredients.some(ing =>
        glutenKeywords.some(gluten => ing.toLowerCase().includes(gluten))
      );
    }

    if (hasConflict) {
      warnings.push({
        type: "restriction",
        item: restriction,
        level: "warning",
      });
    }
  }

  // Check dislikes (info level)
  for (const dislike of householdDietary.all_dislikes) {
    for (const ingredient of recipeIngredients) {
      if (ingredientMatches(ingredient, dislike)) {
        warnings.push({
          type: "dislike",
          item: dislike,
          level: "info",
        });
        break;
      }
    }
  }

  // Check spice level
  if (recipeSpiceLevel && householdMinSpiceTolerance) {
    if (isSpiceTooHigh(recipeSpiceLevel, householdMinSpiceTolerance)) {
      warnings.push({
        type: "spice",
        item: recipeSpiceLevel,
        level: "warning",
      });
    }
  }

  return (
    <DietaryWarningBadge
      warnings={warnings}
      compact={compact}
      className={className}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { DietaryWarning, WarningLevel, DietaryWarningBadgeProps, RecipeDietaryCheckProps };
