"use client";

import { memo } from "react";
import Image from "next/image";
import { Clock, UtensilsCrossed, Cookie, Croissant, Coffee, IceCream, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeType } from "@/types/recipe";

// Get icon based on recipe type
function getRecipeIcon(recipeType: string) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="h-5 w-5" />;
    case "Breakfast":
      return <Coffee className="h-5 w-5" />;
    case "Dessert":
      return <IceCream className="h-5 w-5" />;
    case "Snack":
      return <Croissant className="h-5 w-5" />;
    case "Side Dish":
      return <Salad className="h-5 w-5" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="h-5 w-5" />;
  }
}

// Get gradient color based on recipe type
function getRecipeGradient(recipeType: string): string {
  switch (recipeType) {
    case "Baking":
      return "from-amber-400 to-orange-500";
    case "Breakfast":
      return "from-yellow-400 to-amber-500";
    case "Dessert":
      return "from-pink-400 to-rose-500";
    case "Snack":
      return "from-lime-400 to-green-500";
    case "Side Dish":
      return "from-emerald-400 to-teal-500";
    case "Dinner":
    default:
      return "from-blue-400 to-purple-500";
  }
}

export interface CompactRecipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  category?: string | null;
}

interface CompactRecipeCardProps {
  recipe: CompactRecipe;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  showPrepTime?: boolean;
  className?: string;
}

export const CompactRecipeCard = memo(function CompactRecipeCard({
  recipe,
  selected = false,
  onClick,
  size = "md",
  showPrepTime = true,
  className,
}: CompactRecipeCardProps) {
  const sizeClasses = {
    sm: "w-20 h-24",
    md: "w-28 h-32",
  };

  const imageSizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border-2 transition-all duration-200",
        "bg-card hover:bg-accent/50 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
          : "border-transparent hover:border-primary/30",
        sizeClasses[size],
        "p-2",
        className
      )}
    >
      {/* Image or Gradient Fallback */}
      <div
        className={cn(
          "relative rounded-lg overflow-hidden shrink-0",
          imageSizeClasses[size],
          "transition-transform duration-200 group-hover:scale-105"
        )}
      >
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center text-white/90",
              getRecipeGradient(recipe.recipe_type)
            )}
          >
            {getRecipeIcon(recipe.recipe_type)}
          </div>
        )}
        
        {/* Prep time badge */}
        {showPrepTime && recipe.prep_time && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 flex items-center justify-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {recipe.prep_time.replace(" minutes", "m").replace(" mins", "m").replace(" min", "m")}
          </div>
        )}
      </div>

      {/* Title */}
      <p
        className={cn(
          "mt-1.5 text-center font-medium leading-tight line-clamp-2",
          size === "sm" ? "text-[10px]" : "text-xs"
        )}
        title={recipe.title}
      >
        {recipe.title}
      </p>

      {/* Selection indicator animation */}
      {selected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none">
          <div className="absolute inset-0 rounded-xl animate-pulse bg-primary/10" />
        </div>
      )}
    </button>
  );
});

