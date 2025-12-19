"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicRecipeCard } from "./public-recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Loader2, ChefHat } from "lucide-react";
import { getPublicRecipes, getPublicCategories, getPublicRecipeTypes } from "@/app/actions/community";
import { useDebounce } from "@/lib/use-debounce";
import type { PublicRecipe } from "@/types/social";
import { ReportRecipeDialog } from "./report-recipe-dialog";

interface CommunityRecipeGridProps {
  initialRecipes?: PublicRecipe[];
  isAuthenticated?: boolean;
}

export function CommunityRecipeGrid({
  initialRecipes = [],
  isAuthenticated = false,
}: CommunityRecipeGridProps) {
  const [recipes, setRecipes] = useState<PublicRecipe[]>(initialRecipes);
  const [isLoading, setIsLoading] = useState(initialRecipes.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialRecipes.length);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [recipeTypes, setRecipeTypes] = useState<string[]>([]);

  // Report dialog
  const [reportRecipeId, setReportRecipeId] = useState<string | null>(null);

  const LIMIT = 20;

  // Load filter options
  useEffect(() => {
    async function loadFilters() {
      const [categoriesResult, typesResult] = await Promise.all([
        getPublicCategories(),
        getPublicRecipeTypes(),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (typesResult.data) setRecipeTypes(typesResult.data);
    }

    loadFilters();
  }, []);

  // Load recipes when filters change
  const loadRecipes = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
    }

    const result = await getPublicRecipes({
      limit: LIMIT,
      offset: reset ? 0 : offset,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      recipeType: selectedType || undefined,
    });

    if (result.data) {
      if (reset) {
        setRecipes(result.data);
        setOffset(result.data.length);
      } else {
        setRecipes((prev) => [...prev, ...result.data!]);
        setOffset((prev) => prev + result.data!.length);
      }
      setHasMore(result.data.length === LIMIT);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, [debouncedSearch, selectedCategory, selectedType, offset]);

  // Reload when filters change
  useEffect(() => {
    loadRecipes(true);
  }, [debouncedSearch, selectedCategory, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadRecipes(false);
  };

  const handleReport = (recipeId: string) => {
    if (!isAuthenticated) {
      return;
    }
    setReportRecipeId(recipeId);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedType("");
  };

  const hasFilters = searchQuery || selectedCategory || selectedType;

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType || "all"} onValueChange={(val) => setSelectedType(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
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

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-4">
            {hasFilters
              ? "Try adjusting your filters"
              : "Be the first to share a recipe with the community!"}
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <PublicRecipeCard
                key={recipe.id}
                recipe={recipe}
                onReport={isAuthenticated ? handleReport : undefined}
                isAuthenticated={isAuthenticated}
                animationIndex={index}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Report Dialog */}
      <ReportRecipeDialog
        open={!!reportRecipeId}
        onOpenChange={(open) => !open && setReportRecipeId(null)}
        recipeId={reportRecipeId || ""}
      />
    </div>
  );
}

function RecipeCardSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden animate-pulse">
      <Skeleton className="w-full h-48" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
