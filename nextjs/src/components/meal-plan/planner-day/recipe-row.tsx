import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, ChefHat, ChevronRight } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecipePreviewPopover } from "../recipe-preview-popover";
import { MealTypeSelector } from "../meal-type-selector";
import { cn } from "@/lib/utils";
import type { MealAssignmentWithRecipe, MealType } from "@/types/meal-plan";
import { getMealTypeConfig } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";
import type { MealTypeCustomization, MealTypeKey } from "@/types/settings";

interface RecipeRowProps {
  assignment: MealAssignmentWithRecipe;
  cookNames: string[];
  cookColors: Record<string, string>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onUpdateMealType: (assignmentId: string, mealType: MealType | null) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  onSwap: () => void;
  nutrition?: RecipeNutrition | null;
  mealTypeSettings?: MealTypeCustomization;
  showNutrition?: boolean;
  showPrepTime?: boolean;
  compact?: boolean;
}

export function RecipeRow({
  assignment,
  cookNames,
  cookColors,
  onUpdateCook,
  onUpdateMealType,
  onRemove,
  onSwap,
  nutrition = null,
  mealTypeSettings,
  showNutrition = true,
  showPrepTime = true,
  compact = false,
}: RecipeRowProps) {

  // Default colors for cooks (fallback)
  const defaultColors = [
    "#3b82f6", // blue
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
  ];

  // Get cook color for styling - returns color for swatch and border
  const getCookColor = (cook: string | null): string | null => {
    if (!cook) return null;

    // Use saved color if available
    if (cookColors[cook]) {
      return cookColors[cook];
    }

    // Fall back to default color
    const index = cookNames.indexOf(cook);
    if (index >= 0) {
      return defaultColors[index % defaultColors.length];
    }

    return null;
  };

  // Get meal type config for colored border
  const mealTypeConfig = getMealTypeConfig(assignment.meal_type);
  // Use custom color if available, otherwise fall back to default
  const mealTypeKey = (assignment.meal_type ?? "other") as MealTypeKey;
  const customMealColor = mealTypeSettings?.[mealTypeKey]?.color;
  const mealAccentColor = customMealColor || mealTypeConfig.accentColor;

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingMealType, setIsUpdatingMealType] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleCookChange = async (value: string) => {
    setIsUpdating(true);
    try {
      await onUpdateCook(assignment.id, value === "none" || value === "" ? null : value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMealTypeChange = async (mealType: MealType | null) => {
    setIsUpdatingMealType(true);
    try {
      await onUpdateMealType(assignment.id, mealType);
    } finally {
      setIsUpdatingMealType(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(assignment.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <div
        className={cn(
          "group flex flex-col gap-2 rounded-lg border bg-card/50 transition-all border-l-4",
          "hover:bg-card hover:shadow-sm hover:border-primary/30",
          compact ? "p-2" : "p-3",
          isRemoving && "opacity-50"
        )}
        style={{
          borderLeftColor: mealAccentColor,
        }}
      >
        {/* Title Row - Always visible */}
        <div className="flex items-center gap-2">
          {/* Chevron Toggle - larger on mobile for touch */}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-10 md:size-8 flex-shrink-0 -ml-1",
                "hover:bg-muted/50",
                compact && "size-9 md:size-7"
              )}
              aria-label={isDetailsOpen ? "Collapse details" : "Expand details"}
            >
              <ChevronRight
                className={cn(
                  "size-5 md:size-4 text-muted-foreground transition-transform duration-200",
                  isDetailsOpen && "rotate-90"
                )}
              />
            </Button>
          </CollapsibleTrigger>

          {/* Recipe Title & Meta */}
          <div className="flex-1 min-w-0">
            <RecipePreviewPopover
              recipe={assignment.recipe}
              nutrition={nutrition}
            >
              <p
                className={cn(
                  "font-medium truncate hover:underline underline-offset-2",
                  compact ? "text-sm" : "text-sm md:text-base"
                )}
                title={assignment.recipe.title}
              >
                {assignment.recipe.title}
              </p>
            </RecipePreviewPopover>
            {/* Meta row */}
            {(showPrepTime && assignment.recipe.prep_time) || (showNutrition && nutrition) ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {showPrepTime && assignment.recipe.prep_time && (
                  <span className="text-xs text-muted-foreground">
                    {assignment.recipe.prep_time}
                  </span>
                )}
                {showNutrition && nutrition && (
                  <>
                    {nutrition.calories && (
                      <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0.5 h-5">
                        {Math.round(nutrition.calories)} cal
                      </Badge>
                    )}
                    {nutrition.protein_g && (
                      <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0.5 h-5">
                        {Math.round(nutrition.protein_g)}g protein
                      </Badge>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Action buttons - always visible, larger on mobile for touch */}
          <div className="flex items-center gap-1 md:gap-1 flex-shrink-0">
            <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-11 md:size-9", compact && "size-10 md:size-8")}
                title="View Recipe"
              >
                <Eye className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className={cn("size-11 md:size-9", compact && "size-10 md:size-8")}
              onClick={onSwap}
              title="Change Recipe"
            >
              <Pencil className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-11 md:size-9 hover:bg-destructive/10 hover:text-destructive",
                compact && "size-10 md:size-8"
              )}
              onClick={handleRemove}
              disabled={isRemoving}
              title="Remove"
            >
              <Trash2 className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
            </Button>
          </div>
        </div>

        {/* Collapsible Details Panel */}
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200">
          <div
            className={cn(
              "flex items-center gap-2 pt-2 pl-7 border-t border-border/50 mt-1",
              compact && "pt-1.5 mt-0.5 pl-6"
            )}
          >
            {/* Meal Type Selector */}
            <div className="flex-1 min-w-0 max-w-[180px]">
              <MealTypeSelector
                value={assignment.meal_type}
                onChange={handleMealTypeChange}
                disabled={isUpdatingMealType}
                className={cn("h-9 text-sm", compact && "h-8 text-xs")}
                compact={false}
                mealTypeSettings={mealTypeSettings}
              />
            </div>

            {/* Cook Selector */}
            <div className="flex-1 min-w-0 max-w-[200px]">
              {(() => {
                const cookColor = getCookColor(assignment.cook);
                return (
                  <Select
                    value={assignment.cook || "none"}
                    onValueChange={handleCookChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 text-sm min-w-0 [&>span]:min-w-0 [&>span]:truncate",
                        compact && "h-8 text-xs"
                      )}
                      style={cookColor ? {
                        borderLeft: `3px solid ${cookColor}`,
                      } : undefined}
                    >
                      <ChefHat className={cn("size-4 mr-1.5 flex-shrink-0", compact && "size-3.5")} />
                      <SelectValue placeholder="Assign cook" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No cook assigned</SelectItem>
                      {cookNames.map((name) => {
                        const color = getCookColor(name);
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              {color && (
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                  aria-hidden="true"
                                />
                              )}
                              {name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
