"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus, Heart, Clock, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecipePickerState } from "@/contexts/recipe-picker-context";
import type { DayOfWeek } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface MobileRecipePickerSheetProps {
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  day: DayOfWeek;
  isOpen: boolean;
  onSelect: (recipeId: string, day: DayOfWeek) => Promise<void>;
  onClose: () => void;
}

type FilterTab = "all" | "favorites" | "recent";

export function MobileRecipePickerSheet({
  recipes,
  favorites,
  recentRecipeIds,
  day,
  isOpen,
  onSelect,
  onClose,
}: MobileRecipePickerSheetProps) {
  // Use persistent context for search and tab state (shared with desktop modal)
  const { searchQuery, setSearchQuery, activeTab: contextTab, setActiveTab: setContextTab, clearSearch } = useRecipePickerState();
  // Map context tab to mobile tab (mobile doesn't have "suggestions")
  const activeTab: FilterTab = contextTab === "suggestions" ? "all" : (contextTab as FilterTab);
  const setActiveTab = (tab: FilterTab) => setContextTab(tab);
  // Use context's searchQuery
  const search = searchQuery;
  const setSearch = setSearchQuery;

  const [isAdding, setIsAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the sheet is visible before focusing
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Escape key, and only if not typing in an input/textarea
      if (e.key === "Escape" && isOpen) {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
        // Allow Escape to work even in inputs to close the sheet
        if (!isInput || target === inputRef.current) {
          onClose();
        }
      }
      // Explicitly allow all other keyboard shortcuts (Ctrl/Cmd+A, Ctrl/Cmd+C, etc.)
      // to work normally - don't prevent default or stop propagation
    };
    window.addEventListener("keydown", handleKeyDown, { capture: false });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: false });
  }, [onClose, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Note: Search and tab state persist via context (no reset on close)

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
      icon: <Sparkles className="h-4 w-4" />,
      count: recipes.length,
    },
    {
      key: "favorites",
      label: "Favorites",
      icon: <Heart className="h-4 w-4" />,
      count: recipes.filter((r) => favorites.includes(r.id)).length,
    },
    {
      key: "recent",
      label: "Recent",
      icon: <Clock className="h-4 w-4" />,
      count: recipes.filter((r) => recentRecipeIds.includes(r.id)).length,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "h-[70vh] max-h-[70vh]",
          "bg-background rounded-t-2xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "flex flex-col"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            aria-label="Close"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Add to {day}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl bg-muted/50"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "secondary"}
              size="sm"
              className={cn(
                "h-10 text-sm flex-1 rounded-xl gap-1.5",
                activeTab === tab.key && "shadow-md"
              )}
              onClick={() => setActiveTab(tab.key)}
              disabled={tab.count === 0}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <Badge
                variant={activeTab === tab.key ? "secondary" : "outline"}
                className="ml-1 text-xs px-1.5 py-0"
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Recipe List */}
        <ScrollArea className="flex-1 px-4">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-base">
                {search ? "No matches found" : "No recipes available"}
              </p>
              {search && (
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={clearSearch}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-6">
              {filteredRecipes.map((recipe) => (
                <button
                  type="button"
                  key={recipe.id}
                  onClick={() => handleSelect(recipe.id)}
                  disabled={isAdding !== null}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl text-left",
                    "bg-card border shadow-sm",
                    "hover:bg-accent hover:shadow-md active:scale-[0.98]",
                    "transition-all duration-150",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isAdding === recipe.id && "bg-accent ring-2 ring-primary"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate">{recipe.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs">
                        {recipe.recipe_type}
                      </Badge>
                      {recipe.prep_time && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prep_time}
                        </span>
                      )}
                      {favorites.includes(recipe.id) && (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      "bg-[#D9F99D]/20 text-[#1A1A1A]",
                      isAdding === recipe.id && "animate-pulse"
                    )}
                  >
                    <Plus className="h-5 w-5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
