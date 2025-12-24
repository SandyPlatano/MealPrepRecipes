"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus, Heart, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface InlineRecipePickerProps {
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  day: DayOfWeek;
  onSelect: (recipeId: string, day: DayOfWeek) => Promise<void>;
  onClose: () => void;
}

type FilterTab = "all" | "favorites" | "recent";

export function InlineRecipePicker({
  recipes,
  favorites,
  recentRecipeIds,
  day,
  onSelect,
  onClose,
}: InlineRecipePickerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Escape key, and only if not typing in an input/textarea
      if (e.key === "Escape") {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
        // Allow Escape to work even in inputs to close the picker
        if (!isInput || target === inputRef.current) {
          onClose();
        }
      }
      // Explicitly allow all other keyboard shortcuts (Ctrl/Cmd+A, Ctrl/Cmd+C, etc.)
      // to work normally - don't prevent default or stop propagation
    };
    window.addEventListener("keydown", handleKeyDown, { capture: false });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: false });
  }, [onClose]);

  const filteredRecipes = useMemo(() => {
    let result = recipes;

    // Apply tab filter
    if (activeTab === "favorites") {
      result = result.filter((r) => favorites.includes(r.id));
    } else if (activeTab === "recent") {
      result = result.filter((r) => recentRecipeIds.includes(r.id));
      // Sort by recent order
      result.sort((a, b) => {
        return recentRecipeIds.indexOf(a.id) - recentRecipeIds.indexOf(b.id);
      });
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.recipe_type.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [recipes, favorites, recentRecipeIds, search, activeTab]);

  const handleSelect = async (recipeId: string) => {
    setIsAdding(recipeId);
    try {
      await onSelect(recipeId, day);
      onClose();
    } catch (error) {
      console.error("Error adding recipe:", error);
    } finally {
      setIsAdding(null);
    }
  };

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: "all",
      label: "All",
      icon: <Sparkles className="h-3 w-3" />,
      count: recipes.length,
    },
    {
      key: "favorites",
      label: "Favorites",
      icon: <Heart className="h-3 w-3" />,
      count: recipes.filter((r) => favorites.includes(r.id)).length,
    },
    {
      key: "recent",
      label: "Recent",
      icon: <Clock className="h-3 w-3" />,
      count: recipes.filter((r) => recentRecipeIds.includes(r.id)).length,
    },
  ];

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 w-72 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Add to {day}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => setActiveTab(tab.key)}
            disabled={tab.count === 0}
          >
            {tab.icon}
            <span className="ml-1">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Recipe List */}
      <ScrollArea className="h-48">
        {filteredRecipes.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            {search ? "No matches found" : "No recipes available"}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredRecipes.slice(0, 20).map((recipe) => (
              <button
                type="button"
                key={recipe.id}
                onClick={() => handleSelect(recipe.id)}
                disabled={isAdding !== null}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-md text-left",
                  "hover:bg-accent transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isAdding === recipe.id && "bg-accent"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recipe.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {recipe.recipe_type}
                    </Badge>
                    {recipe.prep_time && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {recipe.prep_time}
                      </span>
                    )}
                  </div>
                </div>
                <Plus
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground",
                    isAdding === recipe.id && "animate-spin"
                  )}
                />
              </button>
            ))}
            {filteredRecipes.length > 20 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                +{filteredRecipes.length - 20} more
              </p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

