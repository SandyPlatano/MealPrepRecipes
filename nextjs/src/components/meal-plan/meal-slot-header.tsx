"use client";

import { Badge } from "@/components/ui/badge";
import { type MealType, getMealTypeConfig } from "@/types/meal-plan";
import { cn } from "@/lib/utils";

interface MealSlotHeaderProps {
  mealType: MealType | null;
  mealCount: number;
  className?: string;
}

/**
 * Visual header for a meal type section in the planner.
 * Shows emoji, label, and meal count badge.
 * Only render if mealCount > 0.
 */
export function MealSlotHeader({
  mealType,
  mealCount,
  className,
}: MealSlotHeaderProps) {
  if (mealCount === 0) return null;

  const config = getMealTypeConfig(mealType);

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm font-medium",
        config.bgColor,
        className
      )}
    >
      <span className="text-base" aria-hidden="true">
        {config.emoji}
      </span>
      <span className="flex-1">{config.label}</span>
      <Badge
        variant="secondary"
        className="text-[10px] px-1.5 py-0 h-4 font-mono"
      >
        {mealCount}
      </Badge>
    </div>
  );
}
