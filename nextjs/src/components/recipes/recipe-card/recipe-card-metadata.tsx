import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeType } from "@/types/recipe";

interface RecipeCardMetadataProps {
  recipeType: RecipeType;
  totalTime: string;
  servings: string | null;
}

// Get icon based on recipe type (smaller for compact badge)
function getRecipeIcon(recipeType: RecipeType) {
  const { Cookie, Coffee, IceCream, Croissant, Salad, UtensilsCrossed } = require("lucide-react");

  switch (recipeType) {
    case "Baking":
      return <Cookie className="size-3" />;
    case "Breakfast":
      return <Coffee className="size-3" />;
    case "Dessert":
      return <IceCream className="size-3" />;
    case "Snack":
      return <Croissant className="size-3" />;
    case "Side Dish":
      return <Salad className="size-3" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="size-3" />;
  }
}

// Get color classes for recipe type badge
function getRecipeTypeBadgeClasses(recipeType: RecipeType): string {
  switch (recipeType) {
    case "Dinner":
      // Coral - the main event
      return "bg-primary text-primary-foreground";
    case "Breakfast":
      // Warm amber
      return "bg-amber-500 text-white dark:bg-amber-600";
    case "Baking":
      // Warm brown
      return "bg-amber-700 text-white dark:bg-amber-800";
    case "Dessert":
      // Sweet pink
      return "bg-pink-500 text-white dark:bg-pink-600";
    case "Snack":
      // Sage green (brand accent)
      return "bg-accent text-accent-foreground";
    case "Side Dish":
      // Muted sage
      return "bg-emerald-600 text-white dark:bg-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function RecipeCardMetadata({
  recipeType,
  totalTime,
  servings,
}: RecipeCardMetadataProps) {
  return (
    <div className="px-4 pb-3 flex flex-col gap-2 shrink-0">
      {/* Recipe Type Badge */}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium w-fit",
          getRecipeTypeBadgeClasses(recipeType)
        )}
      >
        {getRecipeIcon(recipeType)}
        {recipeType}
      </span>

      {/* Simple Metadata: Time + Servings */}
      <div className="flex items-center gap-3 text-[12px] text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {totalTime}
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          {servings} servings
        </span>
      </div>
    </div>
  );
}
