"use client";

/**
 * Nutrition Badge Component
 * Compact display of key nutritional info for recipe cards
 * Shows calories and protein with expandable tooltip
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NutritionData } from "@/types/nutrition";
import { formatNutritionValue } from "@/lib/nutrition/calculations";
import { cn } from "@/lib/utils";

interface NutritionBadgeProps {
  nutrition?: NutritionData | null;
  variant?: "compact" | "detailed";
  className?: string;
}

export function NutritionBadge({
  nutrition,
  variant = "compact",
  className,
}: NutritionBadgeProps) {
  // No nutrition data available
  if (!nutrition) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Nutrition Unknown
      </Badge>
    );
  }

  // Compact variant - just calories and protein
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex gap-1.5", className)}>
              {nutrition.calories !== null && nutrition.calories !== undefined && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {nutrition.calories} cal
                </Badge>
              )}
              {nutrition.protein_g !== null && nutrition.protein_g !== undefined && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {nutrition.protein_g}g protein
                </Badge>
              )}
              {!nutrition.calories && !nutrition.protein_g && (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  Incomplete data
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <NutritionTooltipContent nutrition={nutrition} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - show all available macros
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {nutrition.calories !== null && nutrition.calories !== undefined && (
        <Badge variant="secondary" className="font-mono text-xs">
          {nutrition.calories} cal
        </Badge>
      )}
      {nutrition.protein_g !== null && nutrition.protein_g !== undefined && (
        <Badge variant="secondary" className="font-mono text-xs">
          {nutrition.protein_g}g P
        </Badge>
      )}
      {nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && (
        <Badge variant="secondary" className="font-mono text-xs">
          {nutrition.carbs_g}g C
        </Badge>
      )}
      {nutrition.fat_g !== null && nutrition.fat_g !== undefined && (
        <Badge variant="secondary" className="font-mono text-xs">
          {nutrition.fat_g}g F
        </Badge>
      )}
    </div>
  );
}

/**
 * Tooltip content showing full nutrition details
 */
function NutritionTooltipContent({ nutrition }: { nutrition: NutritionData }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-semibold">Nutrition (per serving)</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-muted-foreground">Calories:</span>
        <span className="font-mono text-right">
          {formatNutritionValue(nutrition.calories, " kcal", 0)}
        </span>

        <span className="text-muted-foreground">Protein:</span>
        <span className="font-mono text-right">
          {formatNutritionValue(nutrition.protein_g, "g", 1)}
        </span>

        <span className="text-muted-foreground">Carbs:</span>
        <span className="font-mono text-right">
          {formatNutritionValue(nutrition.carbs_g, "g", 1)}
        </span>

        <span className="text-muted-foreground">Fat:</span>
        <span className="font-mono text-right">
          {formatNutritionValue(nutrition.fat_g, "g", 1)}
        </span>

        {nutrition.fiber_g !== null && nutrition.fiber_g !== undefined && (
          <>
            <span className="text-muted-foreground">Fiber:</span>
            <span className="font-mono text-right">
              {formatNutritionValue(nutrition.fiber_g, "g", 1)}
            </span>
          </>
        )}

        {nutrition.sugar_g !== null && nutrition.sugar_g !== undefined && (
          <>
            <span className="text-muted-foreground">Sugar:</span>
            <span className="font-mono text-right">
              {formatNutritionValue(nutrition.sugar_g, "g", 1)}
            </span>
          </>
        )}

        {nutrition.sodium_mg !== null && nutrition.sodium_mg !== undefined && (
          <>
            <span className="text-muted-foreground">Sodium:</span>
            <span className="font-mono text-right">
              {formatNutritionValue(nutrition.sodium_mg, "mg", 0)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
