"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  UtensilsCrossed,
  Cookie,
  Croissant,
  Coffee,
  IceCream,
  Salad,
  Users,
  ChefHat,
  Plus,
  Clock,
  Flame,
} from "lucide-react";
import type { RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";
import { useDemo } from "@/lib/demo/demo-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="h-4 w-4" />;
    case "Breakfast":
      return <Coffee className="h-4 w-4" />;
    case "Dessert":
      return <IceCream className="h-4 w-4" />;
    case "Snack":
      return <Croissant className="h-4 w-4" />;
    case "Side Dish":
      return <Salad className="h-4 w-4" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="h-4 w-4" />;
  }
}

interface DemoRecipeCardProps {
  recipe: RecipeWithFavoriteAndNutrition;
  animationIndex?: number;
}

export const DemoRecipeCard = memo(function DemoRecipeCard({
  recipe,
  animationIndex,
}: DemoRecipeCardProps) {
  const { toggleFavorite, addToMealPlan, weekPlanData } = useDemo();
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite ?? false);

  // Check if recipe is already in this week's meal plan
  const isInPlan = Object.values(weekPlanData.assignments)
    .flat()
    .some((a) => a.recipe_id === recipe.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    toggleFavorite(recipe.id);
    toast.success(newState ? "Added to favorites" : "Removed from favorites");
  };

  const handleAddToPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInPlan) {
      toast.info("Already in this week's plan!");
      return;
    }
    // Add to a random weekday for demo
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
    const randomDay = days[Math.floor(Math.random() * days.length)];
    addToMealPlan(recipe.id, randomDay, "dinner");
    toast.success(`Added to ${randomDay}!`);
  };

  return (
    <Link href={`/demo/recipes/${recipe.id}`}>
      <Card
        className={cn(
          "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out",
          "flex flex-col h-full cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary/20",
          "animate-slide-up-fade"
        )}
        style={
          animationIndex !== undefined
            ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: "backwards" }
            : undefined
        }
      >
        {/* Recipe Image */}
        {recipe.image_url && (
          <div className="relative w-full h-48 overflow-hidden bg-muted">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Nutrition Quick Stats */}
        {recipe.nutrition && (
          <div className="px-4 py-2 flex items-center gap-3 border-b bg-muted/30">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {recipe.nutrition.calories} cal
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {recipe.nutrition.protein_g}g protein
            </span>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
                <span className="inline-flex items-center gap-1">
                  {getRecipeIcon(recipe.recipe_type)}
                  {recipe.recipe_type}
                </span>
                {recipe.cook_time && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.cook_time}
                    </span>
                  </>
                )}
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={cn("h-8 w-8", isFavorite && "text-red-500")}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 pt-0">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {recipe.ingredients.slice(0, 4).join(", ")}
              {recipe.ingredients.length > 4 && "..."}
            </p>
          </div>

          {/* Serving Size */}
          {recipe.servings && (
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Serves {recipe.servings}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Link href={`/demo/recipes/${recipe.id}/cook`} className="flex-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="sm" className="w-full gap-1.5">
                <ChefHat className="h-4 w-4" />
                Cook
              </Button>
            </Link>
            {isInPlan ? (
              <Badge variant="secondary" className="h-8 px-3 flex items-center">
                In Plan
              </Badge>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleAddToPlan}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to meal plan</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
