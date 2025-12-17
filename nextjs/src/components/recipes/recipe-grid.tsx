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
import { Search, X, SlidersHorizontal, Plus, ArrowDownUp, Sparkles, Star } from "lucide-react";
import type { RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren } from "@/types/folder";

interface RecipeGridProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts?: Record<string, number>; // recipe_id -> count
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  onDiscoverClick?: () => void;
  // Folder filtering
  folderRecipeIds?: string[] | null; // null = no folder filter, [] = show none, [...ids] = show these
  folders?: FolderWithChildren[];
  onAddToFolder?: (recipeId: string) => void;
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

export function RecipeGrid({ recipes: initialRecipes, recipeCookCounts = {}, userAllergenAlerts = [], customDietaryRestrictions = [], customBadges = [], onDiscoverClick, folderRecipeIds = null, folders = [], onAddToFolder }: RecipeGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipeType | "all">("all");
  const [proteinTypeFilter, setProteinTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [ratedFilter, setRatedFilter] = useState<"all" | "rated" | "unrated">("all");
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
      // Folder filter (applied first if set)
      if (folderRecipeIds !== null) {
        if (!folderRecipeIds.includes(recipe.id)) {
          return false;
        }
      }

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

      // Protein type filter
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

      // Rating filter (star level checkboxes)
      if (ratingFilter.length > 0) {
        if (recipe.rating === null || !ratingFilter.includes(recipe.rating)) {
          return false;
        }
      }

      // Rated/Unrated filter
      if (ratedFilter === "rated" && recipe.rating === null) {
        return false;
      }
      if (ratedFilter === "unrated" && recipe.rating !== null) {
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
  }, [initialRecipes, search, typeFilter, proteinTypeFilter, tagFilter, favoritesOnly, ratingFilter, ratedFilter, sortBy, recipeCookCounts, folderRecipeIds]);

  const hasActiveFilters =
    typeFilter !== "all" ||
    proteinTypeFilter !== "all" ||
    tagFilter !== "all" ||
    favoritesOnly ||
    ratingFilter.length > 0 ||
    ratedFilter !== "all";

  const clearFilters = () => {
    setTypeFilter("all");
    setProteinTypeFilter("all");
    setTagFilter("all");
    setFavoritesOnly(false);
    setRatingFilter([]);
    setRatedFilter("all");
  };

  const toggleRatingFilter = (rating: number) => {
    setRatingFilter((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
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
                <label className="text-sm font-medium">Protein</label>
                <Select value={proteinTypeFilter} onValueChange={setProteinTypeFilter}>
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

          {/* Rating Filters */}
          <div className="flex flex-wrap gap-4 pt-3 border-t">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => toggleRatingFilter(rating)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-sm transition-colors ${
                      ratingFilter.includes(rating)
                        ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        ratingFilter.includes(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>{rating}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Show</label>
              <Select value={ratedFilter} onValueChange={(value) => setRatedFilter(value as "all" | "rated" | "unrated")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipes</SelectItem>
                  <SelectItem value="rated">Rated Only</SelectItem>
                  <SelectItem value="unrated">Unrated Only</SelectItem>
                </SelectContent>
              </Select>
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
              {ratingFilter.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {ratingFilter.sort((a, b) => b - a).join(", ")}
                  <button onClick={() => setRatingFilter([])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {ratedFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {ratedFilter === "rated" ? "Rated" : "Unrated"}
                  <button onClick={() => setRatedFilter("all")}>
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
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  userAllergenAlerts={userAllergenAlerts}
                  customDietaryRestrictions={customDietaryRestrictions}
                  customBadges={customBadges}
                  animationIndex={index}
                  folders={folders}
                  onAddToFolder={onAddToFolder}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
