"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";
import { NutritionFactsCard } from "@/components/nutrition";
import type { RecipeNutrition } from "@/types/nutrition";

interface RecipeDetailNutritionProps {
  recipeId: string;
  nutrition: RecipeNutrition | null;
  baseServings: number | null;
  isExtractingNutrition: boolean;
  isMobile: boolean;
  onExtractNutrition: () => void;
}

// Daily value percentages (based on 2000 calorie diet)
function getDailyValuePercent(value: number | null | undefined, dailyValue: number) {
  if (!value) return 0;
  return Math.min(100, Math.round((value / dailyValue) * 100));
}

export function RecipeDetailNutrition({
  recipeId,
  nutrition,
  baseServings,
  isExtractingNutrition,
  isMobile,
  onExtractNutrition,
}: RecipeDetailNutritionProps) {
  if (nutrition) {
    return (
      <div className="flex flex-col gap-6">
        {/* Visual Nutrition Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Calories</span>
              <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                {nutrition.calories || 0}
              </span>
            </div>
            <Progress
              value={getDailyValuePercent(nutrition.calories, 2000)}
              className="h-2 bg-gray-100 dark:bg-gray-600"
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {getDailyValuePercent(nutrition.calories, 2000)}% DV
            </span>
          </div>

          {/* Protein */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Protein</span>
              <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                {nutrition.protein_g || 0}g
              </span>
            </div>
            <Progress
              value={getDailyValuePercent(nutrition.protein_g, 50)}
              className="h-2 bg-gray-100 dark:bg-gray-600 [&>div]:bg-blue-500"
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {getDailyValuePercent(nutrition.protein_g, 50)}% DV
            </span>
          </div>

          {/* Carbs */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Carbs</span>
              <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                {nutrition.carbs_g || 0}g
              </span>
            </div>
            <Progress
              value={getDailyValuePercent(nutrition.carbs_g, 300)}
              className="h-2 bg-gray-100 dark:bg-gray-600 [&>div]:bg-amber-500"
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {getDailyValuePercent(nutrition.carbs_g, 300)}% DV
            </span>
          </div>

          {/* Fat */}
          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fat</span>
              <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                {nutrition.fat_g || 0}g
              </span>
            </div>
            <Progress
              value={getDailyValuePercent(nutrition.fat_g, 65)}
              className="h-2 bg-gray-100 dark:bg-gray-600 [&>div]:bg-rose-500"
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {getDailyValuePercent(nutrition.fat_g, 65)}% DV
            </span>
          </div>
        </div>

        {/* Detailed Nutrition Card (collapsible on mobile) */}
        <Collapsible defaultOpen={!isMobile}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
            <span>View detailed nutrition facts</span>
            <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <NutritionFactsCard
              nutrition={nutrition}
              recipeId={recipeId}
              servings={baseServings || 4}
              editable
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex text-center py-8 flex-col">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Sparkles className="size-8 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">No Nutrition Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Use AI to automatically extract nutrition information from the recipe ingredients.
          </p>
        </div>
        <Button
          onClick={onExtractNutrition}
          disabled={isExtractingNutrition}
          className="mx-auto"
        >
          {isExtractingNutrition ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              Extract Nutrition with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
