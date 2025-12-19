"use client";

import * as React from "react";
import { Search, UtensilsCrossed, Pin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "./sidebar-context";
import { getRecipes } from "@/app/actions/recipes";
import type { Recipe } from "@/types/recipe";

interface PinRecipeDialogProps {
  trigger?: React.ReactNode;
}

export function PinRecipeDialog({ trigger }: PinRecipeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { pinItem, isPinned } = useSidebar();

  // Fetch recipes when dialog opens
  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
      getRecipes().then(({ data, error }) => {
        if (data && !error) {
          setRecipes(data);
        }
        setIsLoading(false);
      });
    }
  }, [open]);

  // Filter recipes based on search
  const filteredRecipes = React.useMemo(() => {
    if (!search.trim()) {
      // Show most recent when no search
      return recipes.slice(0, 20);
    }
    const lowerSearch = search.toLowerCase();
    return recipes
      .filter((recipe) =>
        recipe.title.toLowerCase().includes(lowerSearch) ||
        recipe.category?.toLowerCase().includes(lowerSearch) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch))
      )
      .slice(0, 20);
  }, [recipes, search]);

  const handlePin = async (recipe: Recipe) => {
    await pinItem({
      type: "recipe",
      id: recipe.id,
      name: recipe.title,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Pin className="h-4 w-4" />
            Pin Recipe
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pin a Recipe</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
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

          {/* Recipe List */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <UtensilsCrossed className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">
                  {search ? "No recipes found" : "No recipes yet"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredRecipes.map((recipe) => {
                  const alreadyPinned = isPinned(recipe.id);
                  return (
                    <button
                      key={recipe.id}
                      onClick={() => !alreadyPinned && handlePin(recipe)}
                      disabled={alreadyPinned}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-md text-left",
                        "transition-colors",
                        alreadyPinned
                          ? "opacity-50 cursor-not-allowed bg-muted/50"
                          : "hover:bg-accent"
                      )}
                    >
                      {/* Recipe Image or Icon */}
                      {recipe.image_url ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden shrink-0 bg-muted">
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      {/* Recipe Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {recipe.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {recipe.category || recipe.recipe_type}
                          {recipe.prep_time && ` • ${recipe.prep_time}`}
                        </p>
                      </div>

                      {/* Pin indicator */}
                      {alreadyPinned ? (
                        <span className="text-xs text-muted-foreground">
                          Pinned
                        </span>
                      ) : (
                        <Pin className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
