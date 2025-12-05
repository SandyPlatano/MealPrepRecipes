"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { DraggableRecipe } from "./draggable-recipe";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  tags?: string[];
}

interface RecipeSidebarProps {
  recipes: Recipe[];
}

export function RecipeSidebar({ recipes }: RecipeSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;

    const searchLower = search.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.recipe_type.toLowerCase().includes(searchLower) ||
        recipe.category?.toLowerCase().includes(searchLower) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }, [recipes, search]);

  return (
    <Card className="h-[calc(100vh-240px)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Recipes</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-2">
            {filteredRecipes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {recipes.length === 0
                  ? "No recipes yet. Add some first!"
                  : "No matching recipes."}
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <DraggableRecipe key={recipe.id} recipe={recipe} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

