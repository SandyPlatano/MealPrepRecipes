"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChefHat } from "lucide-react";
import { RecipePickerCard } from "./recipe-picker-card";
import type { DayOfWeek } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  tags?: string[];
}

interface RecipePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: DayOfWeek;
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  suggestedRecipeIds: string[];
  cookNames: string[];
  onAdd: (recipeIds: string[], cook: string | null, note?: string) => Promise<void>;
}

export function RecipePickerModal({
  open,
  onOpenChange,
  day,
  recipes,
  favorites,
  recentRecipeIds,
  suggestedRecipeIds,
  cookNames,
  onAdd,
}: RecipePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCook, setSelectedCook] = useState<string>("none");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "recent" | "suggestions">("all");

  // Filter recipes based on active tab
  const tabRecipes = useMemo(() => {
    switch (activeTab) {
      case "favorites":
        return recipes.filter(r => favorites.includes(r.id));
      case "recent":
        return recipes.filter(r => recentRecipeIds.includes(r.id));
      case "suggestions":
        return recipes.filter(r => suggestedRecipeIds.includes(r.id));
      default:
        return recipes;
    }
  }, [activeTab, recipes, favorites, recentRecipeIds, suggestedRecipeIds]);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return tabRecipes;
    
    const query = searchQuery.toLowerCase();
    return tabRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.recipe_type.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [tabRecipes, searchQuery]);

  const handleRecipeToggle = (recipeId: string) => {
    const newSelected = new Set(selectedRecipeIds);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipeIds(newSelected);
  };

  const handleAdd = async () => {
    if (selectedRecipeIds.size === 0) return;
    
    setIsAdding(true);
    try {
      const cook = selectedCook === "none" ? null : selectedCook;
      await onAdd(Array.from(selectedRecipeIds), cook);
      
      // Reset state
      setSelectedRecipeIds(new Set());
      setSelectedCook("none");
      setSearchQuery("");
      setActiveTab("all");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding recipes:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedRecipeIds(new Set());
    setSelectedCook("none");
    setSearchQuery("");
    setActiveTab("all");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            Add to {day}
          </DialogTitle>
        </DialogHeader>

        {/* Search & Cook Selector */}
        <div className="px-6 py-4 border-b space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCook} onValueChange={setSelectedCook}>
              <SelectTrigger className="w-[200px]">
                <ChefHat className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Assign cook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No cook assigned</SelectItem>
                {cookNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs & Recipe Grid */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 w-auto">
            <TabsTrigger value="all">All ({recipes.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({recentRecipeIds.length})</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions ({suggestedRecipeIds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-y-auto px-6 pb-4 mt-4">
            {filteredRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">
                  {searchQuery ? "No recipes found" : "No recipes in this category"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRecipes.map((recipe) => (
                  <RecipePickerCard
                    key={recipe.id}
                    recipe={recipe}
                    isSelected={selectedRecipeIds.has(recipe.id)}
                    isFavorite={favorites.includes(recipe.id)}
                    onToggle={() => handleRecipeToggle(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {selectedRecipeIds.size > 0 ? (
                <div>
                  <p className="text-sm font-semibold">
                    {selectedRecipeIds.size} recipe{selectedRecipeIds.size > 1 ? 's' : ''} selected
                  </p>
                  {selectedCook !== "none" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cook: {selectedCook}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click recipes above to select them
                </p>
              )}
            </div>
            <Button
              onClick={handleAdd}
              disabled={selectedRecipeIds.size === 0 || isAdding}
              size="lg"
              className="min-w-[160px]"
            >
              {isAdding ? "Adding..." : `Add to ${day}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

