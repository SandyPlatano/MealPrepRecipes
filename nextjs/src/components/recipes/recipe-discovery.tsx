"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shuffle, Clock, Star, ChefHat, Sparkles, Search, ArrowLeft } from "lucide-react";
import type { RecipeWithFavorite } from "@/types/recipe";
import { RecipeCard } from "./recipe-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";

interface RecipeDiscoveryProps {
  recipes: RecipeWithFavorite[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[]; // IDs of recipes cooked in last 30 days
}

type DiscoveryMode = "surprise" | "not-recent" | "highly-rated" | "quick" | "ingredient";

export function RecipeDiscovery({ recipes, recentlyCookedIds }: RecipeDiscoveryProps) {
  const [mode, setMode] = useState<DiscoveryMode | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [discovered, setDiscovered] = useState<RecipeWithFavorite[]>([]);

  // Filter helpers
  const notRecentlyCooked = useMemo(() => {
    return recipes.filter((recipe) => !recentlyCookedIds.includes(recipe.id));
  }, [recipes, recentlyCookedIds]);

  const highlyRated = useMemo(() => {
    return recipes
      .filter((recipe) => recipe.rating && recipe.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [recipes]);

  const quickMeals = useMemo(() => {
    return recipes.filter((recipe) => {
      if (!recipe.prep_time && !recipe.cook_time) return false;
      
      // Try to parse times
      const prepMatch = recipe.prep_time?.match(/(\d+)/);
      const cookMatch = recipe.cook_time?.match(/(\d+)/);
      
      const prepMins = prepMatch ? parseInt(prepMatch[1]) : 0;
      const cookMins = cookMatch ? parseInt(cookMatch[1]) : 0;
      
      return (prepMins + cookMins) <= 30;
    });
  }, [recipes]);

  const handleSurprise = () => {
    if (recipes.length === 0) return;
    const random = recipes[Math.floor(Math.random() * recipes.length)];
    setDiscovered([random]);
    setMode("surprise");
  };

  const handleNotRecent = () => {
    setDiscovered(notRecentlyCooked.slice(0, 6));
    setMode("not-recent");
  };

  const handleHighlyRated = () => {
    setDiscovered(highlyRated.slice(0, 6));
    setMode("highly-rated");
  };

  const handleQuickMeals = () => {
    setDiscovered(quickMeals.slice(0, 6));
    setMode("quick");
  };

  const handleIngredientSearch = () => {
    if (!ingredientSearch.trim()) return;
    
    const searchLower = ingredientSearch.toLowerCase();
    const matches = recipes.filter((recipe) => 
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchLower)) ||
      recipe.protein_type?.toLowerCase().includes(searchLower) ||
      recipe.category?.toLowerCase().includes(searchLower)
    );
    
    setDiscovered(matches);
    setMode("ingredient");
  };

  const handleReset = () => {
    setMode(null);
    setDiscovered([]);
    setIngredientSearch("");
  };

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Add some recipes first, then come back to discover what to make!
          </p>
          <Link href="/app/recipes/new">
            <Button className="mt-4">Add Your First Recipe</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (mode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-mono font-bold">
              {mode === "surprise" && "Surprise Pick!"}
              {mode === "not-recent" && "Haven't Made These Lately"}
              {mode === "highly-rated" && "Your Top Rated"}
              {mode === "quick" && "Quick & Easy"}
              {mode === "ingredient" && `Recipes with "${ingredientSearch}"`}
            </h2>
            <p className="text-muted-foreground mt-1">
              {discovered.length > 0 
                ? `${discovered.length} ${discovered.length === 1 ? "recipe" : "recipes"} found`
                : "No recipes found"}
            </p>
          </div>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {discovered.length > 0 ? (
          <TooltipProvider>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {discovered.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} animationIndex={index} />
              ))}
            </div>
          </TooltipProvider>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No recipes match your criteria. Try something else!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-mono font-bold">What Should We Make?</h2>
        <p className="text-muted-foreground">
          Not sure what to cook? Let us help you decide.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Surprise Me */}
        <Card 
          className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
          onClick={handleSurprise}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Shuffle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Surprise Me!</CardTitle>
                <CardDescription>Pick something random</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Feeling adventurous? We&apos;ll pick a random recipe from your collection.
            </p>
          </CardContent>
        </Card>

        {/* Not Made Recently */}
        {notRecentlyCooked.length > 0 && (
          <Card 
            className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
            onClick={handleNotRecent}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Not Made Recently</CardTitle>
                  <CardDescription>30+ days ago</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recipes you haven&apos;t cooked in the last 30 days.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Highly Rated */}
        {highlyRated.length > 0 && (
          <Card 
            className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
            onClick={handleHighlyRated}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Favorites</CardTitle>
                  <CardDescription>4+ stars</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your top-rated recipes. Proven winners!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Meals */}
        {quickMeals.length > 0 && (
          <Card 
            className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
            onClick={handleQuickMeals}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quick & Easy</CardTitle>
                  <CardDescription>Under 30 min</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fast meals when you&apos;re short on time.
              </p>
            </CardContent>
          </Card>
        )}

        {/* By Ingredient */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">By Ingredient</CardTitle>
                <CardDescription>Search by what you have</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., chicken, pasta, tomato"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleIngredientSearch();
                  }
                }}
              />
              <Button onClick={handleIngredientSearch} disabled={!ingredientSearch.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

