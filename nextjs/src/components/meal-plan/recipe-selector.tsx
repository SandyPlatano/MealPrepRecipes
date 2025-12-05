"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, Plus, ChefHat } from "lucide-react";
import { addMealAssignment } from "@/app/actions/meal-plans";
import type { DayOfWeek } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  tags?: string[];
}

interface RecipeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: Recipe[];
  selectedDay: DayOfWeek | null;
  weekStart: string;
  cookNames: string[];
}

export function RecipeSelector({
  open,
  onOpenChange,
  recipes,
  selectedDay,
  weekStart,
  cookNames,
}: RecipeSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCook, setSelectedCook] = useState<string>("none");
  const [adding, setAdding] = useState<string | null>(null);

  const filteredRecipes = recipes.filter((recipe) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.recipe_type.toLowerCase().includes(searchLower) ||
      recipe.category?.toLowerCase().includes(searchLower) ||
      recipe.tags?.some((t) => t.toLowerCase().includes(searchLower))
    );
  });

  const handleAddRecipe = async (recipeId: string) => {
    if (!selectedDay) return;

    setAdding(recipeId);
    const cook = selectedCook !== "none" ? selectedCook : undefined;
    await addMealAssignment(weekStart, recipeId, selectedDay, cook);
    setAdding(null);
    onOpenChange(false);
    setSearch("");
    setSelectedCook("none");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearch("");
      setSelectedCook("none");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Add recipe to {selectedDay}
          </DialogTitle>
        </DialogHeader>

        {/* Search and Cook Selection */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {cookNames.length > 0 && (
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCook} onValueChange={setSelectedCook}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Assign a cook (optional)" />
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
          )}
        </div>

        {/* Recipe List */}
        <ScrollArea className="h-[350px] pr-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {recipes.length === 0
                ? "No recipes yet. Add some to The Vault first!"
                : "No recipes match your search."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium truncate">{recipe.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {recipe.recipe_type}
                      </Badge>
                      {recipe.prep_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prep_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddRecipe(recipe.id)}
                    disabled={adding === recipe.id}
                  >
                    {adding === recipe.id ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
