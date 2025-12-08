"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlannerHeader } from "./planner-header";
import { PlannerDayColumn } from "./planner-day-column";
import { PlannerDayRow } from "./planner-day-row";
import { PlannerSummary } from "./planner-summary";
import { MealCellOverlay } from "./meal-cell";
import { MobileDayAccordion } from "./mobile-day-accordion";
import {
  addMealAssignment,
  removeMealAssignment,
  updateMealAssignment,
  clearDayAssignments,
} from "@/app/actions/meal-plans";
import { copyPreviousWeek } from "@/app/actions/meal-plan-suggestions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type WeekPlanData,
  type DayOfWeek,
  type MealAssignmentWithRecipe,
  DAYS_OF_WEEK,
  formatWeekRange,
  getWeekStart,
} from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  tags?: string[];
}

interface MealPlannerGridProps {
  weekStart: Date;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
  cookColors: Record<string, string>;
  userAllergenAlerts?: string[];
  calendarExcludedDays?: string[];
  googleConnected?: boolean;
  favorites: string[];
  recentRecipeIds: string[];
  suggestedRecipeIds: string[];
  previousWeekMealCount: number;
}

export function MealPlannerGrid({
  weekStart,
  weekPlan,
  recipes,
  cookNames,
  cookColors,
  userAllergenAlerts = [],
  calendarExcludedDays = [],
  googleConnected = false,
  favorites,
  recentRecipeIds,
  suggestedRecipeIds,
  previousWeekMealCount,
}: MealPlannerGridProps) {
  const router = useRouter();
  const [activeAssignment, setActiveAssignment] = useState<MealAssignmentWithRecipe | null>(null);
  const [overDay, setOverDay] = useState<DayOfWeek | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Scroll listener for sticky week nav
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowStickyNav(headerBottom < 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get all assignments as a flat array
  const allAssignments = useMemo(() => {
    return Object.values(weekPlan.assignments).flat();
  }, [weekPlan.assignments]);

  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Week navigation handlers
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  }, [weekStart, router]);

  const goToCurrentWeek = useCallback(() => {
    const currentWeek = getWeekStart(new Date());
    const weekStr = currentWeek.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  }, [router]);

  const isCurrentWeek = weekStartStr === getWeekStart(new Date()).toISOString().split("T")[0];

  // Handler for adding a meal
  const handleAddMeal = useCallback(
    async (recipeId: string, day: DayOfWeek, cook?: string) => {
      const result = await addMealAssignment(weekStartStr, recipeId, day, cook);
      if (result.error) {
        toast.error(result.error);
      } else {
        const recipe = recipes.find((r) => r.id === recipeId);
        toast.success(`Added "${recipe?.title}" to ${day}`);
        router.refresh();
      }
    },
    [weekStartStr, recipes, router]
  );

  // Handler for updating a cook
  const handleUpdateCook = useCallback(
    async (assignmentId: string, cook: string | null) => {
      const result = await updateMealAssignment(assignmentId, { cook: cook || undefined });
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    },
    [router]
  );

  // Handler for removing a meal
  const handleRemoveMeal = useCallback(
    async (assignmentId: string) => {
      const assignment = allAssignments.find((a) => a.id === assignmentId);
      const result = await removeMealAssignment(assignmentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Removed "${assignment?.recipe.title}"`);
        router.refresh();
      }
    },
    [allAssignments, router]
  );

  // Handler for clearing a day
  const handleClearDay = useCallback(
    async (day: DayOfWeek) => {
      const result = await clearDayAssignments(weekStartStr, day);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Cleared ${day}`);
        router.refresh();
      }
    },
    [weekStartStr, router]
  );

  // Handler for copying last week
  const handleCopyLastWeek = useCallback(async () => {
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const prevWeekStr = previousWeekStart.toISOString().split("T")[0];

    const result = await copyPreviousWeek(prevWeekStr, weekStartStr);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Copied ${result.copiedCount} meals from last week`);
      router.refresh();
    }
  }, [weekStart, weekStartStr, router]);

  // Handler for clearing all meals
  const handleClearAll = useCallback(async () => {
    // Clear each day
    for (const day of DAYS_OF_WEEK) {
      await clearDayAssignments(weekStartStr, day);
    }
    toast.success("Cleared all meals");
    router.refresh();
  }, [weekStartStr, router]);

  // Handler for sending the plan
  const handleSendPlan = useCallback(async () => {
    if (allAssignments.length === 0) {
      toast.error("No meals to send");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: formatWeekRange(weekStart),
          weekStart: weekStartStr,
          items: allAssignments.map((a) => ({
            recipe: a.recipe,
            cook: a.cook,
            day: a.day_of_week,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to send plan");
      } else {
        toast.success(result.message || "Plan sent!");
      }
    } catch (error) {
      toast.error("Failed to send plan");
    } finally {
      setIsSending(false);
    }
  }, [allAssignments, weekStart, weekStartStr]);

  // Handler for downloading shopping list
  const handleDownloadList = useCallback(() => {
    if (allAssignments.length === 0) {
      toast.error("No meals to download");
      return;
    }

    // Generate simple text list
    let text = `Meal Plan - ${formatWeekRange(weekStart)}\n`;
    text += "=".repeat(40) + "\n\n";

    DAYS_OF_WEEK.forEach((day) => {
      const dayAssignments = weekPlan.assignments[day];
      if (dayAssignments.length > 0) {
        text += `${day}\n`;
        text += "-".repeat(20) + "\n";
        dayAssignments.forEach((a) => {
          text += `• ${a.recipe.title}`;
          if (a.cook) text += ` (${a.cook})`;
          text += "\n";
        });
        text += "\n";
      }
    });

    text += "\nGenerated by your meal planning app\n";

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meal-plan-${formatWeekRange(weekStart).replace(/\s/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Meal plan downloaded!");
  }, [allAssignments, weekStart, weekPlan.assignments]);

  // Handler for adding to calendar
  const handleAddToCalendar = useCallback(async () => {
    if (allAssignments.length === 0) {
      toast.error("No meals to add to calendar");
      return;
    }

    setIsAddingToCalendar(true);
    try {
      const response = await fetch("/api/google-calendar/create-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: formatWeekRange(weekStart),
          items: allAssignments.map((a) => ({
            recipe: a.recipe,
            cook: a.cook,
            day: a.day_of_week,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to add to calendar");
      } else if (result.eventsCreated > 0) {
        toast.success(`Created ${result.eventsCreated} calendar events!`);
      } else {
        toast.info("No events created. Check Google Calendar connection in Settings.");
      }
    } catch (error) {
      toast.error("Failed to add to calendar");
    } finally {
      setIsAddingToCalendar(false);
    }
  }, [allAssignments, weekStart]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const assignment = allAssignments.find((a) => a.id === active.id);
    if (assignment) {
      setActiveAssignment(assignment);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over?.data.current?.type === "day") {
      setOverDay(over.data.current.day as DayOfWeek);
    } else {
      setOverDay(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAssignment(null);
    setOverDay(null);

    if (!over) return;

    // If dropped on a day column
    if (over.data.current?.type === "day") {
      const newDay = over.data.current.day as DayOfWeek;
      const assignment = allAssignments.find((a) => a.id === active.id);

      if (assignment && assignment.day_of_week !== newDay) {
        const result = await updateMealAssignment(assignment.id, {
          day_of_week: newDay,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Moved to ${newDay}`);
          router.refresh();
        }
      }
    }
  };

  const hasMeals = allAssignments.length > 0;

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {/* Header */}
          <div ref={headerRef}>
            <PlannerHeader
              weekStart={weekStart}
              onCopyLastWeek={handleCopyLastWeek}
              onClearAll={handleClearAll}
              onSendPlan={handleSendPlan}
              hasMeals={hasMeals}
              previousWeekMealCount={previousWeekMealCount}
              isSending={isSending}
            />
          </div>

          {/* Sticky Week Navigation */}
          {showStickyNav && (
            <div className="hidden md:block fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-semibold min-w-[180px] text-center">
                    {formatWeekRange(weekStart)}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {!isCurrentWeek && (
                  <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
                    Go to This Week
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Horizontal Rows */}
          <div className="hidden md:flex md:flex-col gap-3">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = new Date(weekStart);
              dayDate.setDate(dayDate.getDate() + index);

              return (
                <PlannerDayRow
                  key={day}
                  day={day}
                  date={dayDate}
                  assignments={weekPlan.assignments[day]}
                  recipes={recipes}
                  favorites={favorites}
                  recentRecipeIds={recentRecipeIds}
                  suggestedRecipeIds={suggestedRecipeIds}
                  cookNames={cookNames}
                  cookColors={cookColors}
                  userAllergenAlerts={userAllergenAlerts}
                  isCalendarExcluded={calendarExcludedDays.includes(day)}
                  googleConnected={googleConnected}
                  onAddMeal={handleAddMeal}
                  onUpdateCook={handleUpdateCook}
                  onRemoveMeal={handleRemoveMeal}
                  isOver={overDay === day}
                />
              );
            })}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden">
            <Accordion type="multiple" className="space-y-0">
              {DAYS_OF_WEEK.map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + index);

                return (
                  <MobileDayAccordion
                    key={day}
                    day={day}
                    date={dayDate}
                    assignments={weekPlan.assignments[day]}
                    recipes={recipes}
                    favorites={favorites}
                    recentRecipeIds={recentRecipeIds}
                    cookNames={cookNames}
                    isCalendarExcluded={calendarExcludedDays.includes(day)}
                    googleConnected={googleConnected}
                    onAddMeal={handleAddMeal}
                    onUpdateCook={handleUpdateCook}
                    onRemoveMeal={handleRemoveMeal}
                    onClearDay={handleClearDay}
                  />
                );
              })}
            </Accordion>
          </div>

          {/* Summary Footer */}
          <PlannerSummary
            assignments={allAssignments}
            weekStartStr={weekStartStr}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeAssignment && (
            <MealCellOverlay assignment={activeAssignment} />
          )}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>
  );
}

