"use client";

/**
 * Nutrition Facts Card Component
 * FDA-style nutrition label for recipe detail pages
 * Includes edit functionality, confidence indicator, and serving selector
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Sparkles, AlertTriangle, Minus, Plus } from "lucide-react";
import type { RecipeNutrition, ConfidenceLevel } from "@/types/nutrition";
import { getConfidenceLevel } from "@/types/nutrition";
import { cn } from "@/lib/utils";
import { NutritionEditor } from "./nutrition-editor";

interface NutritionFactsCardProps {
  nutrition?: RecipeNutrition | null;
  recipeId: string;
  servings: number;
  onUpdate?: (nutrition: RecipeNutrition) => void;
  editable?: boolean;
  className?: string;
}

export function NutritionFactsCard({
  nutrition,
  recipeId,
  servings,
  onUpdate,
  editable = true,
  className,
}: NutritionFactsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedServings, setSelectedServings] = useState(1);

  // Scale nutrition values based on selected servings
  const scaleValue = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    return Math.round(value * selectedServings * 10) / 10;
  };

  const scaledNutrition = nutrition ? {
    calories: scaleValue(nutrition.calories),
    protein_g: scaleValue(nutrition.protein_g),
    carbs_g: scaleValue(nutrition.carbs_g),
    fat_g: scaleValue(nutrition.fat_g),
    fiber_g: scaleValue(nutrition.fiber_g),
    sugar_g: scaleValue(nutrition.sugar_g),
    sodium_mg: scaleValue(nutrition.sodium_mg),
  } : null;

  // No nutrition data
  if (!nutrition) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Nutrition Facts
            <Badge variant="outline" className="text-muted-foreground">
              Not Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            No nutrition data available for this recipe.
          </p>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Add Nutrition Info
            </Button>
          )}
        </CardContent>

        {isEditing && (
          <NutritionEditor
            recipeId={recipeId}
            initialNutrition={null}
            onSave={(updated) => {
              onUpdate?.(updated);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </Card>
    );
  }

  const confidenceLevel = getConfidenceLevel(nutrition.confidence_score);

  // Editing mode
  if (isEditing) {
    return (
      <NutritionEditor
        recipeId={recipeId}
        initialNutrition={nutrition}
        onSave={(updated) => {
          onUpdate?.(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Nutrition Facts</CardTitle>
          </div>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Data source indicator */}
        <div className="flex items-center gap-2 pt-2">
          <DataSourceBadge source={nutrition.source} />
          <ConfidenceBadge level={confidenceLevel} score={nutrition.confidence_score} />
        </div>
      </CardHeader>

      <CardContent>
        {/* FDA-style nutrition label */}
        <div className="border-t-8 border-black dark:border-white">
          {/* Interactive serving selector */}
          <div className="bg-muted/50 -mx-4 px-4 py-3 border-b border-black dark:border-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">How many servings?</span>
                <p className="text-xs text-muted-foreground">Recipe makes {servings} total</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedServings(Math.max(0.5, selectedServings - 0.5))}
                  disabled={selectedServings <= 0.5}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg tabular-nums">
                  {selectedServings}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedServings(Math.min(20, selectedServings + 0.5))}
                  disabled={selectedServings >= 20}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Quick select buttons */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[1, 2, servings, 10, 20].filter((v, i, a) => a.indexOf(v) === i && v <= 20).sort((a, b) => a - b).slice(0, 5).map((num) => (
                <Button
                  key={num}
                  variant={selectedServings === num ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setSelectedServings(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div className="border-b-4 border-black py-2 dark:border-white">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-medium">Calories</span>
                {selectedServings !== 1 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({selectedServings} {selectedServings === 1 ? "serving" : "servings"})
                  </span>
                )}
              </div>
              <span className="text-3xl font-bold tabular-nums">
                {scaledNutrition && scaledNutrition.calories != null ? Math.round(scaledNutrition.calories) : "—"}
              </span>
            </div>
            {/* Show per-serving breakdown when viewing multiple servings */}
            {selectedServings > 1 && nutrition.calories && (
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {nutrition.calories} cal per serving × {selectedServings} servings
              </div>
            )}
          </div>

          {/* Daily Value header */}
          <div className="border-b border-black py-1 text-right dark:border-white">
            <span className="text-xs font-medium">% Daily Value*</span>
          </div>

          {/* Macronutrients - using scaled values */}
          <NutrientRow
            label="Total Fat"
            value={scaledNutrition?.fat_g}
            unit="g"
            dailyValue={scaledNutrition?.fat_g ? Math.round((scaledNutrition.fat_g / 78) * 100) : null}
          />

          <NutrientRow
            label="Total Carbohydrate"
            value={scaledNutrition?.carbs_g}
            unit="g"
            dailyValue={scaledNutrition?.carbs_g ? Math.round((scaledNutrition.carbs_g / 275) * 100) : null}
          />

          {scaledNutrition?.fiber_g !== null && scaledNutrition?.fiber_g !== undefined && (
            <NutrientRow
              label="Dietary Fiber"
              value={scaledNutrition.fiber_g}
              unit="g"
              dailyValue={Math.round((scaledNutrition.fiber_g / 28) * 100)}
              indent
            />
          )}

          {scaledNutrition?.sugar_g !== null && scaledNutrition?.sugar_g !== undefined && (
            <NutrientRow
              label="Total Sugars"
              value={scaledNutrition.sugar_g}
              unit="g"
              dailyValue={null}
              indent
            />
          )}

          <NutrientRow
            label="Protein"
            value={scaledNutrition?.protein_g}
            unit="g"
            dailyValue={scaledNutrition?.protein_g ? Math.round((scaledNutrition.protein_g / 50) * 100) : null}
            bold
          />

          {/* Sodium */}
          {scaledNutrition?.sodium_mg !== null && scaledNutrition?.sodium_mg !== undefined && (
            <NutrientRow
              label="Sodium"
              value={scaledNutrition.sodium_mg}
              unit="mg"
              dailyValue={Math.round((scaledNutrition.sodium_mg / 2300) * 100)}
            />
          )}

          {/* Footer */}
          <div className="border-t-4 border-black py-2 dark:border-white">
            <p className="text-[10px] leading-tight text-muted-foreground">
              * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be
              higher or lower depending on your calorie needs.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Single nutrient row in FDA-style label
 */
interface NutrientRowProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  dailyValue: number | null;
  indent?: boolean;
  bold?: boolean;
}

function NutrientRow({ label, value, unit, dailyValue, indent, bold }: NutrientRowProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-black py-1 dark:border-white">
      <div className={cn("text-sm", indent && "pl-4", bold && "font-bold")}>
        {label}{" "}
        <span className="font-bold tabular-nums">
          {value !== null && value !== undefined ? `${value.toFixed(1)}${unit}` : "—"}
        </span>
      </div>
      {dailyValue !== null && (
        <div className="text-sm font-bold tabular-nums">{dailyValue}%</div>
      )}
    </div>
  );
}

/**
 * Badge showing data source
 */
function DataSourceBadge({ source }: { source: RecipeNutrition["source"] }) {
  const config = {
    ai_extracted: {
      icon: Sparkles,
      label: "AI Extracted",
      variant: "secondary" as const,
    },
    manual: {
      icon: Pencil,
      label: "Manual Entry",
      variant: "default" as const,
    },
    imported: {
      icon: Sparkles,
      label: "Imported",
      variant: "secondary" as const,
    },
    usda: {
      icon: Sparkles,
      label: "USDA Data",
      variant: "default" as const,
    },
  };

  const { icon: Icon, label, variant } = config[source] || config.manual;

  return (
    <Badge variant={variant} className="text-xs">
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

/**
 * Badge showing confidence level
 */
function ConfidenceBadge({
  level,
  score,
}: {
  level: ConfidenceLevel;
  score?: number | null;
}) {
  if (level === "unknown") return null;

  // Warm design system confidence indicators
  const config = {
    high: {
      label: "High Confidence",
      variant: "default" as const,
      className: "bg-[#D9F99D]/20 text-green-700 border-[#D9F99D]/40",
    },
    medium: {
      label: "Medium Confidence",
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
    low: {
      label: "Low Confidence",
      variant: "secondary" as const,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
  };

  const { label, className } = config[level];

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {level !== "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {label}
      {score !== null && score !== undefined && (
        <span className="ml-1 opacity-70">({Math.round(score * 100)}%)</span>
      )}
    </Badge>
  );
}
