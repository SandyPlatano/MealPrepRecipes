"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChefHat, Clock, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PrepSessionForm } from "@/components/meal-prep/prep-session-form";
import { createPrepSession, addRecipeToPrepSession } from "@/app/actions/meal-prep";
import type { Recipe } from "@/types/recipe";
import type { PrepSessionFormData, PrepSessionRecipeFormData } from "@/types/meal-prep";
import Image from "next/image";

export interface NewPrepSessionClientProps {
  recipes: Recipe[];
}

interface SelectedRecipe {
  recipeId: string;
  servings: number;
}

export function NewPrepSessionClient({ recipes }: NewPrepSessionClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRecipes, setSelectedRecipes] = useState<Map<string, SelectedRecipe>>(new Map());
  const [step, setStep] = useState<"details" | "recipes">("details");

  const toggleRecipe = (recipeId: string, defaultServings: number) => {
    setSelectedRecipes((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(recipeId)) {
        newMap.delete(recipeId);
      } else {
        newMap.set(recipeId, { recipeId, servings: defaultServings });
      }
      return newMap;
    });
  };

  const updateServings = (recipeId: string, servings: number) => {
    setSelectedRecipes((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(recipeId);
      if (existing) {
        newMap.set(recipeId, { ...existing, servings });
      }
      return newMap;
    });
  };

  const handleSessionDetailsSubmit = async (formData: PrepSessionFormData) => {
    // Move to recipe selection step
    setStep("recipes");
  };

  const handleCreateSession = async () => {
    if (selectedRecipes.size === 0) {
      toast.error("Please select at least one recipe");
      return;
    }

    // Get the session data from the form - we need to re-submit the form
    // For now, we'll store the session data in state
    toast.error("Please go back and confirm session details");
  };

  // Better approach: store session data in state
  const [sessionData, setSessionData] = useState<PrepSessionFormData | null>(null);

  const handleSessionDetailsSubmitRevised = async (formData: PrepSessionFormData) => {
    setSessionData(formData);
    setStep("recipes");
  };

  const handleCreateSessionRevised = async () => {
    if (!sessionData) {
      toast.error("Session data is missing");
      return;
    }

    if (selectedRecipes.size === 0) {
      toast.error("Please select at least one recipe");
      return;
    }

    startTransition(async () => {
      // Create the session
      const sessionResult = await createPrepSession(sessionData);

      if (sessionResult.error || !sessionResult.data) {
        toast.error(sessionResult.error || "Failed to create session");
        return;
      }

      const sessionId = sessionResult.data.id;

      // Add selected recipes to the session
      const recipePromises = Array.from(selectedRecipes.values()).map(
        (selectedRecipe, index) => {
          const recipeFormData: PrepSessionRecipeFormData = {
            recipe_id: selectedRecipe.recipeId,
            servings_to_prep: selectedRecipe.servings,
            batch_multiplier: 1,
            prep_order: index,
          };
          return addRecipeToPrepSession(sessionId, recipeFormData);
        }
      );

      const results = await Promise.all(recipePromises);
      const hasErrors = results.some((r) => r.error);

      if (hasErrors) {
        toast.error("Some recipes could not be added");
      } else {
        toast.success(`Created session with ${selectedRecipes.size} recipes`);
        router.push(`/app/prep/${sessionId}`);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Session Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrepSessionForm
            onSubmit={handleSessionDetailsSubmitRevised}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>

      {/* Right: Recipe Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Select Recipes
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {selectedRecipes.size} selected
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recipes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recipes available. Add some recipes first.
            </p>
          ) : (
            <>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {recipes.map((recipe) => {
                  const isSelected = selectedRecipes.has(recipe.id);
                  const selectedData = selectedRecipes.get(recipe.id);
                  const defaultServings = recipe.base_servings || 4;

                  return (
                    <div
                      key={recipe.id}
                      className={`border rounded-lg p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`recipe-${recipe.id}`}
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleRecipe(recipe.id, defaultServings)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`recipe-${recipe.id}`}
                            className="flex items-start gap-2 cursor-pointer"
                          >
                            {recipe.image_url && (
                              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                                <Image
                                  src={recipe.image_url}
                                  alt={recipe.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {recipe.title}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                {recipe.prep_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {recipe.prep_time}
                                  </span>
                                )}
                                {recipe.category && (
                                  <span>{recipe.category}</span>
                                )}
                              </div>
                            </div>
                          </Label>

                          {isSelected && (
                            <div className="mt-2 flex items-center gap-2">
                              <Label
                                htmlFor={`servings-${recipe.id}`}
                                className="text-xs text-muted-foreground shrink-0"
                              >
                                Servings:
                              </Label>
                              <Input
                                id={`servings-${recipe.id}`}
                                type="number"
                                min="1"
                                step="1"
                                value={selectedData?.servings || defaultServings}
                                onChange={(e) =>
                                  updateServings(
                                    recipe.id,
                                    parseInt(e.target.value, 10) || defaultServings
                                  )
                                }
                                className="h-7 w-20 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleCreateSessionRevised}
                  disabled={isPending || selectedRecipes.size === 0 || !sessionData}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Prep Session ({selectedRecipes.size}{" "}
                      {selectedRecipes.size === 1 ? "recipe" : "recipes"})
                    </>
                  )}
                </Button>
                {!sessionData && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Fill in session details first
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
