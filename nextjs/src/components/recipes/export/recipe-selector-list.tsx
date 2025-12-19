"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/types/recipe";

interface RecipeSelectorListProps {
  recipes: Recipe[];
  selectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  maxHeight?: string;
}

export function RecipeSelectorList({
  recipes,
  selectedIds,
  onSelectionChange,
  maxHeight = "300px",
}: RecipeSelectorListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    const query = searchQuery.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.recipe_type.toLowerCase().includes(query) ||
        recipe.category?.toLowerCase().includes(query) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [recipes, searchQuery]);

  const allSelected = filteredRecipes.length > 0 &&
    filteredRecipes.every((r) => selectedIds.has(r.id));
  const someSelected = filteredRecipes.some((r) => selectedIds.has(r.id)) && !allSelected;

  const handleSelectAll = () => {
    const newSelection = new Set(selectedIds);
    if (allSelected) {
      // Deselect all filtered
      filteredRecipes.forEach((r) => newSelection.delete(r.id));
    } else {
      // Select all filtered
      filteredRecipes.forEach((r) => newSelection.add(r.id));
    }
    onSelectionChange(newSelection);
  };

  const handleToggle = (recipeId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    onSelectionChange(newSelection);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between py-2 px-1 border-b">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            // @ts-expect-error - indeterminate is valid but not typed
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="font-medium cursor-pointer">
            Select All
          </Label>
        </div>
        <span className="text-sm text-muted-foreground">
          {selectedIds.size} of {recipes.length} selected
        </span>
      </div>

      {/* Recipe List */}
      <ScrollArea style={{ height: maxHeight }}>
        <div className="flex flex-col pr-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No recipes match your search" : "No recipes available"}
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggle(recipe.id)}
              >
                <Checkbox
                  checked={selectedIds.has(recipe.id)}
                  onCheckedChange={() => handleToggle(recipe.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{recipe.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{recipe.recipe_type}</span>
                    {recipe.category && (
                      <>
                        <span>•</span>
                        <span>{recipe.category}</span>
                      </>
                    )}
                  </div>
                </div>
                {recipe.tags.length > 0 && (
                  <div className="hidden sm:flex gap-1">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selection Summary */}
      {searchQuery && filteredRecipes.length !== recipes.length && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </p>
      )}
    </div>
  );
}
