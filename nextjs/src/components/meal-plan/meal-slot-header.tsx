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
        "flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm md:text-base font-medium",
        config.bgColor,
        className
      )}
    >
      <span className="text-lg md:text-xl" aria-hidden="true">
        {config.emoji}
      </span>
      <span className="flex-1 font-semibold">{config.label}</span>
      <Badge
        variant="secondary"
        className="text-[11px] px-2 py-0.5 h-5 font-mono tabular-nums"
      >
        {mealCount}
      </Badge>
    </div>
  );
}
