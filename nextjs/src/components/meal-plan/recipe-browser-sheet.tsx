"use client";

import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Clock, X, Filter } from "lucide-react";
import { addMealAssignment } from "@/app/actions/meal-plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types/meal-plan";
import type { CompactRecipe } from "./compact-recipe-card";
import Image from "next/image";

// Recipe type icons and colors (matching compact-recipe-card)
const recipeTypeConfig: Record<string, { gradient: string }> = {
  Baking: { gradient: "from-amber-400 to-orange-500" },
  Breakfast: { gradient: "from-yellow-400 to-amber-500" },
  Dessert: { gradient: "from-pink-400 to-rose-500" },
  Snack: { gradient: "from-lime-400 to-green-500" },
  "Side Dish": { gradient: "from-emerald-400 to-teal-500" },
  Dinner: { gradient: "from-blue-400 to-purple-500" },
};

interface RecipeBrowserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: CompactRecipe[];
  selectedDay: DayOfWeek | null;
  weekStart: string;
}

export function RecipeBrowserSheet({
  open,
  onOpenChange,
  recipes,
  selectedDay,
  weekStart,
}: RecipeBrowserSheetProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const recipeTypes = useMemo(() => {
    const types = new Set(recipes.map((r) => r.recipe_type));
    return Array.from(types).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !recipe.title.toLowerCase().includes(searchLower) &&
          !recipe.recipe_type.toLowerCase().includes(searchLower) &&
          !recipe.category?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (selectedType && recipe.recipe_type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [recipes, search, selectedType]);

  const handleAddRecipe = async (recipe: CompactRecipe) => {
    if (!selectedDay) return;

    setAdding(recipe.id);
    const result = await addMealAssignment(weekStart, recipe.id, selectedDay);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added "${recipe.title}" to ${selectedDay}`, {
        action: {
          label: "Undo",
          onClick: () => router.refresh(),
        },
      });
      router.refresh();
      onOpenChange(false);
    }
    setAdding(null);
  };

  const handleClose = () => {
    setSearch("");
    setSelectedType(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-xl px-0 pb-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 pb-3 border-b">
            <SheetTitle className="text-center">
              {selectedDay ? `Add to ${selectedDay}` : "Browse Recipes"}
            </SheetTitle>
          </SheetHeader>

          {/* Search & Filters */}
          <div className="px-4 py-3 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                className="shrink-0 h-7 text-xs"
                onClick={() => setSelectedType(null)}
              >
                All
              </Button>
              {recipeTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 h-7 text-xs"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipe List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {recipes.length === 0
                    ? "No recipes yet. Add some to your collection!"
                    : "No recipes match your search."}
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const typeConfig = recipeTypeConfig[recipe.recipe_type] || recipeTypeConfig.Dinner;
                  return (
                    <div
                      key={recipe.id}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-colors"
                    >
                      {/* Recipe Image or Gradient */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                        {recipe.image_url ? (
                          <Image
                            src={recipe.image_url}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-gradient-to-br flex items-center justify-center text-white/90 text-lg",
                              typeConfig.gradient
                            )}
                          >
                            {recipe.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Recipe Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{recipe.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {recipe.recipe_type}
                          </Badge>
                          {recipe.prep_time && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {recipe.prep_time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="sm"
                        onClick={() => handleAddRecipe(recipe)}
                        disabled={adding === recipe.id}
                        className="shrink-0"
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
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

