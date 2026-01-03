import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCardContent } from "@/components/ui/hover-card";
import { Heart, ChefHat, UtensilsCrossed, Share2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";

interface RecipeCardHoverProps {
  recipe: RecipeWithFavoriteAndNutrition;
  isFavorite: boolean;
  isPending: boolean;
  isAddingToPlan: boolean;
  hasAnyWarnings: boolean;
  allWarnings: string[];
  onToggleFavorite: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onStartCooking: () => void;
}

export function RecipeCardHover({
  recipe,
  isFavorite,
  isPending,
  isAddingToPlan,
  hasAnyWarnings,
  allWarnings,
  onToggleFavorite,
  onAddToCart,
  onShare,
  onStartCooking,
}: RecipeCardHoverProps) {
  return (
    <HoverCardContent className="w-80" side="right" align="start">
      <div className="space-y-3">
        {/* Header: Title + Favorite */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold line-clamp-1">{recipe.title}</h4>
            <p className="text-sm text-muted-foreground">
              {recipe.recipe_type}
              {recipe.category && ` • ${recipe.category}`}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 shrink-0"
            onClick={onToggleFavorite}
            disabled={isPending}
          >
            <Heart
              className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")}
            />
          </Button>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Nutrition Grid */}
        {recipe.nutrition && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-[#D9F99D]">
                {Math.round(recipe.nutrition.calories || 0)}
              </div>
              <div className="text-[10px] text-muted-foreground">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(recipe.nutrition.protein_g || 0)}g
              </div>
              <div className="text-[10px] text-muted-foreground">protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(recipe.nutrition.carbs_g || 0)}g
              </div>
              <div className="text-[10px] text-muted-foreground">carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Math.round(recipe.nutrition.fat_g || 0)}g
              </div>
              <div className="text-[10px] text-muted-foreground">fat</div>
            </div>
          </div>
        )}

        {/* Allergen Warning */}
        {hasAnyWarnings && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 pt-2 border-t">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Contains: {allWarnings.slice(0, 3).join(", ")}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1 bg-[#1A1A1A] hover:bg-[#2A2A2A]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStartCooking();
            }}
          >
            <ChefHat className="h-3 w-3 mr-1" />
            Cook
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onAddToCart}
            disabled={isAddingToPlan}
          >
            <UtensilsCrossed className="h-3 w-3 mr-1" />
            Plan
          </Button>
          <Button size="sm" variant="outline" onClick={onShare}>
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </HoverCardContent>
  );
}
