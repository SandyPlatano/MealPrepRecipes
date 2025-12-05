"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Plus, ChefHat } from "lucide-react";
import { removeMealAssignment, addMealAssignment } from "@/app/actions/meal-plans";
import { useMealPlanContext } from "./meal-plan-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import type { CompactRecipe } from "./compact-recipe-card";

interface TappableDayCardProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  weekStart: string;
  suggestedRecipes?: CompactRecipe[]; // Quick suggestions for empty state
  onOpenBrowser?: () => void; // Open full recipe browser
}

export function TappableDayCard({
  day,
  date,
  assignments,
  weekStart,
  suggestedRecipes = [],
  onOpenBrowser,
}: TappableDayCardProps) {
  const router = useRouter();
  const { selectedRecipe, setSelectedRecipe, isPlacementMode, setLastAction } = useMealPlanContext();
  const [removing, setRemoving] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();
  const isPast = date < today;

  const dayNumber = date.getDate();
  const monthShort = date.toLocaleDateString("en-US", { month: "short" });

  const handleDayClick = async () => {
    if (!isPlacementMode || !selectedRecipe || isAdding) return;

    setIsAdding(true);
    const result = await addMealAssignment(weekStart, selectedRecipe.id, day);

    if (result.error) {
      toast.error(result.error);
    } else {
      // Store for undo
      setLastAction({
        type: "add",
        recipeId: selectedRecipe.id,
        recipeTitle: selectedRecipe.title,
        day,
      });

      toast.success(`Added "${selectedRecipe.title}" to ${day}`, {
        action: {
          label: "Undo",
          onClick: () => {
            // Undo will be handled by the toast action
            router.refresh();
          },
        },
      });
      router.refresh();
      setSelectedRecipe(null);
    }
    setIsAdding(false);
  };

  const handleRemove = async (e: React.MouseEvent, assignmentId: string, recipeTitle: string) => {
    e.stopPropagation();
    setRemoving(assignmentId);
    
    const result = await removeMealAssignment(assignmentId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed "${recipeTitle}" from ${day}`, {
        action: {
          label: "Undo",
          onClick: () => {
            router.refresh();
          },
        },
      });
      router.refresh();
    }
    setRemoving(null);
  };

  const handleQuickAdd = async (e: React.MouseEvent, recipe: CompactRecipe) => {
    e.stopPropagation();
    setIsAdding(true);
    
    const result = await addMealAssignment(weekStart, recipe.id, day);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added "${recipe.title}" to ${day}`, {
        action: {
          label: "Undo",
          onClick: () => router.refresh(),
        },
      });
      router.refresh();
    }
    setIsAdding(false);
  };

  return (
    <Card
      onClick={handleDayClick}
      className={cn(
        "transition-all duration-200 min-h-[180px] flex flex-col",
        // Base styles
        isToday && "ring-2 ring-primary",
        isPast && "opacity-60",
        // Placement mode styles
        isPlacementMode && !isPast && [
          "cursor-pointer hover:ring-2 hover:ring-primary hover:bg-primary/5",
          "hover:shadow-lg hover:scale-[1.02]",
        ],
        isPlacementMode && isAdding && "animate-pulse",
        !isPlacementMode && "cursor-default"
      )}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{dayNumber}</span>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {day.slice(0, 3)}
              </span>
              <span className="text-[10px] text-muted-foreground">{monthShort}</span>
            </div>
          </div>
          {isToday && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Today
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 flex-1 flex flex-col">
        {/* Assigned Meals */}
        <div className="space-y-2 flex-1">
          {assignments.length === 0 ? (
            // Empty state with suggestions or prompt
            <div className="h-full flex flex-col items-center justify-center text-center py-2">
              {isPlacementMode ? (
                <div className="space-y-1 animate-in fade-in">
                  <Plus className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-xs font-medium text-primary">Tap to add</p>
                </div>
              ) : suggestedRecipes.length > 0 ? (
                // Show quick suggestions
                <div className="space-y-2 w-full">
                  <p className="text-[10px] text-muted-foreground">Quick add:</p>
                  <div className="space-y-1">
                    {suggestedRecipes.slice(0, 2).map((recipe) => (
                      <Button
                        key={recipe.id}
                        variant="ghost"
                        size="sm"
                        className="w-full h-auto py-1.5 px-2 text-xs justify-start"
                        onClick={(e) => handleQuickAdd(e, recipe)}
                        disabled={isAdding}
                      >
                        <Plus className="h-3 w-3 mr-1.5 shrink-0" />
                        <span className="truncate">{recipe.title}</span>
                      </Button>
                    ))}
                  </div>
                  {onOpenBrowser && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrowser();
                      }}
                    >
                      More...
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {isPast ? "No meals" : "Nothing planned"}
                  </p>
                  {!isPast && onOpenBrowser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrowser();
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add meal
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Show assigned meals
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group relative bg-secondary/50 hover:bg-secondary rounded-lg p-2 text-sm transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs leading-tight truncate" title={assignment.recipe.title}>
                      {assignment.recipe.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      {assignment.recipe.prep_time && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {assignment.recipe.prep_time}
                        </span>
                      )}
                      {assignment.cook && (
                        <span className="flex items-center gap-0.5">
                          <ChefHat className="h-2.5 w-2.5" />
                          {assignment.cook}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-0.5"
                    onClick={(e) => handleRemove(e, assignment.id, assignment.recipe.title)}
                    disabled={removing === assignment.id}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add button when there are already meals */}
        {assignments.length > 0 && !isPlacementMode && !isPast && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onOpenBrowser?.();
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add more
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

