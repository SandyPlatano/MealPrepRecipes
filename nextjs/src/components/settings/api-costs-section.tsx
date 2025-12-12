"use client";

import { useEffect, useState } from "react";
import { getNutritionExtractionCosts } from "@/app/actions/nutrition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { isLocalhost } from "@/lib/utils/is-localhost";

export function ApiCostsSection() {
  const [costData, setCostData] = useState<{
    totalCost: number;
    totalRecipes: number;
    averageCostPerRecipe: number;
    recipes: Array<{
      recipe_id: string;
      recipe_title: string;
      cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      extracted_at: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show on localhost
  if (!isLocalhost()) {
    return null;
  }

  useEffect(() => {
    async function fetchCosts() {
      setLoading(true);
      setError(null);
      const result = await getNutritionExtractionCosts();
      if (result.error) {
        setError(result.error);
      } else {
        setCostData(result.data);
      }
      setLoading(false);
    }
    fetchCosts();
  }, []);

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          API Costs (Development Only)
        </CardTitle>
        <CardDescription>
          Track nutrition extraction costs - visible only on localhost
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !costData || costData.totalRecipes === 0 ? (
          <p className="text-sm text-muted-foreground">
            No nutrition extraction costs found yet.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold font-mono">
                  ${costData.totalCost.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Cost</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold font-mono">
                  {costData.totalRecipes}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Recipes</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold font-mono">
                  ${costData.averageCostPerRecipe.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Avg/Recipe</div>
              </div>
            </div>

            {/* Recent Extractions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Extractions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {costData.recipes.slice(0, 5).map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="flex items-center justify-between p-2 text-sm bg-background rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{recipe.recipe_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(recipe.extracted_at), "MMM d, yyyy")} •{" "}
                        {recipe.input_tokens.toLocaleString()} in / {recipe.output_tokens.toLocaleString()} out
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono ml-2">
                      ${recipe.cost_usd.toFixed(6)}
                    </Badge>
                  </div>
                ))}
              </div>
              {costData.recipes.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{costData.recipes.length - 5} more recipes
                </p>
              )}
            </div>

            {/* Pricing Info */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Pricing:</strong> Claude Sonnet 4.5 - $3/1M input tokens, $15/1M output tokens
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

