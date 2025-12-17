"use client";

import { useState, useMemo } from "react";
import { useDemo } from "@/lib/demo/demo-context";
import { DemoRecipeCard } from "@/components/demo/demo-recipe-card";
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
import {
  Search,
  Filter,
  Sparkles,
  Heart,
  SortAsc,
  ChefHat,
} from "lucide-react";
import Link from "next/link";
import type { RecipeType } from "@/types/recipe";

type SortOption = "title" | "newest" | "cook_time";
type FilterOption = "all" | "favorites" | RecipeType;

export default function DemoRecipesPage() {
  const { recipes } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Get unique recipe types for filter
  const recipeTypes = useMemo(() => {
    const types = new Set(recipes.map((r) => r.recipe_type));
    return Array.from(types).sort();
  }, [recipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.ingredients.some((i) => i.toLowerCase().includes(query)) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Apply category/favorites filter
    if (filterBy === "favorites") {
      result = result.filter((r) => r.is_favorite);
    } else if (filterBy !== "all") {
      result = result.filter((r) => r.recipe_type === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "cook_time":
        result.sort((a, b) => {
          const aTime = parseInt(a.cook_time || "999") || 999;
          const bTime = parseInt(b.cook_time || "999") || 999;
          return aTime - bTime;
        });
        break;
    }

    return result;
  }, [recipes, searchQuery, sortBy, filterBy]);

  const favoriteCount = recipes.filter((r) => r.is_favorite).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold">Recipes</h1>
          <p className="text-muted-foreground mt-1">
            {recipes.length} sample recipes to explore
          </p>
        </div>
        <Link href="/demo/recipes?import=true">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Import
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter */}
        <Select
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as FilterOption)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipes</SelectItem>
            <SelectItem value="favorites">
              <span className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                Favorites ({favoriteCount})
              </span>
            </SelectItem>
            {recipeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Name (A-Z)</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="cook_time">Quick to Cook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filterBy === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterBy("all")}
        >
          All ({recipes.length})
        </Badge>
        <Badge
          variant={filterBy === "favorites" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterBy("favorites")}
        >
          <Heart className="h-3 w-3 mr-1" />
          Favorites ({favoriteCount})
        </Badge>
        {recipeTypes.map((type) => (
          <Badge
            key={type}
            variant={filterBy === type ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterBy(type as FilterOption)}
          >
            {type} ({recipes.filter((r) => r.recipe_type === type).length})
          </Badge>
        ))}
      </div>

      {/* Results */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No recipes found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setFilterBy("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe, index) => (
            <DemoRecipeCard
              key={recipe.id}
              recipe={recipe}
              animationIndex={index}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-lg">Want to save your own recipes?</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Sign up free and start building your personal recipe collection
        </p>
        <Link href="/signup">
          <Button>Get Started Free</Button>
        </Link>
      </div>
    </div>
  );
}
