"use client";

import { useEffect, useState } from "react";
import { getNutritionExtractionCosts } from "@/app/actions/nutrition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export function NutritionCostsClient() {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!costData || costData.totalRecipes === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No nutrition extraction costs found. Costs are tracked when you
              extract nutrition data using AI.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nutrition Extraction Costs</h1>
        <p className="text-muted-foreground">
          Track the cost of AI-powered nutrition extraction for your recipes
        </p>
        <Badge variant="outline" className="mt-2">
          Admin Only
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costData.totalCost.toFixed(6)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(costData.totalCost * 100).toFixed(2)} cents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costData.totalRecipes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              recipes with AI extraction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costData.averageCostPerRecipe.toFixed(6)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per recipe</p>
          </CardContent>
        </Card>
      </div>

      {/* Recipe List */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {costData.recipes.map((recipe) => (
              <div
                key={recipe.recipe_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{recipe.recipe_title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>
                      {format(new Date(recipe.extracted_at), "MMM d, yyyy")}
                    </span>
                    <span>
                      {recipe.input_tokens.toLocaleString()} input /{" "}
                      {recipe.output_tokens.toLocaleString()} output tokens
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <Badge variant="secondary" className="font-mono">
                    ${recipe.cost_usd.toFixed(6)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Pricing:</strong> Claude Sonnet 4.5 costs $3 per 1M input
            tokens and $15 per 1M output tokens. Costs are calculated
            automatically when nutrition data is extracted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
