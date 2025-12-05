"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, Clock, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactRecipeCard, type CompactRecipe } from "./compact-recipe-card";
import { cn } from "@/lib/utils";

interface SuggestionsRowProps {
  recentlyCooked: CompactRecipe[];
  favorites: CompactRecipe[];
  quickMeals: CompactRecipe[];
  neverCooked: CompactRecipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (recipe: CompactRecipe | null) => void;
}

type CategoryKey = "recent" | "favorites" | "quick" | "new";

interface Category {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
  recipes: CompactRecipe[];
  emptyMessage: string;
}

export function SuggestionsRow({
  recentlyCooked,
  favorites,
  quickMeals,
  neverCooked,
  selectedRecipeId,
  onSelectRecipe,
}: SuggestionsRowProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("recent");
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    {
      key: "recent",
      label: "Make Again",
      icon: <RotateCcw className="h-4 w-4" />,
      recipes: recentlyCooked,
      emptyMessage: "Cook some recipes to see them here!",
    },
    {
      key: "favorites",
      label: "Favorites",
      icon: <Heart className="h-4 w-4" />,
      recipes: favorites,
      emptyMessage: "Heart some recipes to see them here!",
    },
    {
      key: "quick",
      label: "Quick Meals",
      icon: <Clock className="h-4 w-4" />,
      recipes: quickMeals,
      emptyMessage: "No quick recipes found.",
    },
    {
      key: "new",
      label: "Try Something New",
      icon: <Sparkles className="h-4 w-4" />,
      recipes: neverCooked,
      emptyMessage: "You've cooked everything! Nice.",
    },
  ];

  const activeData = categories.find((c) => c.key === activeCategory);
  const recipes = activeData?.recipes || [];

  const handleRecipeClick = (recipe: CompactRecipe) => {
    if (selectedRecipeId === recipe.id) {
      onSelectRecipe(null); // Deselect
    } else {
      onSelectRecipe(recipe); // Select
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Check if any category has recipes
  const hasAnyRecipes = categories.some((c) => c.recipes.length > 0);

  if (!hasAnyRecipes) {
    return null; // Don't render the suggestions row if there are no recipes to show
  }

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((category) => {
          const hasRecipes = category.recipes.length > 0;
          return (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category.key)}
              disabled={!hasRecipes}
              className={cn(
                "shrink-0 gap-1.5 text-xs",
                !hasRecipes && "opacity-50"
              )}
            >
              {category.icon}
              {category.label}
              {hasRecipes && (
                <span className="ml-1 text-[10px] opacity-60">
                  ({category.recipes.length})
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Recipe Cards Row */}
      <div className="relative group">
        {/* Left scroll button */}
        {recipes.length > 4 && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-1 hide-scrollbar scroll-smooth"
        >
          {recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 px-2">
              {activeData?.emptyMessage}
            </p>
          ) : (
            recipes.map((recipe) => (
              <CompactRecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={selectedRecipeId === recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                size="md"
              />
            ))
          )}
        </div>

        {/* Right scroll button */}
        {recipes.length > 4 && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selection hint */}
      {selectedRecipeId && (
        <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">
          Tap a day below to add this recipe, or tap the recipe again to cancel.
        </p>
      )}
    </div>
  );
}

