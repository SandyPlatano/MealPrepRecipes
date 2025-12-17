"use client";

import { useState, useTransition, memo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Eye, Pencil, ChefHat, CalendarOff } from "lucide-react";
import { RecipePickerModal } from "./recipe-picker-modal";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface PlannerDayRowProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  suggestedRecipeIds: string[];
  cookNames: string[];
  cookColors: Record<string, string>;
  userAllergenAlerts?: string[];
  isCalendarExcluded?: boolean;
  googleConnected?: boolean;
  onAddMeal: (recipeId: string, day: DayOfWeek, cook?: string) => Promise<void>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemoveMeal: (assignmentId: string) => Promise<void>;
  nutritionData?: Map<string, RecipeNutrition> | null;
}

export const PlannerDayRow = memo(function PlannerDayRow({
  day,
  date,
  assignments,
  recipes,
  favorites,
  recentRecipeIds,
  suggestedRecipeIds,
  cookNames,
  cookColors,
  userAllergenAlerts = [],
  isCalendarExcluded = false,
  googleConnected = false,
  onAddMeal,
  onUpdateCook,
  onRemoveMeal,
  nutritionData = null,
}: PlannerDayRowProps) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Track when component is mounted (client-side only) to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only compute "today" on client to avoid server/client mismatch
  const today = isMounted ? new Date() : new Date(date);
  today.setHours(0, 0, 0, 0);
  const isToday = isMounted && date.toDateString() === today.toDateString();
  const isPast = isMounted && date < today;

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3).toUpperCase();
  // Use a consistent format that doesn't depend on locale
  const monthAbbrev = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  return (
    <div className={`flex items-start gap-2 sm:gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      {/* Day Badge - Floats on the left */}
      <div
        className={cn(
          "flex flex-col items-center justify-center min-w-[56px] sm:min-w-[60px] pt-2",
          isToday && "text-primary"
        )}
      >
        <div className="text-2xl sm:text-3xl font-bold font-mono leading-none">
          {dayNumber}
        </div>
        <div className="text-[10px] font-semibold mt-0.5">{dayAbbrev}</div>
        <div className="text-[9px] text-muted-foreground">{monthAbbrev}</div>
        {isToday && (
          <Badge variant="default" className="text-[8px] px-1 py-0 mt-1">
            Today
          </Badge>
        )}
        {googleConnected && isCalendarExcluded && (
          <div className="mt-1 flex items-center justify-center" title="Calendar sync disabled">
            <CalendarOff className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Card with Recipes */}
      <Card
        className={cn(
          "flex-1 transition-all min-h-[100px]",
          isToday && "ring-2 ring-primary",
          isPast && "opacity-70"
        )}
      >
        <CardContent className="p-2.5 space-y-1.5">
          {assignments.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              {isPast ? "No meals planned" : "No meals yet"}
            </div>
          ) : (
            assignments.map((assignment) => (
              <RecipeRow
                key={assignment.id}
                assignment={assignment}
                cookNames={cookNames}
                cookColors={cookColors}
                onUpdateCook={onUpdateCook}
                onRemove={onRemoveMeal}
                onSwap={() => {
                  // First remove the current recipe, then open modal to add new one
                  onRemoveMeal(assignment.id);
                  setModalOpen(true);
                }}
                nutrition={nutritionData?.get(assignment.recipe_id) || null}
              />
            ))
          )}

          {/* Add Meal Button */}
          {!isPast && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(true)}
                className={cn(
                  "w-full h-12 sm:h-10 border-2 border-dashed",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-1" />
                Add Meal
              </Button>

              <RecipePickerModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                day={day}
                recipes={recipes}
                favorites={favorites}
                recentRecipeIds={recentRecipeIds}
                suggestedRecipeIds={suggestedRecipeIds}
                cookNames={cookNames}
                cookColors={cookColors}
                userAllergenAlerts={userAllergenAlerts}
                onAdd={async (recipeIds, cook) => {
                  startTransition(async () => {
                    // Add each recipe with the cook assignment
                    for (const recipeId of recipeIds) {
                      await onAddMeal(recipeId, day, cook || undefined);
                    }
                  });
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

interface RecipeRowProps {
  assignment: MealAssignmentWithRecipe;
  cookNames: string[];
  cookColors: Record<string, string>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  onSwap: () => void;
  nutrition?: RecipeNutrition | null;
}

function RecipeRow({
  assignment,
  cookNames,
  cookColors,
  onUpdateCook,
  onRemove,
  onSwap,
  nutrition = null,
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleCookChange = async (value: string) => {
    setIsUpdating(true);
    try {
      await onUpdateCook(assignment.id, value === "none" || value === "" ? null : value);
    } finally {
      setIsUpdating(false);
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
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md border bg-card/50 transition-all",
        "hover:bg-card hover:shadow-sm hover:border-primary/30",
        isRemoving && "opacity-50"
      )}
    >
      {/* Mobile: Row 1 - Title + Delete | Desktop: Title only */}
      <div className="flex items-center gap-2 sm:flex-1 sm:min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" title={assignment.recipe.title}>
            {assignment.recipe.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {assignment.recipe.prep_time && (
              <span className="text-[11px] text-muted-foreground">
                {assignment.recipe.prep_time}
              </span>
            )}
            {nutrition && (
              <>
                {nutrition.calories && (
                  <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 h-4">
                    {Math.round(nutrition.calories)} cal
                  </Badge>
                )}
                {nutrition.protein_g && (
                  <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 h-4">
                    {Math.round(nutrition.protein_g)}g p
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete button - visible on mobile in row 1, hidden on desktop (shown in action buttons) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:hidden hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Row 2 - View, Edit, Cook Selector | Desktop: All action buttons + Cook Selector */}
      <div className="flex items-center gap-1 sm:gap-0.5">
        <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            title="View Recipe"
          >
            <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-7 sm:w-7"
          onClick={onSwap}
          title="Change Recipe"
        >
          <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </Button>

        {/* Delete button - hidden on mobile (shown in row 1), visible on desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        {/* Cook Selector - flex-1 on mobile, fixed width on desktop */}
        <div className="flex-1 sm:flex-none sm:w-[140px] min-w-0">
          {(() => {
            const cookColor = getCookColor(assignment.cook);
            return (
              <Select
                value={assignment.cook || "none"}
                onValueChange={handleCookChange}
                disabled={isUpdating}
              >
                <SelectTrigger
                  className="h-7 text-xs min-w-0 [&>span]:min-w-0 [&>span]:truncate"
                  style={cookColor ? {
                    borderLeft: `3px solid ${cookColor}`,
                  } : undefined}
                >
                  <ChefHat className="h-3 w-3 mr-1 flex-shrink-0" />
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
    </div>
  );
}

