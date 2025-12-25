"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { RecipeCard } from "./recipe-card";
import { BulkDietTagger } from "./bulk-diet-tagger";
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
import { Search, X, SlidersHorizontal, Plus, ArrowDownUp, Sparkles, Star, Leaf, Wheat, Flame, Mountain, Ship, Milk, TrendingDown, Tags, PanelLeftClose, PanelLeft, ChevronDown } from "lucide-react";
import { StarRatingFilter } from "@/components/ui/star-rating-filter";
import { useRecipeFilters } from "@/hooks/use-recipe-filters";
import type { RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren } from "@/types/folder";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed, FolderOpen, SearchX } from "lucide-react";

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
  // Total recipe count for header display
  totalRecipes?: number;
}

const recipeTypes: RecipeType[] = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
];

const dietTypes = [
  { label: "Vegan", icon: Leaf },
  { label: "Vegetarian", icon: Leaf },
  { label: "Keto", icon: Flame },
  { label: "Paleo", icon: Mountain },
  { label: "Mediterranean", icon: Ship },
  { label: "Gluten-Free", icon: Wheat },
  { label: "Dairy-Free", icon: Milk },
  { label: "Low-Carb", icon: TrendingDown },
];

type SortOption = "recent" | "most-cooked" | "highest-rated" | "alphabetical";

// Pagination: show 20 recipes initially, load more in batches
const RECIPES_PER_PAGE = 20;

export function RecipeGrid({ recipes: initialRecipes, recipeCookCounts = {}, userAllergenAlerts = [], customDietaryRestrictions = [], customBadges = [], onDiscoverClick, folderRecipeIds = null, folders = [], onAddToFolder, totalRecipes }: RecipeGridProps) {
  // Use persistent filter state (saved to localStorage)
  const {
    search,
    typeFilter,
    proteinTypeFilter,
    tagFilter,
    dietFilter,
    favoritesOnly,
    ratingFilter,
    minRating,
    ratedFilter,
    showFilters,
    sortBy,
    hasActiveFilters,
    isHydrated,
    setFilter,
    clearFilters,
  } = useRecipeFilters();

  // Bulk diet tagger dialog state
  const [showBulkTagger, setShowBulkTagger] = useState(false);

  // Desktop sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination state: how many recipes to show
  const [visibleCount, setVisibleCount] = useState(RECIPES_PER_PAGE);

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
  // Don't apply localStorage filters until hydration is complete to prevent flash
  const filteredRecipes = useMemo(() => {
    const filtered = initialRecipes.filter((recipe) => {
      // Folder filter (applied first if set) - always apply regardless of hydration
      if (folderRecipeIds !== null) {
        if (!folderRecipeIds.includes(recipe.id)) {
          return false;
        }
      }

      // Only apply localStorage-based filters after hydration
      if (!isHydrated) {
        return true;
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

      // Diet filter (searches tags for matching diet type)
      if (dietFilter !== "all") {
        const hasDietTag = recipe.tags.some(
          (tag) => tag.toLowerCase() === dietFilter.toLowerCase()
        );
        if (!hasDietTag) return false;
      }

      // Favorites filter
      if (favoritesOnly && !recipe.is_favorite) {
        return false;
      }

      // Rating filter - legacy checkbox style
      if (ratingFilter.length > 0) {
        if (recipe.rating === null || !ratingFilter.includes(recipe.rating)) {
          return false;
        }
      }

      // Minimum rating filter - new interactive style
      if (minRating !== null) {
        if (recipe.rating === null || recipe.rating < minRating) {
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
  }, [initialRecipes, search, typeFilter, proteinTypeFilter, tagFilter, dietFilter, favoritesOnly, ratingFilter, minRating, ratedFilter, sortBy, recipeCookCounts, folderRecipeIds, isHydrated]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(RECIPES_PER_PAGE);
  }, [search, typeFilter, proteinTypeFilter, tagFilter, dietFilter, favoritesOnly, ratingFilter, minRating, ratedFilter, sortBy, folderRecipeIds]);

  // Get recipes to display (paginated)
  const visibleRecipes = useMemo(() => {
    return filteredRecipes.slice(0, visibleCount);
  }, [filteredRecipes, visibleCount]);

  const hasMoreRecipes = filteredRecipes.length > visibleCount;
  const remainingCount = filteredRecipes.length - visibleCount;

  // Count active filters for badge
  const activeFilterCount = [
    typeFilter !== "all",
    proteinTypeFilter !== "all",
    tagFilter !== "all",
    dietFilter !== "all",
    favoritesOnly,
    ratingFilter.length > 0,
    minRating !== null,
    ratedFilter !== "all",
  ].filter(Boolean).length;

  // Sort option labels
  const sortLabels: Record<SortOption, string> = {
    recent: "Recent",
    "most-cooked": "Most Cooked",
    "highest-rated": "Top Rated",
    alphabetical: "A-Z",
  };

  // Filter panel content - used in both sidebar and inline modes
  const filterContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={typeFilter}
            onValueChange={(value) => setFilter("typeFilter", value as RecipeType | "all")}
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
          <div className="flex flex-col">
            <label className="text-sm font-medium">Protein</label>
            <Select value={proteinTypeFilter} onValueChange={(value) => setFilter("proteinTypeFilter", value)}>
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
          <div className="flex flex-col">
            <label className="text-sm font-medium">Tag</label>
            <Select value={tagFilter} onValueChange={(value) => setFilter("tagFilter", value)}>
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
              onCheckedChange={(checked) => setFilter("favoritesOnly", checked === true)}
            />
            <span className="text-sm">Favorites only</span>
          </label>
        </div>
      </div>

      {/* Diet Type Filters */}
      <div className="flex flex-col pt-3 border-t">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Diet Types</label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowBulkTagger(true)}
          >
            <Tags className="h-3 w-3" />
            Bulk Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("dietFilter", "all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
              dietFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-input hover:bg-accent"
            }`}
          >
            All Diets
          </button>
          {dietTypes.map((diet) => {
            const Icon = diet.icon;
            return (
              <button
                type="button"
                key={diet.label}
                onClick={() => setFilter("dietFilter", diet.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                  dietFilter === diet.label
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-input hover:bg-accent"
                }`}
              >
                <Icon className="size-4" />
                {diet.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Filters */}
      <div className="flex flex-wrap gap-4 pt-3 border-t">
        <StarRatingFilter
          value={minRating}
          onChange={(rating) => setFilter("minRating", rating)}
          label="Minimum Rating"
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium">Show</label>
          <Select value={ratedFilter} onValueChange={(value) => setFilter("ratedFilter", value as "all" | "rated" | "unrated")}>
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
        <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
          <span className="text-sm text-muted-foreground">Active:</span>
          {typeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {typeFilter}
              <button type="button" onClick={() => setFilter("typeFilter", "all")} aria-label="Remove type filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {proteinTypeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {proteinTypeFilter}
              <button type="button" onClick={() => setFilter("proteinTypeFilter", "all")} aria-label="Remove protein filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {tagFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {tagFilter}
              <button type="button" onClick={() => setFilter("tagFilter", "all")} aria-label="Remove tag filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dietFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {dietFilter}
              <button type="button" onClick={() => setFilter("dietFilter", "all")} aria-label="Remove diet filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {favoritesOnly && (
            <Badge variant="secondary" className="gap-1">
              Favorites
              <button type="button" onClick={() => setFilter("favoritesOnly", false)} aria-label="Remove favorites filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minRating !== null && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {minRating}+ stars
              <button type="button" onClick={() => setFilter("minRating", null)} aria-label="Remove rating filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {ratedFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {ratedFilter === "rated" ? "Rated" : "Unrated"}
              <button type="button" onClick={() => setFilter("ratedFilter", "all")} aria-label="Remove rated filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilters(true)}
            className="ml-auto text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row lg:gap-6">
      {/* Desktop Sidebar - visible on lg+ */}
      <aside className={`hidden lg:block transition-all duration-300 ${sidebarCollapsed ? "w-12" : "w-72"} shrink-0`}>
        <div className="sticky top-4">
          {sidebarCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-10"
              title="Expand filters"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8"
                  title="Collapse filters"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              {filterContent}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Row 1: Title + Search + Add Recipe */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-lg font-semibold">Recipes</h1>
            {totalRecipes !== undefined && (
              <span className="text-muted-foreground">· {totalRecipes} recipes</span>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipes, ingredients, tags..."
              value={search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="pl-10 h-11"
            />
            {search && (
              <button
                type="button"
                onClick={() => setFilter("search", "")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Link href="/app/recipes/new">
            <Button className="h-11 px-3 sm:px-4">
              <Plus className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Recipe</span>
            </Button>
          </Link>
        </div>

        {/* Row 2: Pills + Recipe Count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Sort Pill */}
            <Select value={sortBy} onValueChange={(value) => setFilter("sortBy", value as SortOption)}>
              <SelectTrigger className="h-9 px-3 rounded-full border-input bg-background hover:bg-accent transition-colors w-auto gap-1.5">
                <ArrowDownUp className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline text-sm">{sortLabels[sortBy]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="most-cooked">Most Cooked</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Pill - only on mobile/tablet */}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setFilter("showFilters", !showFilters)}
              className="h-9 px-3 rounded-full relative lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Discover Pill */}
            <Button
              variant="outline"
              className="h-9 px-3 rounded-full"
              onClick={onDiscoverClick}
            >
              <Sparkles className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline text-sm">Discover</span>
            </Button>
          </div>

          {/* Recipe Count */}
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>

      {/* Mobile: Active Filters Row - only on mobile/tablet when filters panel is closed */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-2 flex-wrap lg:hidden">
            <span className="text-xs text-muted-foreground font-medium">Active:</span>
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {typeFilter}
                <button type="button" onClick={() => setFilter("typeFilter", "all")} aria-label="Remove type filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {proteinTypeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {proteinTypeFilter}
                <button type="button" onClick={() => setFilter("proteinTypeFilter", "all")} aria-label="Remove protein filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {dietFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {dietFilter}
                <button type="button" onClick={() => setFilter("dietFilter", "all")} aria-label="Remove diet filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {favoritesOnly && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Favorites
                <button type="button" onClick={() => setFilter("favoritesOnly", false)} aria-label="Remove favorites filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minRating !== null && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {minRating}+
                <button type="button" onClick={() => setFilter("minRating", null)} aria-label="Remove rating filter">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilters(true)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Mobile: Expanded Filters Panel - only on mobile/tablet */}
        {showFilters && (
          <div className="lg:hidden p-4 border rounded-lg bg-muted/30">
            {filterContent}
          </div>
        )}

        {/* Recipe Grid */}
      <div className="flex flex-col">
        {filteredRecipes.length === 0 ? (
          // Empty state varies by context
          initialRecipes.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="h-12 w-12 text-muted-foreground" />}
              title="No recipes yet"
              description="Time to add your first culinary masterpiece!"
              action={
                <Link href="/app/recipes/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </Link>
              }
            />
          ) : folderRecipeIds !== null && folderRecipeIds.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
              title="Folder is empty"
              description="This folder doesn't contain any recipes yet."
              size="sm"
            />
          ) : (
            <EmptyState
              icon={<SearchX className="h-12 w-12 text-muted-foreground" />}
              title="No matches"
              description="No recipes match your filters. Try loosening up a bit."
              action={
                <Button variant="outline" onClick={() => clearFilters(true)}>
                  Clear all filters
                </Button>
              }
              size="sm"
            />
          )
        ) : (
          <>
            <TooltipProvider>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {visibleRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    userAllergenAlerts={userAllergenAlerts}
                    customDietaryRestrictions={customDietaryRestrictions}
                    customBadges={customBadges}
                    animationIndex={index}
                    folders={folders}
                    onAddToFolder={onAddToFolder}
                    searchTerm={search}
                  />
                ))}
              </div>
            </TooltipProvider>
            {/* Load More Button */}
            {hasMoreRecipes && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + RECIPES_PER_PAGE)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load more ({remainingCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Bulk Diet Tagger Dialog */}
      <BulkDietTagger
        open={showBulkTagger}
        onOpenChange={setShowBulkTagger}
        recipes={initialRecipes}
      />
    </div>
  );
}
