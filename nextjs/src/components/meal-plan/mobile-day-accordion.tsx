"use client";

import { useState, useEffect } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ChefHat, Clock, X, CalendarOff } from "lucide-react";
import { MobileRecipePickerSheet } from "./mobile-recipe-picker-sheet";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface MobileDayAccordionProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  cookNames: string[];
  isCalendarExcluded?: boolean;
  googleConnected?: boolean;
  onAddMeal: (recipeId: string, day: DayOfWeek) => Promise<void>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemoveMeal: (assignmentId: string) => Promise<void>;
  onClearDay: (day: DayOfWeek) => Promise<void>;
}

export function MobileDayAccordion({
  day,
  date,
  assignments,
  recipes,
  favorites,
  recentRecipeIds,
  cookNames,
  isCalendarExcluded = false,
  googleConnected = false,
  onAddMeal,
  onUpdateCook,
  onRemoveMeal,
  onClearDay,
}: MobileDayAccordionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [updatingCook, setUpdatingCook] = useState<string | null>(null);
  const [removingMeal, setRemovingMeal] = useState<string | null>(null);
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

  const handleClearDay = async () => {
    setIsClearing(true);
    try {
      await onClearDay(day);
    } finally {
      setIsClearing(false);
    }
  };

  const handleUpdateCook = async (assignmentId: string, cook: string) => {
    setUpdatingCook(assignmentId);
    try {
      await onUpdateCook(assignmentId, cook === "none" ? null : cook);
    } finally {
      setUpdatingCook(null);
    }
  };

  const handleRemoveMeal = async (assignmentId: string) => {
    setRemovingMeal(assignmentId);
    try {
      await onRemoveMeal(assignmentId);
    } finally {
      setRemovingMeal(null);
    }
  };

  // Get cook color
  const getCookColor = (cook: string | null) => {
    if (!cook) return "";
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    ];
    const index = cookNames.indexOf(cook) % colors.length;
    return colors[index >= 0 ? index : 0];
  };

  return (
    <AccordionItem
      value={day}
      className={cn(
        "border rounded-lg mb-2 overflow-hidden",
        isToday && "ring-2 ring-primary",
        isPast && "opacity-70"
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
        <div className="flex items-center justify-between w-full pr-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono">{dayNumber}</span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{day.slice(0, 3)}</span>
              </div>
            </div>
            {isToday && (
              <Badge variant="default" className="text-xs">
                Today
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {assignments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {assignments.length} meal{assignments.length !== 1 && "s"}
              </Badge>
            )}
            {googleConnected && isCalendarExcluded && (
              <div title="Calendar sync disabled">
                <CalendarOff className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3">
          {/* Meals List */}
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isPast ? "No meals planned" : "No meals yet"}
            </p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={cn(
                  "bg-card border rounded-lg p-3 space-y-2",
                  removingMeal === assignment.id && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {assignment.recipe.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {assignment.recipe.recipe_type}
                      </Badge>
                      {assignment.recipe.prep_time && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {assignment.recipe.prep_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => handleRemoveMeal(assignment.id)}
                    disabled={removingMeal === assignment.id}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Cook Selector */}
                <Select
                  value={assignment.cook || "none"}
                  onValueChange={(value) =>
                    handleUpdateCook(assignment.id, value)
                  }
                  disabled={updatingCook === assignment.id}
                >
                  <SelectTrigger
                    className={cn("h-10 text-sm", getCookColor(assignment.cook))}
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Assign cook" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No cook assigned</SelectItem>
                    {cookNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}

          {/* Add Button */}
          {!isPast && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-dashed h-12 text-base"
                onClick={() => setPickerOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Meal
              </Button>
              <MobileRecipePickerSheet
                recipes={recipes}
                favorites={favorites}
                recentRecipeIds={recentRecipeIds}
                day={day}
                isOpen={pickerOpen}
                onSelect={onAddMeal}
                onClose={() => setPickerOpen(false)}
              />
            </>
          )}

          {/* Clear Day Button */}
          {assignments.length > 0 && !isPast && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={handleClearDay}
              disabled={isClearing}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {isClearing ? "Clearing..." : "Clear Day"}
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

