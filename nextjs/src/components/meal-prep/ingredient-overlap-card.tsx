"use client";

import { useState } from "react";
import { Layers, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { PrepSessionOverlapAnalysis } from "@/types/meal-prep";

// ============================================================================
// Types
// ============================================================================

export interface IngredientOverlapCardProps {
  analysis: PrepSessionOverlapAnalysis;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a consistent color for each recipe based on its ID
 */
function getRecipeColor(recipeId: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-amber-500",
  ];

  // Simple hash to get consistent color for same recipe ID
  let hash = 0;
  for (let i = 0; i < recipeId.length; i++) {
    hash = recipeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ============================================================================
// Component
// ============================================================================

export function IngredientOverlapCard({ analysis }: IngredientOverlapCardProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (ingredient: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const hasOverlap = analysis.overlapping_ingredients.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Ingredient Overlap
            </CardTitle>
          </div>
          {analysis.overlap_savings_estimate && (
            <Badge
              variant="default"
              className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {analysis.overlap_savings_estimate}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {analysis.unique_ingredients_count} unique ingredients
          </span>
          {hasOverlap && (
            <>
              <span>•</span>
              <span className="text-green-600 dark:text-green-400">
                {analysis.overlapping_ingredients.length} shared across recipes
              </span>
            </>
          )}
        </div>

        {/* Overlapping ingredients list */}
        {hasOverlap ? (
          <div className="space-y-2">
            {analysis.overlapping_ingredients.map((overlap) => {
              const isOpen = openItems.has(overlap.normalized);

              return (
                <Collapsible
                  key={overlap.normalized}
                  open={isOpen}
                  onOpenChange={() => toggleItem(overlap.normalized)}
                >
                  <div className="rounded-lg border bg-muted/50 dark:bg-muted/30">
                    <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/70 dark:hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {overlap.ingredient}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {overlap.recipes.length} recipes
                        </Badge>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-3 space-y-2">
                        {overlap.recipes.map((recipe) => {
                          const colorClass = getRecipeColor(recipe.recipe_id);

                          return (
                            <div
                              key={recipe.recipe_id}
                              className="flex items-start gap-3 text-sm"
                            >
                              <div
                                className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${colorClass}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {recipe.recipe_title}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {recipe.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {overlap.total_quantity_hint && (
                          <div className="pt-2 mt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Total estimate:</span>{" "}
                              {overlap.total_quantity_hint}
                            </p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No ingredient overlap detected between recipes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
