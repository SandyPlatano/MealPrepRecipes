"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useDemo } from "@/lib/demo/demo-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  ChefHat,
  UtensilsCrossed,
  Cookie,
  Coffee,
  IceCream,
  Croissant,
  Salad,
  Flame,
  Plus,
  Minus,
  ExternalLink,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import type { RecipeType } from "@/types/recipe";
import { scaleIngredients } from "@/lib/ingredient-scaler";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="h-5 w-5" />;
    case "Breakfast":
      return <Coffee className="h-5 w-5" />;
    case "Dessert":
      return <IceCream className="h-5 w-5" />;
    case "Snack":
      return <Croissant className="h-5 w-5" />;
    case "Side Dish":
      return <Salad className="h-5 w-5" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="h-5 w-5" />;
  }
}

export default function DemoRecipePage() {
  const params = useParams();
  const { recipes, toggleFavorite, addToMealPlan } = useDemo();
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const recipeId = params.id as string;
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    notFound();
  }

  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite ?? false);

  const handleToggleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    toggleFavorite(recipe.id);
    toast.success(newState ? "Added to favorites" : "Removed from favorites");
  };

  const handleAddToPlan = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
    const randomDay = days[Math.floor(Math.random() * days.length)];
    addToMealPlan(recipe.id, randomDay, "dinner");
    toast.success(`Added to ${randomDay}!`);
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  // Scale ingredients
  const scaledIngredients =
    recipe.base_servings && servingMultiplier !== 1
      ? scaleIngredients(recipe.ingredients, recipe.base_servings, servingMultiplier)
      : recipe.ingredients;

  const currentServings = recipe.base_servings
    ? recipe.base_servings * servingMultiplier
    : recipe.servings;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/demo/recipes">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="relative">
        {recipe.image_url && (
          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        )}

        <div className={recipe.image_url ? "absolute bottom-0 left-0 right-0 p-6" : ""}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1">
                  {getRecipeIcon(recipe.recipe_type)}
                  {recipe.recipe_type}
                </Badge>
                {recipe.category && (
                  <Badge variant="outline">{recipe.category}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-mono font-bold">
                {recipe.title}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-red-500" : ""}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recipe.prep_time && (
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">Prep</p>
              <p className="font-semibold">{recipe.prep_time}</p>
            </CardContent>
          </Card>
        )}
        {recipe.cook_time && (
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-sm text-muted-foreground">Cook</p>
              <p className="font-semibold">{recipe.cook_time}</p>
            </CardContent>
          </Card>
        )}
        {currentServings && (
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">Servings</p>
              <p className="font-semibold">{currentServings}</p>
            </CardContent>
          </Card>
        )}
        {recipe.nutrition && (
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-semibold">{recipe.nutrition.calories}/serving</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/demo/recipes/${recipe.id}/cook`} className="flex-1 min-w-[200px]">
          <Button className="w-full gap-2" size="lg">
            <Play className="h-5 w-5" />
            Start Cooking
          </Button>
        </Link>
        <Button variant="outline" size="lg" onClick={handleAddToPlan} className="gap-2">
          <ChefHat className="h-5 w-5" />
          Add to Plan
        </Button>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 prose prose-sm dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {instruction}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ingredients */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Ingredients</CardTitle>
                {recipe.base_servings && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {servingMultiplier}x
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {scaledIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={checkedIngredients.has(index)}
                      onCheckedChange={() => toggleIngredient(index)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className={`cursor-pointer flex-1 ${
                        checkedIngredients.has(index)
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {ingredient}
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Nutrition */}
          {recipe.nutrition && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Nutrition (per serving)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Calories</p>
                    <p className="font-semibold">{recipe.nutrition.calories}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Protein</p>
                    <p className="font-semibold">{recipe.nutrition.protein_g}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{recipe.nutrition.carbs_g}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fat</p>
                    <p className="font-semibold">{recipe.nutrition.fat_g}g</p>
                  </div>
                  {recipe.nutrition.fiber_g && (
                    <div>
                      <p className="text-muted-foreground">Fiber</p>
                      <p className="font-semibold">{recipe.nutrition.fiber_g}g</p>
                    </div>
                  )}
                  {recipe.nutrition.sugar_g && (
                    <div>
                      <p className="text-muted-foreground">Sugar</p>
                      <p className="font-semibold">{recipe.nutrition.sugar_g}g</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source */}
          {recipe.source_url && (
            <Card>
              <CardContent className="p-4">
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Recipe
                </a>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Notes */}
      {recipe.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{recipe.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg">Like this recipe?</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Sign up to save it to your collection and access cook mode anytime
          </p>
          <Link href="/signup">
            <Button>Create Free Account</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
