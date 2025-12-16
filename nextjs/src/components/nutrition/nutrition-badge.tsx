"use client";

/**
 * Nutrition Badge Component
 * Compact display of key nutritional info for recipe cards
 * Shows calories and protein with expandable tooltip
 * Also displays nutrition category badges (High Protein, Low Carb, etc.)
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
import {
  calculateSystemBadges,
  getBadgeColorClasses,
  type NutritionBadge as BadgeType,
  type CustomBadge,
  calculateAllBadges,
} from "@/lib/nutrition/badge-calculator";
import { cn } from "@/lib/utils";

interface NutritionBadgeProps {
  nutrition?: NutritionData | null;
  variant?: "compact" | "detailed" | "badges-only";
  className?: string;
  showCategoryBadges?: boolean;
  customBadges?: CustomBadge[];
  maxBadges?: number;
}

export function NutritionBadge({
  nutrition,
  variant = "compact",
  className,
  showCategoryBadges = false,
  customBadges = [],
  maxBadges = 3,
}: NutritionBadgeProps) {
  // No nutrition data available
  if (!nutrition) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Nutrition Unknown
      </Badge>
    );
  }

  // Calculate category badges if needed
  const categoryBadges = showCategoryBadges || variant === "badges-only"
    ? calculateAllBadges(nutrition, customBadges).slice(0, maxBadges)
    : [];

  // Badges-only variant - just show category badges
  if (variant === "badges-only") {
    if (categoryBadges.length === 0) return null;

    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {categoryBadges.map((badge) => (
          <CategoryBadge key={badge.key} badge={badge} />
        ))}
      </div>
    );
  }

  // Compact variant - just calories and protein (with optional category badges)
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex flex-col gap-1.5", className)}>
              {/* Category badges row */}
              {categoryBadges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {categoryBadges.map((badge) => (
                    <CategoryBadge key={badge.key} badge={badge} size="sm" />
                  ))}
                </div>
              )}
              {/* Nutrition values row */}
              <div className="flex gap-1.5">
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
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <NutritionTooltipContent nutrition={nutrition} badges={categoryBadges} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - show all available macros (with optional category badges)
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Category badges row */}
      {categoryBadges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {categoryBadges.map((badge) => (
            <CategoryBadge key={badge.key} badge={badge} />
          ))}
        </div>
      )}
      {/* Macro values row */}
      <div className="flex flex-wrap gap-1.5">
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
    </div>
  );
}

/**
 * Individual category badge component
 */
interface CategoryBadgeProps {
  badge: BadgeType;
  size?: "sm" | "md";
}

function CategoryBadge({ badge, size = "md" }: CategoryBadgeProps) {
  const colors = getBadgeColorClasses(badge.color);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center rounded-full border font-medium",
              colors.bg,
              colors.text,
              colors.border,
              size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
            )}
          >
            {badge.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Tooltip content showing full nutrition details
 */
function NutritionTooltipContent({
  nutrition,
  badges = [],
}: {
  nutrition: NutritionData;
  badges?: BadgeType[];
}) {
  return (
    <div className="space-y-2 text-sm">
      {/* Category badges in tooltip */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 pb-1 border-b border-border">
          {badges.map((badge) => {
            const colors = getBadgeColorClasses(badge.color);
            return (
              <span
                key={badge.key}
                className={cn(
                  "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                  colors.bg,
                  colors.text,
                  colors.border
                )}
              >
                {badge.label}
              </span>
            );
          })}
        </div>
      )}

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

/**
 * Standalone component for displaying only category badges
 * Use this when you just want the badge chips without nutrition values
 */
export function NutritionCategoryBadges({
  nutrition,
  customBadges = [],
  maxBadges = 3,
  className,
}: {
  nutrition?: NutritionData | null;
  customBadges?: CustomBadge[];
  maxBadges?: number;
  className?: string;
}) {
  if (!nutrition) return null;

  const badges = calculateAllBadges(nutrition, customBadges).slice(0, maxBadges);

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((badge) => (
        <CategoryBadge key={badge.key} badge={badge} />
      ))}
    </div>
  );
}
