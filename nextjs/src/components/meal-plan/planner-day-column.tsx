"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { MealCell } from "./meal-cell";
import { InlineRecipePicker } from "./inline-recipe-picker";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface PlannerDayColumnProps {
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

export function PlannerDayColumn({
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
}: PlannerDayColumnProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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

  const handleClearDay = async () => {
    setIsClearing(true);
    try {
      await onClearDay(day);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col min-h-[300px] bg-card border rounded-lg overflow-hidden transition-all",
        isToday && "ring-2 ring-primary",
        isPast && "opacity-70"
      )}
    >
      {/* Day Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">{dayNumber}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">{dayAbbrev}</span>
              <span className="text-[10px] text-muted-foreground">{monthAbbrev}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isToday && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Today
              </Badge>
            )}
            {assignments.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {assignments.length}
              </Badge>
            )}
            {googleConnected && isCalendarExcluded && (
              <div title="Calendar sync disabled">
                <CalendarOff className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="flex-1 p-2 flex flex-col gap-2">
        {assignments.map((assignment) => (
          <MealCell
            key={assignment.id}
            assignment={assignment}
            cookNames={cookNames}
            onUpdateCook={onUpdateCook}
            onRemove={onRemoveMeal}
          />
        ))}

        {/* Empty State / Add Button */}
        {assignments.length === 0 && !pickerOpen && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              {isPast ? "No meals" : "Empty"}
            </p>
          </div>
        )}

        {/* Inline Add Button */}
        {!isPast && (
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full h-9 border-2 border-dashed",
                  "hover:border-primary hover:bg-primary/5",
                  pickerOpen && "border-primary bg-primary/5"
                )}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Meal
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="center"
              className="w-auto p-0 border-0"
            >
              <InlineRecipePicker
                recipes={recipes}
                favorites={favorites}
                recentRecipeIds={recentRecipeIds}
                day={day}
                onSelect={onAddMeal}
                onClose={() => setPickerOpen(false)}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Day Footer - Clear Button */}
      {assignments.length > 0 && !isPast && (
        <div className="p-2 border-t bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleClearDay}
            disabled={isClearing}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {isClearing ? "Clearing..." : "Clear Day"}
          </Button>
        </div>
      )}
    </div>
  );
}

