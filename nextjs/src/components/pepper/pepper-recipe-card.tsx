"use client";

import { motion } from "framer-motion";
import { Clock, ChefHat, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PepperRecipeSuggestion } from "@/types/pepper";

interface PepperRecipeCardProps {
  recipe: PepperRecipeSuggestion;
  onSelect?: (recipeId: string) => void;
}

export function PepperRecipeCard({ recipe, onSelect }: PepperRecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-lg p-3",
        "border-2 border-black dark:border-white",
        "bg-card hover:bg-accent/50",
        "shadow-retro-sm hover:shadow-retro-sm-hover",
        "hover:translate-x-[1px] hover:translate-y-[1px]",
        "transition-all duration-150",
        "cursor-pointer"
      )}
      onClick={() => onSelect?.(recipe.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-semibold text-sm truncate">{recipe.title}</h4>

          {/* Match reason */}
          <p className="text-xs text-muted-foreground mt-0.5">
            {recipe.match_reason}
          </p>

          {/* Time info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {recipe.prep_time + recipe.cook_time} min
            </span>
            {recipe.pantry_match_percentage >= 80 && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ChefHat className="size-3" />
                {recipe.pantry_match_percentage}% ready
              </span>
            )}
          </div>

          {/* Missing ingredients */}
          {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Need: {recipe.missing_ingredients.slice(0, 3).join(", ")}
              {recipe.missing_ingredients.length > 3 && " ..."}
            </p>
          )}
        </div>

        {/* Link to recipe */}
        <Link
          href={`/app/recipes/${recipe.id}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "shrink-0 p-1.5 rounded",
            "hover:bg-accent",
            "text-muted-foreground hover:text-foreground",
            "transition-colors"
          )}
          aria-label={`View ${recipe.title}`}
        >
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}
