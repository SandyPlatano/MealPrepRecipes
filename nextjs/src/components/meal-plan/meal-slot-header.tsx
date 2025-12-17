"use client";

import { Badge } from "@/components/ui/badge";
import { type MealType, getMealTypeConfig } from "@/types/meal-plan";
import { cn } from "@/lib/utils";

interface MealSlotHeaderProps {
  mealType: MealType | null;
  mealCount: number;
  className?: string;
  /** Custom emoji override from user settings */
  customEmoji?: string;
  /** Custom color override from user settings (hex color) */
  customColor?: string;
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
  customEmoji,
  customColor,
}: MealSlotHeaderProps) {
  if (mealCount === 0) return null;

  const config = getMealTypeConfig(mealType);
  // Use custom emoji if provided and not empty, otherwise fall back to default
  const displayEmoji = customEmoji !== undefined && customEmoji !== "" ? customEmoji : config.emoji;
  // Use custom color if provided, otherwise fall back to config accent color
  const accentColor = customColor || config.accentColor;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm md:text-base font-medium",
        // Only use Tailwind bg class if no custom color is set
        !customColor && config.bgColor,
        className
      )}
      style={customColor ? {
        backgroundColor: `${customColor}15`, // 15 is ~9% opacity in hex
        borderLeft: `4px solid ${accentColor}`,
      } : undefined}
    >
      {displayEmoji && (
        <span className="text-lg md:text-xl" aria-hidden="true">
          {displayEmoji}
        </span>
      )}
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
