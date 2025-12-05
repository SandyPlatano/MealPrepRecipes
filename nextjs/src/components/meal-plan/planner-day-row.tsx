"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { Plus, Trash2, Eye, ChefHat, Pencil } from "lucide-react";
import { RecipePickerModal } from "./recipe-picker-modal";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";

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
  onAddMeal: (recipeId: string, day: DayOfWeek, cook?: string) => Promise<void>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemoveMeal: (assignmentId: string) => Promise<void>;
  isOver?: boolean;
}

export function PlannerDayRow({
  day,
  date,
  assignments,
  recipes,
  favorites,
  recentRecipeIds,
  suggestedRecipeIds,
  cookNames,
  cookColors,
  onAddMeal,
  onUpdateCook,
  onRemoveMeal,
  isOver = false,
}: PlannerDayRowProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  // Default colors for cooks (fallback)
  const defaultColors = [
    "#3b82f6", // blue
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
  ];

  const { setNodeRef } = useDroppable({
    id: `day-${day}`,
    data: {
      type: "day",
      day,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();
  const isPast = date < today;

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3).toUpperCase();
  const monthAbbrev = date.toLocaleDateString("en-US", { month: "short" });

  const assignmentIds = assignments.map((a) => a.id);

  // Get cook color - use saved color or default
  const getCookColor = (cook: string | null) => {
    if (!cook) return "bg-muted";
    
    // Use saved color if available
    if (cookColors[cook]) {
      const color = cookColors[cook];
      // Convert hex to Tailwind-safe inline style
      return `bg-[${color}]/20 text-[${color}]`;
    }
    
    // Fall back to default Tailwind colors
    const colors = [
      "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      "bg-green-500/20 text-green-700 dark:text-green-300",
      "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    ];
    const index = cookNames.indexOf(cook) % colors.length;
    return colors[index >= 0 ? index : 0];
  };

  return (
    <div className="flex items-start gap-2 sm:gap-3">
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
      </div>

      {/* Card with Recipes */}
      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 transition-all min-h-[100px]",
          isToday && "ring-2 ring-primary",
          isPast && "opacity-70",
          isOver && "ring-2 ring-primary bg-primary/5"
        )}
      >
        <CardContent className="p-2.5 space-y-1.5">
          <SortableContext
            items={assignmentIds}
            strategy={verticalListSortingStrategy}
          >
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
                />
              ))
            )}
          </SortableContext>

          {/* Add Meal Button */}
          {!isPast && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(true)}
                className={cn(
                  "w-full h-10 border-2 border-dashed",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <Plus className="h-4 w-4 mr-1" />
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
                onAdd={async (recipeIds, cook) => {
                  // Add each recipe with the cook assignment
                  for (const recipeId of recipeIds) {
                    await onAddMeal(recipeId, day, cook || undefined);
                  }
                  
                  // Refresh the page to show new recipes
                  router.refresh();
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RecipeRowProps {
  assignment: MealAssignmentWithRecipe;
  cookNames: string[];
  cookColors: Record<string, string>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  onSwap: () => void;
}

function RecipeRow({
  assignment,
  cookNames,
  cookColors,
  onUpdateCook,
  onRemove,
  onSwap,
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
      await onUpdateCook(assignment.id, value || null);
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
        "group flex items-center gap-2 p-2 rounded-md border bg-card/50 transition-all",
        "hover:bg-card hover:shadow-sm hover:border-primary/30",
        isRemoving && "opacity-50"
      )}
    >
      {/* Recipe Title */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={assignment.recipe.title}>
          {assignment.recipe.title}
        </p>
        {assignment.recipe.prep_time && (
          <p className="text-[11px] text-muted-foreground">
            {assignment.recipe.prep_time}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="View Recipe"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onSwap}
          title="Change Recipe"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cook Selector */}
      <div className="w-[130px] sm:w-[140px]">
        {(() => {
          const cookColor = getCookColor(assignment.cook);
          return (
            <Select
              value={assignment.cook || ""}
              onValueChange={handleCookChange}
              disabled={isUpdating}
            >
              <SelectTrigger
                className="h-7 text-xs"
                style={cookColor ? {
                  borderLeft: `3px solid ${cookColor}`,
                } : undefined}
              >
                {cookColor ? (
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0 mr-1.5"
                    style={{ backgroundColor: cookColor }}
                    aria-hidden="true"
                  />
                ) : (
                  <ChefHat className="h-3 w-3 mr-1 text-muted-foreground" />
                )}
                <SelectValue placeholder="Assign cook" />
              </SelectTrigger>
              <SelectContent>
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
  );
}

