"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Zap, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
}

interface QuickAddDropdownProps {
  recipes: Recipe[];
  recentRecipeIds: string[];
  onQuickAdd: (recipeId: string) => Promise<void>;
  onOpenFullPicker: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function QuickAddDropdown({
  recipes,
  recentRecipeIds,
  onQuickAdd,
  onOpenFullPicker,
  disabled = false,
  compact = false,
}: QuickAddDropdownProps) {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get the last 5 recently-cooked recipes
  const recentRecipes = recentRecipeIds
    .slice(0, 5)
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => r !== undefined);

  const handleQuickAdd = async (recipeId: string) => {
    setIsAdding(recipeId);
    try {
      await onQuickAdd(recipeId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error quick-adding recipe:", error);
    } finally {
      setIsAdding(null);
    }
  };

  // If no recent recipes, just show the regular add button
  if (recentRecipes.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenFullPicker}
        disabled={disabled}
        className={cn(
          "w-full h-12 md:h-11 text-sm md:text-base border-2 border-dashed rounded-lg",
          "hover:border-[#D9F99D] hover:bg-[#D9F99D]/10 transition-colors"
        )}
      >
        <Plus className="size-5 mr-2" />
        Add Meal
      </Button>
    );
  }

  return (
    <div className="flex gap-1.5 w-full">
      {/* Main Add Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenFullPicker}
        disabled={disabled}
        className={cn(
          "flex-1 h-12 md:h-11 text-sm md:text-base border-2 border-dashed rounded-lg rounded-r-none",
          "hover:border-[#D9F99D] hover:bg-[#D9F99D]/10 transition-colors"
        )}
      >
        <Plus className="size-5 mr-2" />
        Add Meal
      </Button>

      {/* Quick Add Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-12 md:h-11 px-3 border-2 border-dashed rounded-lg rounded-l-none border-l-0",
              "hover:border-[#D9F99D] hover:bg-[#D9F99D]/10 transition-colors",
              "flex items-center gap-1"
            )}
          >
            <Zap className="size-4 text-amber-500" />
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            Quick Add Recent
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {recentRecipes.map((recipe) => (
            <DropdownMenuItem
              key={recipe.id}
              onClick={() => handleQuickAdd(recipe.id)}
              disabled={isAdding !== null}
              className={cn(
                "flex flex-col items-start gap-0.5 py-2.5 cursor-pointer",
                isAdding === recipe.id && "opacity-50"
              )}
            >
              <span className="font-medium truncate w-full">{recipe.title}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                {recipe.recipe_type}
                {recipe.prep_time && (
                  <>
                    <span>•</span>
                    {recipe.prep_time}
                  </>
                )}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              onOpenFullPicker();
            }}
            className="text-muted-foreground"
          >
            <Plus className="size-4 mr-2" />
            Browse all recipes...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
