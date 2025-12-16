"use client";

import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from "react";
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
import { Loader2 } from "lucide-react";
import { PlannerHeader } from "./planner-header";
import { PlannerSummary } from "./planner-summary";
import { MealCellOverlay } from "./meal-cell";
import { PlannerDayRow } from "./planner-day-row";
import { DayNavigation } from "./day-navigation";
import {
  addMealAssignment,
  removeMealAssignment,
  updateMealAssignment,
  clearDayAssignments,
} from "@/app/actions/meal-plans";
import { copyPreviousWeek } from "@/app/actions/meal-plan-suggestions";
import { toast } from "sonner";
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

import type { SubscriptionTier } from "@/types/subscription";
import type { RecipeNutrition, WeeklyMacroDashboard, MacroGoals } from "@/types/nutrition";

interface MealPlannerGridProps {
  weekStartStr: string;
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
  subscriptionTier?: SubscriptionTier;
  aiQuotaRemaining?: number | null;
  existingMealDays?: string[];
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
  canNavigateWeeks?: boolean;
}

export function MealPlannerGrid({
  weekStartStr,
  weekPlan,
  recipes,
  cookNames,
  cookColors,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userAllergenAlerts = [],
  calendarExcludedDays = [],
  googleConnected = false,
  favorites,
  recentRecipeIds,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  suggestedRecipeIds,
  previousWeekMealCount,
  subscriptionTier = 'free',
  aiQuotaRemaining = null,
  existingMealDays = [],
  nutritionEnabled = false,
  nutritionData = null,
  weeklyNutritionDashboard = null,
  macroGoals = null,
  canNavigateWeeks = false,
}: MealPlannerGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAssignment, setActiveAssignment] = useState<MealAssignmentWithRecipe | null>(null);
  const [, setOverDay] = useState<DayOfWeek | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Optimistic state for cook assignments (instant UI feedback)
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});

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

  // Apply optimistic cook values to assignments for instant UI feedback
  const assignmentsWithOptimisticCooks = useMemo(() => {
    const result: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {} as Record<DayOfWeek, MealAssignmentWithRecipe[]>;
    for (const day of DAYS_OF_WEEK) {
      result[day] = (weekPlan.assignments[day] || []).map(assignment => {
        if (assignment.id in optimisticCooks) {
          return {
            ...assignment,
            cook: optimisticCooks[assignment.id],
          };
        }
        return assignment;
      });
    }
    return result;
  }, [weekPlan.assignments, optimisticCooks]);

  // Get all assignments as a flat array (with optimistic values)
  const allAssignments = useMemo(() => {
    return Object.values(assignmentsWithOptimisticCooks).flat();
  }, [assignmentsWithOptimisticCooks]);

  // Calculate meal counts per day for the navigation
  const mealCounts = useMemo(() => {
    const counts: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>;
    for (const day of DAYS_OF_WEEK) {
      counts[day] = assignmentsWithOptimisticCooks[day]?.length || 0;
    }
    return counts;
  }, [assignmentsWithOptimisticCooks]);

  // Create a Date object for display purposes (e.g., formatWeekRange)
  // Use 'T00:00:00' to ensure consistent parsing across timezones
  const weekStartDate = new Date(weekStartStr + "T00:00:00");

  // Week navigation handlers
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    const newDate = new Date(weekStartStr + "T00:00:00");
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  }, [weekStartStr, router]);

  const goToCurrentWeek = useCallback(() => {
    const currentWeek = getWeekStart(new Date());
    const weekStr = currentWeek.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  }, [router]);

  // Track mounted state to avoid hydration mismatch with date calculations
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Defer isCurrentWeek calculation to avoid hydration mismatch
  const isCurrentWeek = isMounted
    ? weekStartStr === getWeekStart(new Date()).toISOString().split("T")[0]
    : false;

  // Handler for adding a meal
  const handleAddMeal = useCallback(
    async (recipeId: string, day: DayOfWeek, cook?: string) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      startTransition(async () => {
        const result = await addMealAssignment(weekStartStr, recipeId, day, cook);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Added "${recipe?.title}" to ${day}`);
        }
      });
    },
    [weekStartStr, recipes]
  );

  // Handler for updating a cook with optimistic updates
  const handleUpdateCook = useCallback(
    async (assignmentId: string, cook: string | null) => {
      // Optimistically update local state immediately for instant UI feedback
      setOptimisticCooks(prev => ({ ...prev, [assignmentId]: cook }));

      startTransition(async () => {
        const result = await updateMealAssignment(assignmentId, { cook: cook || undefined });
        if (result.error) {
          // Rollback optimistic update on error
          setOptimisticCooks(prev => {
            const next = { ...prev };
            delete next[assignmentId];
            return next;
          });
          toast.error(result.error);
        }
      });
    },
    []
  );

  // Handler for removing a meal
  const handleRemoveMeal = useCallback(
    async (assignmentId: string) => {
      const assignment = allAssignments.find((a) => a.id === assignmentId);
      startTransition(async () => {
        const result = await removeMealAssignment(assignmentId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Removed "${assignment?.recipe.title}"`);
        }
      });
    },
    [allAssignments]
  );

  // Handler for copying last week
  const handleCopyLastWeek = useCallback(async () => {
    const previousWeekStart = new Date(weekStartStr + "T00:00:00");
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const prevWeekStr = previousWeekStart.toISOString().split("T")[0];

    startTransition(async () => {
      const result = await copyPreviousWeek(prevWeekStr, weekStartStr);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Copied ${result.copiedCount} meals from last week`);
      }
    });
  }, [weekStartStr]);

  // Handler for clearing all meals
  const handleClearAll = useCallback(async () => {
    startTransition(async () => {
      // Clear each day
      for (const day of DAYS_OF_WEEK) {
        await clearDayAssignments(weekStartStr, day);
      }
      toast.success("Cleared all meals");
    });
  }, [weekStartStr]);

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
          weekRange: formatWeekRange(weekStartDate),
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
    } catch {
      toast.error("Failed to send plan");
    } finally {
      setIsSending(false);
    }
  }, [allAssignments, weekStartDate, weekStartStr]);


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
        startTransition(async () => {
          const result = await updateMealAssignment(assignment.id, {
            day_of_week: newDay,
          });
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(`Moved to ${newDay}`);
          }
        });
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
        {/* Loading Indicator */}
        {isPending && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Updating...</span>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Header */}
          <div ref={headerRef} className={isPending ? "opacity-75 pointer-events-none" : ""}>
            <PlannerHeader
              weekStartStr={weekStartStr}
              onCopyLastWeek={handleCopyLastWeek}
              onClearAll={handleClearAll}
              onSendPlan={handleSendPlan}
              hasMeals={hasMeals}
              previousWeekMealCount={previousWeekMealCount}
              isSending={isSending}
              currentWeekMealCount={allAssignments.length}
              subscriptionTier={subscriptionTier}
              aiQuotaRemaining={aiQuotaRemaining}
              existingMealDays={existingMealDays}
              canNavigateWeeks={canNavigateWeeks}
            />
          </div>

          {/* Sticky Day Navigation */}
          <DayNavigation
            weekStartDate={weekStartDate}
            weekStartStr={weekStartStr}
            mealCounts={mealCounts}
            onNavigateWeek={navigateWeek}
            onGoToCurrentWeek={goToCurrentWeek}
            canNavigateWeeks={canNavigateWeeks}
            isVisible={showStickyNav}
          />

          {/* Vertical Stacked Cards */}
          <div className={`space-y-2 transition-opacity ${isPending ? "opacity-60" : ""}`}>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = new Date(weekStartDate);
              dayDate.setDate(dayDate.getDate() + index);

              return (
                <PlannerDayRow
                  key={day}
                  day={day}
                  date={dayDate}
                  assignments={assignmentsWithOptimisticCooks[day]}
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
                  nutritionData={nutritionData}
                />
              );
            })}
          </div>

          {/* Summary Footer */}
          <PlannerSummary
            assignments={allAssignments}
            weekStartStr={weekStartStr}
            cookColors={cookColors}
            nutritionEnabled={nutritionEnabled}
            nutritionData={nutritionData}
            weeklyNutritionDashboard={weeklyNutritionDashboard}
            macroGoals={macroGoals}
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

