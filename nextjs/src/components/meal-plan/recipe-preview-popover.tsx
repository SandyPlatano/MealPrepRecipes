"use client";

import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, Flame, Drumstick } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeNutrition } from "@/types/nutrition";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
}

interface RecipePreviewPopoverProps {
  recipe: Recipe;
  nutrition?: RecipeNutrition | null;
  children: React.ReactNode;
  disabled?: boolean;
}

export function RecipePreviewPopover({
  recipe,
  nutrition,
  children,
  disabled = false,
}: RecipePreviewPopoverProps) {
  if (disabled) {
    return <>{children}</>;
  }

  // Calculate total time
  const getTotalTime = () => {
    const prep = recipe.prep_time ? parseInt(recipe.prep_time) : 0;
    const cook = recipe.cook_time ? parseInt(recipe.cook_time) : 0;
    const total = prep + cook;
    if (total <= 0) return null;
    if (total >= 60) {
      const hours = Math.floor(total / 60);
      const mins = total % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${total}m`;
  };

  const totalTime = getTotalTime();

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          "w-72 p-0 overflow-hidden shadow-xl border-0",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}
      >
        {/* Recipe Image with AspectRatio */}
        {recipe.image_url ? (
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="288px"
            />
          </AspectRatio>
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-[#D9F99D]/20 to-[#FDE047]/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">🍽️</span>
          </div>
        )}

        {/* Recipe Info */}
        <div className="p-3 space-y-2 bg-white dark:bg-slate-900">
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{recipe.title}</h4>
            <p className="text-xs text-muted-foreground">{recipe.recipe_type}</p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {totalTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalTime}
              </span>
            )}
            {nutrition?.calories && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {Math.round(nutrition.calories)} cal
              </span>
            )}
            {nutrition?.protein_g && (
              <span className="flex items-center gap-1">
                <Drumstick className="h-3 w-3 text-amber-600" />
                {Math.round(nutrition.protein_g)}g
              </span>
            )}
          </div>

          {/* Macros badges */}
          {nutrition && (nutrition.carbs_g || nutrition.fat_g) && (
            <div className="flex gap-1.5 flex-wrap">
              {nutrition.carbs_g && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-[#EDE9FE]/50">
                  {Math.round(nutrition.carbs_g)}g carbs
                </Badge>
              )}
              {nutrition.fat_g && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-[#FED7AA]/50">
                  {Math.round(nutrition.fat_g)}g fat
                </Badge>
              )}
              {nutrition.fiber_g && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-[#D9F99D]/50">
                  {Math.round(nutrition.fiber_g)}g fiber
                </Badge>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
