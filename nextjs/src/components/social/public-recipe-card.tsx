"use client";

import { useState, useTransition } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Star,
  Bookmark,
  BookmarkCheck,
  MoreVertical,
  Flag,
  Copy,
  UtensilsCrossed,
  Cookie,
  Coffee,
  Croissant,
  IceCream,
  Salad,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { saveRecipe, unsaveRecipe } from "@/app/actions/community";
import { copyPublicRecipe } from "@/app/actions/sharing";
import type { PublicRecipe, TrendingRecipe } from "@/types/social";
import type { RecipeType } from "@/types/recipe";

function getRecipeIcon(recipeType: string) {
  switch (recipeType as RecipeType) {
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

interface PublicRecipeCardProps {
  recipe: PublicRecipe | TrendingRecipe;
  onReport?: (recipeId: string) => void;
  isAuthenticated?: boolean;
  animationIndex?: number;
}

export function PublicRecipeCard({
  recipe,
  onReport,
  isAuthenticated = false,
  animationIndex,
}: PublicRecipeCardProps) {
  const [isSaved, setIsSaved] = useState(recipe.is_saved);
  const [isPending, startTransition] = useTransition();
  const [isCopying, setIsCopying] = useState(false);

  // Determine if recipe has rating/review info (PublicRecipe has it, TrendingRecipe doesn't)
  const hasReviewInfo = "avg_rating" in recipe && recipe.avg_rating !== undefined;
  const avgRating = hasReviewInfo ? (recipe as PublicRecipe).avg_rating : null;
  const reviewCount = hasReviewInfo ? (recipe as PublicRecipe).review_count : 0;

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Sign in to save recipes");
      return;
    }

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    startTransition(async () => {
      const result = newSavedState
        ? await saveRecipe(recipe.id)
        : await unsaveRecipe(recipe.id);

      if (result.error) {
        setIsSaved(!newSavedState);
        toast.error(result.error);
      } else {
        toast.success(newSavedState ? "Recipe saved!" : "Recipe unsaved");
      }
    });
  };

  const handleCopyToMyRecipes = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Sign in to copy recipes");
      return;
    }

    setIsCopying(true);
    const result = await copyPublicRecipe(recipe.id);
    setIsCopying(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success("Recipe copied to your collection!");
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReport?.(recipe.id);
  };

  return (
    <Link href={`/discover/${recipe.id}`}>
      <Card
        className="hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col h-full cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary/20 animate-slide-up-fade"
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
            {/* Overlay badges */}
            <div className="absolute top-2 right-2 flex gap-1">
              {avgRating && avgRating > 0 && (
                <Badge variant="secondary" className="bg-black/60 text-white border-0 gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {avgRating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  {getRecipeIcon(recipe.recipe_type)}
                  {recipe.recipe_type}
                </span>
                {recipe.category && (
                  <>
                    <span>•</span>
                    <span>{recipe.category}</span>
                  </>
                )}
              </CardDescription>
            </div>
            <div
              className="flex gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveToggle}
                    className={isSaved ? "text-primary" : ""}
                    disabled={isPending}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 fill-current" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSaved ? "Unsave recipe" : "Save recipe"}
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyToMyRecipes} disabled={isCopying}>
                    {isCopying ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy to My Recipes
                  </DropdownMenuItem>
                  {onReport && (
                    <DropdownMenuItem
                      onClick={handleReport}
                      className="text-destructive focus:text-destructive"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report Recipe
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-end pt-0">
          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={recipe.author.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {recipe.author.username?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                @{recipe.author.username}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {recipe.view_count}
              </span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {reviewCount}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
