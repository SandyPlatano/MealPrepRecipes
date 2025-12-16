"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RecipeCard } from "./recipe-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, SlidersHorizontal, Plus, ArrowDownUp, Sparkles, Apple } from "lucide-react";
import type { RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";

interface RecipeGridProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts?: Record<string, number>; // recipe_id -> count
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  onDiscoverClick?: () => void;
}

// Nutrition filter types
type CalorieFilter = "any" | "under400" | "under600" | "under800";
type ProteinFilter = "any" | "20plus" | "30plus" | "40plus";
type NutritionBadgeFilter = "high_protein" | "light" | "low_carb" | "fiber_rich" | "heart_healthy";

const recipeTypes: RecipeType[] = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
];

type SortOption = "recent" | "most-cooked" | "highest-rated" | "alphabetical";

export function RecipeGrid({ recipes: initialRecipes, recipeCookCounts = {}, userAllergenAlerts = [], customDietaryRestrictions = [], onDiscoverClick }: RecipeGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipeType | "all">("all");
  const [proteinTypeFilter, setProteinTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Nutrition filters
  const [calorieFilter, setCalorieFilter] = useState<CalorieFilter>("any");
  const [proteinFilter, setProteinFilter] = useState<ProteinFilter>("any");
  const [nutritionBadges, setNutritionBadges] = useState<Set<NutritionBadgeFilter>>(new Set());

  // Extract unique proteins and tags from recipes
  const { proteins, tags } = useMemo(() => {
    const proteinSet = new Set<string>();
    const tagSet = new Set<string>();

    initialRecipes.forEach((recipe) => {
      if (recipe.protein_type) {
        proteinSet.add(recipe.protein_type);
      }
      recipe.tags.forEach((tag) => tagSet.add(tag));
    });

    return {
      proteins: Array.from(proteinSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [initialRecipes]);

  // Helper function to check if recipe matches nutrition badge criteria
  const matchesNutritionBadge = (recipe: RecipeWithFavoriteAndNutrition, badge: NutritionBadgeFilter): boolean => {
    const n = recipe.nutrition;
    if (!n) return false;

    switch (badge) {
      case "light":
        return (n.calories ?? Infinity) < 400;
      case "high_protein":
        return (n.protein_g ?? 0) >= 30;
      case "low_carb":
        return (n.carbs_g ?? Infinity) < 20;
      case "fiber_rich":
        return (n.fiber_g ?? 0) >= 8;
      case "heart_healthy":
        return (n.sodium_mg ?? Infinity) < 500 && (n.fat_g ?? Infinity) < 15;
      default:
        return false;
    }
  };

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    const filtered = initialRecipes.filter((recipe) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((i) => i.toLowerCase().includes(searchLower)) ||
          recipe.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
          recipe.category?.toLowerCase().includes(searchLower) ||
          recipe.protein_type?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "all" && recipe.recipe_type !== typeFilter) {
        return false;
      }

      // Protein type filter (e.g., Chicken, Beef, etc.)
      if (proteinTypeFilter !== "all" && recipe.protein_type !== proteinTypeFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter !== "all" && !recipe.tags.includes(tagFilter)) {
        return false;
      }

      // Favorites filter
      if (favoritesOnly && !recipe.is_favorite) {
        return false;
      }

      // Calorie filter
      if (calorieFilter !== "any") {
        const calories = recipe.nutrition?.calories;
        if (!calories) return false;
        switch (calorieFilter) {
          case "under400":
            if (calories >= 400) return false;
            break;
          case "under600":
            if (calories >= 600) return false;
            break;
          case "under800":
            if (calories >= 800) return false;
            break;
        }
      }

      // Protein amount filter
      if (proteinFilter !== "any") {
        const protein = recipe.nutrition?.protein_g;
        if (!protein) return false;
        switch (proteinFilter) {
          case "20plus":
            if (protein < 20) return false;
            break;
          case "30plus":
            if (protein < 30) return false;
            break;
          case "40plus":
            if (protein < 40) return false;
            break;
        }
      }

      // Nutrition badge filters (any match passes)
      if (nutritionBadges.size > 0) {
        const badgeArray = Array.from(nutritionBadges);
        const matchesAnyBadge = badgeArray.some((badge) => matchesNutritionBadge(recipe, badge));
        if (!matchesAnyBadge) return false;
      }

      return true;
    });

    // Sort recipes
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "most-cooked":
          const countA = recipeCookCounts[a.id] || 0;
          const countB = recipeCookCounts[b.id] || 0;
          return countB - countA;
        case "highest-rated":
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [initialRecipes, search, typeFilter, proteinTypeFilter, tagFilter, favoritesOnly, sortBy, recipeCookCounts, calorieFilter, proteinFilter, nutritionBadges, matchesNutritionBadge]);

  const hasActiveFilters =
    typeFilter !== "all" ||
    proteinTypeFilter !== "all" ||
    tagFilter !== "all" ||
    favoritesOnly ||
    calorieFilter !== "any" ||
    proteinFilter !== "any" ||
    nutritionBadges.size > 0;

  const hasNutritionFilters =
    calorieFilter !== "any" ||
    proteinFilter !== "any" ||
    nutritionBadges.size > 0;

  const clearFilters = () => {
    setTypeFilter("all");
    setProteinTypeFilter("all");
    setTagFilter("all");
    setFavoritesOnly(false);
    setCalorieFilter("any");
    setProteinFilter("any");
    setNutritionBadges(new Set());
  };

  const toggleNutritionBadge = (badge: NutritionBadgeFilter) => {
    setNutritionBadges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(badge)) {
        newSet.delete(badge);
      } else {
        newSet.add(badge);
      }
      return newSet;
    });
  };

  const nutritionBadgeLabels: Record<NutritionBadgeFilter, string> = {
    light: "Light (<400 cal)",
    high_protein: "High Protein (30g+)",
    low_carb: "Low Carb (<20g)",
    fiber_rich: "Fiber Rich (8g+)",
    heart_healthy: "Heart Healthy",
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes, ingredients, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px] h-11">
            <ArrowDownUp className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="most-cooked">Most Cooked</SelectItem>
            <SelectItem value="highest-rated">Highest Rated</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={hasNutritionFilters ? "secondary" : "outline"}
              className="relative h-11 w-full sm:w-auto"
            >
              <Apple className="h-4 w-4 mr-2" />
              <span>Nutrition</span>
              {hasNutritionFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Nutrition Filters</h4>

              {/* Calorie Filter */}
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Calories</label>
                <Select value={calorieFilter} onValueChange={(v) => setCalorieFilter(v as CalorieFilter)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="under400">Under 400</SelectItem>
                    <SelectItem value="under600">Under 600</SelectItem>
                    <SelectItem value="under800">Under 800</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Protein Filter */}
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Protein</label>
                <Select value={proteinFilter} onValueChange={(v) => setProteinFilter(v as ProteinFilter)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="20plus">20g+</SelectItem>
                    <SelectItem value="30plus">30g+</SelectItem>
                    <SelectItem value="40plus">40g+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Badge Filters */}
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Quick Filters</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(nutritionBadgeLabels) as NutritionBadgeFilter[]).map((badge) => (
                    <Button
                      key={badge}
                      variant={nutritionBadges.has(badge) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNutritionBadge(badge)}
                      className="text-xs"
                    >
                      {nutritionBadgeLabels[badge]}
                    </Button>
                  ))}
                </div>
              </div>

              {hasNutritionFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCalorieFilter("any");
                    setProteinFilter("any");
                    setNutritionBadges(new Set());
                  }}
                  className="w-full text-xs"
                >
                  Clear nutrition filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="relative h-11 w-full sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4 sm:mr-0 mr-2" />
          <span className="sm:hidden">Filters</span>
          {hasActiveFilters && !hasNutritionFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
          )}
        </Button>
        <Button
          variant="outline"
          className="h-11 w-full sm:w-auto"
          onClick={onDiscoverClick}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>Discover</span>
        </Button>
        <Link href="/app/recipes/new">
          <Button className="h-11 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Recipe</span>
          </Button>
        </Link>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as RecipeType | "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {recipeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {proteins.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Protein Type</label>
                <Select value={proteinTypeFilter} onValueChange={setProteinTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {proteins.map((protein) => (
                      <SelectItem key={protein} value={protein}>
                        {protein}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tags.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tag</label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <Checkbox
                  checked={favoritesOnly}
                  onCheckedChange={(checked) => setFavoritesOnly(checked === true)}
                />
                <span className="text-sm">Favorites only</span>
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter}
                  <button onClick={() => setTypeFilter("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {proteinTypeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {proteinTypeFilter}
                  <button onClick={() => setProteinTypeFilter("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {tagFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {tagFilter}
                  <button onClick={() => setTagFilter("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {favoritesOnly && (
                <Badge variant="secondary" className="gap-1">
                  Favorites
                  <button onClick={() => setFavoritesOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {calorieFilter !== "any" && (
                <Badge variant="secondary" className="gap-1">
                  {calorieFilter === "under400" ? "<400 cal" : calorieFilter === "under600" ? "<600 cal" : "<800 cal"}
                  <button onClick={() => setCalorieFilter("any")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {proteinFilter !== "any" && (
                <Badge variant="secondary" className="gap-1">
                  {proteinFilter === "20plus" ? "20g+ protein" : proteinFilter === "30plus" ? "30g+ protein" : "40g+ protein"}
                  <button onClick={() => setProteinFilter("any")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {Array.from(nutritionBadges).map((badge) => (
                <Badge key={badge} variant="secondary" className="gap-1">
                  {nutritionBadgeLabels[badge]}
                  <button onClick={() => toggleNutritionBadge(badge)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
            {initialRecipes.length !== filteredRecipes.length && (
              <span className="ml-1">of {initialRecipes.length}</span>
            )}
          </p>
        </div>

        {/* Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-muted-foreground text-lg">
              {initialRecipes.length === 0
                ? "No recipes yet. Time to add your first culinary masterpiece!"
                : "No recipes match your filters. Try loosening up a bit."}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <TooltipProvider>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  userAllergenAlerts={userAllergenAlerts}
                  customDietaryRestrictions={customDietaryRestrictions}
                  animationIndex={index}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
