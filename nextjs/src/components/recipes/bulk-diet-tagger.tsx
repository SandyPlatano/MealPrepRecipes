"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Tags,
  Search,
  X,
  Leaf,
  Wheat,
  Flame,
  Mountain,
  Ship,
  Milk,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { bulkAddTagToRecipes } from "@/app/actions/bulk-tag-recipes";
import type { Recipe } from "@/types/recipe";

// Diet type definitions with icons
const DIET_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: "Vegan", icon: Leaf },
  { label: "Vegetarian", icon: Leaf },
  { label: "Keto", icon: Flame },
  { label: "Paleo", icon: Mountain },
  { label: "Mediterranean", icon: Ship },
  { label: "Gluten-Free", icon: Wheat },
  { label: "Dairy-Free", icon: Milk },
  { label: "Low-Carb", icon: TrendingDown },
];

interface BulkDietTaggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: Recipe[];
}

export function BulkDietTagger({
  open,
  onOpenChange,
  recipes,
}: BulkDietTaggerProps) {
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDiet(null);
      setSelectedRecipeIds(new Set());
      setSearchQuery("");
    }
  }, [open]);

  // Filter recipes based on search
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

  // Get diet tags present on each recipe
  const getRecipeDietTags = (recipe: Recipe): string[] => {
    const dietLabels = DIET_TYPES.map((d) => d.label.toLowerCase());
    return recipe.tags.filter((tag) =>
      dietLabels.includes(tag.toLowerCase())
    );
  };

  // Count recipes without diet tags
  const recipesWithoutDietTags = useMemo(() => {
    return recipes.filter((r) => getRecipeDietTags(r).length === 0);
  }, [recipes]);

  // Selection helpers
  const handleToggleRecipe = (recipeId: string) => {
    const newSelection = new Set(selectedRecipeIds);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipeIds(newSelection);
  };

  const handleSelectAll = () => {
    const allSelected = filteredRecipes.every((r) => selectedRecipeIds.has(r.id));

    if (allSelected) {
      // Deselect all filtered
      const newSelection = new Set(selectedRecipeIds);
      filteredRecipes.forEach((r) => newSelection.delete(r.id));
      setSelectedRecipeIds(newSelection);
    } else {
      // Select all filtered
      const newSelection = new Set(selectedRecipeIds);
      filteredRecipes.forEach((r) => newSelection.add(r.id));
      setSelectedRecipeIds(newSelection);
    }
  };

  const handleSelectWithoutDietTags = () => {
    const idsWithoutTags = new Set(recipesWithoutDietTags.map((r) => r.id));
    setSelectedRecipeIds(idsWithoutTags);
  };

  const handleApply = async () => {
    if (!selectedDiet) {
      toast.error("Please select a diet type to apply");
      return;
    }

    if (selectedRecipeIds.size === 0) {
      toast.error("Please select at least one recipe");
      return;
    }

    setIsApplying(true);

    try {
      const result = await bulkAddTagToRecipes(
        Array.from(selectedRecipeIds),
        selectedDiet
      );

      if (result.success) {
        if (result.updatedCount > 0) {
          toast.success(
            `Added "${selectedDiet}" tag to ${result.updatedCount} recipe${result.updatedCount !== 1 ? "s" : ""}`
          );
        } else {
          toast.info("All selected recipes already have this diet tag");
        }
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update recipes");
      }
    } catch (error) {
      console.error("Bulk tag error:", error);
      toast.error("An error occurred while updating recipes");
    } finally {
      setIsApplying(false);
    }
  };

  const allFilteredSelected =
    filteredRecipes.length > 0 &&
    filteredRecipes.every((r) => selectedRecipeIds.has(r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Bulk Diet Tagging
          </DialogTitle>
          <DialogDescription>
            Add diet tags to multiple recipes at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex-col">
          {/* Diet Type Selector */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Select Diet Type to Apply</label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((diet) => {
                const Icon = diet.icon;
                const isSelected = selectedDiet === diet.label;
                return (
                  <button
                    type="button"
                    key={diet.label}
                    onClick={() => setSelectedDiet(diet.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {diet.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipe Selector */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Recipes</label>
              <span className="text-sm text-muted-foreground">
                {selectedRecipeIds.size} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Select Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {allFilteredSelected ? "Deselect All" : `Select All (${filteredRecipes.length})`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectWithoutDietTags}
              >
                Select Without Diet Tags ({recipesWithoutDietTags.length})
              </Button>
            </div>

            {/* Recipe List */}
            <ScrollArea className="h-[250px] border rounded-lg">
              <div className="flex p-2 flex-col">
                {filteredRecipes.map((recipe) => {
                  const dietTags = getRecipeDietTags(recipe);
                  const isSelected = selectedRecipeIds.has(recipe.id);
                  const alreadyHasSelectedDiet =
                    selectedDiet &&
                    dietTags.some(
                      (t) => t.toLowerCase() === selectedDiet.toLowerCase()
                    );

                  return (
                    <label
                      key={recipe.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected ? "bg-accent" : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleRecipe(recipe.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {recipe.title}
                          </span>
                          {alreadyHasSelectedDiet && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              Already {selectedDiet}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dietTags.length > 0 ? (
                            <span>Diet: {dietTags.join(", ")}</span>
                          ) : (
                            <span className="italic">No diet tags</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filteredRecipes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recipes match your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedDiet || selectedRecipeIds.size === 0 || isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              `Apply ${selectedDiet || "Diet Tag"} to ${selectedRecipeIds.size} Recipe${selectedRecipeIds.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
