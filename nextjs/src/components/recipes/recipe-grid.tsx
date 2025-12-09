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
import { Search, X, SlidersHorizontal, Plus, ArrowDownUp } from "lucide-react";
import type { RecipeWithFavorite, RecipeType } from "@/types/recipe";

interface RecipeGridProps {
  recipes: RecipeWithFavorite[];
  recipeCookCounts?: Record<string, number>; // recipe_id -> count
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
}

const recipeTypes: RecipeType[] = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
];

type SortOption = "recent" | "most-cooked" | "highest-rated" | "alphabetical";

export function RecipeGrid({ recipes: initialRecipes, recipeCookCounts = {}, userAllergenAlerts = [], customDietaryRestrictions = [] }: RecipeGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipeType | "all">("all");
  const [proteinFilter, setProteinFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

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

      // Protein filter
      if (proteinFilter !== "all" && recipe.protein_type !== proteinFilter) {
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
  }, [initialRecipes, search, typeFilter, proteinFilter, tagFilter, favoritesOnly, sortBy, recipeCookCounts]);

  const hasActiveFilters =
    typeFilter !== "all" ||
    proteinFilter !== "all" ||
    tagFilter !== "all" ||
    favoritesOnly;

  const clearFilters = () => {
    setTypeFilter("all");
    setProteinFilter("all");
    setTagFilter("all");
    setFavoritesOnly(false);
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
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="relative h-11 w-full sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4 sm:mr-0 mr-2" />
          <span className="sm:hidden">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
          )}
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
                <label className="text-sm font-medium">Protein</label>
                <Select value={proteinFilter} onValueChange={setProteinFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Proteins</SelectItem>
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
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter}
                  <button onClick={() => setTypeFilter("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {proteinFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {proteinFilter}
                  <button onClick={() => setProteinFilter("all")}>
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
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} userAllergenAlerts={userAllergenAlerts} customDietaryRestrictions={customDietaryRestrictions} />
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
