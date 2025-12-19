import { Sunrise, Salad, UtensilsCrossed, Cookie, LayoutList, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealType } from "@/types/meal-plan";

export type MealTypeKey = MealType | "other";

const MEAL_TYPE_ICONS: Record<MealTypeKey, LucideIcon> = {
  breakfast: Sunrise,
  lunch: Salad,
  dinner: UtensilsCrossed,
  snack: Cookie,
  other: LayoutList,
};

interface MealTypeIconProps {
  type: MealTypeKey;
  className?: string;
}

export function MealTypeIcon({ type, className }: MealTypeIconProps) {
  const Icon = MEAL_TYPE_ICONS[type];
  return <Icon className={cn("size-4", className)} />;
}

export { MEAL_TYPE_ICONS };
