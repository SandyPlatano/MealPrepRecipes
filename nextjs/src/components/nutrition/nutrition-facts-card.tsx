"use client";

/**
 * Nutrition Facts Card Component
 * FDA-style nutrition label for recipe detail pages
 * Includes edit functionality and confidence indicator
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Sparkles, AlertTriangle } from "lucide-react";
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
        <CardContent className="space-y-4">
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
          <div className="space-y-1">
            <CardTitle className="text-lg">Nutrition Facts</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{servings} servings per recipe</span>
              <span>•</span>
              <span>Per serving</span>
            </div>
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

      <CardContent className="space-y-0">
        {/* FDA-style nutrition label */}
        <div className="border-t-8 border-black dark:border-white">
          {/* Calories */}
          <div className="border-b-4 border-black py-1 dark:border-white">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium">Calories</span>
              <span className="text-3xl font-bold tabular-nums">
                {nutrition.calories ?? "—"}
              </span>
            </div>
          </div>

          {/* Daily Value header */}
          <div className="border-b border-black py-1 text-right dark:border-white">
            <span className="text-xs font-medium">% Daily Value*</span>
          </div>

          {/* Macronutrients */}
          <NutrientRow
            label="Total Fat"
            value={nutrition.fat_g}
            unit="g"
            dailyValue={nutrition.fat_g ? Math.round((nutrition.fat_g / 78) * 100) : null}
          />

          <NutrientRow
            label="Total Carbohydrate"
            value={nutrition.carbs_g}
            unit="g"
            dailyValue={nutrition.carbs_g ? Math.round((nutrition.carbs_g / 275) * 100) : null}
          />

          {nutrition.fiber_g !== null && nutrition.fiber_g !== undefined && (
            <NutrientRow
              label="Dietary Fiber"
              value={nutrition.fiber_g}
              unit="g"
              dailyValue={Math.round((nutrition.fiber_g / 28) * 100)}
              indent
            />
          )}

          {nutrition.sugar_g !== null && nutrition.sugar_g !== undefined && (
            <NutrientRow
              label="Total Sugars"
              value={nutrition.sugar_g}
              unit="g"
              dailyValue={null}
              indent
            />
          )}

          <NutrientRow
            label="Protein"
            value={nutrition.protein_g}
            unit="g"
            dailyValue={nutrition.protein_g ? Math.round((nutrition.protein_g / 50) * 100) : null}
            bold
          />

          {/* Sodium */}
          {nutrition.sodium_mg !== null && nutrition.sodium_mg !== undefined && (
            <NutrientRow
              label="Sodium"
              value={nutrition.sodium_mg}
              unit="mg"
              dailyValue={Math.round((nutrition.sodium_mg / 2300) * 100)}
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

  const config = {
    high: {
      label: "High Confidence",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    },
    medium: {
      label: "Medium Confidence",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    },
    low: {
      label: "Low Confidence",
      variant: "secondary" as const,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
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
