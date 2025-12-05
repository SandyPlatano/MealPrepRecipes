"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MealPlanProvider, useMealPlanContext } from "./meal-plan-context";
import { SuggestionsRow } from "./suggestions-row";
import { TappableDayCard } from "./tappable-day-card";
import { RecipeBrowserSheet } from "./recipe-browser-sheet";
import { copyPreviousWeek } from "@/app/actions/meal-plan-suggestions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  WeekPlanData,
  DayOfWeek,
  DAYS_OF_WEEK,
} from "@/types/meal-plan";
import { getWeekStart, formatWeekRange } from "@/types/meal-plan";
import type { CompactRecipe } from "./compact-recipe-card";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

interface MealPlanRedesignProps {
  weekStart: Date;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
  recentlyCooked: CompactRecipe[];
  favorites: CompactRecipe[];
  quickMeals: CompactRecipe[];
  neverCooked: CompactRecipe[];
  previousWeekMealCount: number;
}

function MealPlanContent({
  weekStart,
  weekPlan,
  recipes,
  recentlyCooked,
  favorites,
  quickMeals,
  neverCooked,
  previousWeekMealCount,
}: MealPlanRedesignProps) {
  const router = useRouter();
  const { selectedRecipe, setSelectedRecipe, isPlacementMode } = useMealPlanContext();
  
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserDay, setBrowserDay] = useState<DayOfWeek | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWeekStart(new Date());
    const weekStr = currentWeek.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  const isCurrentWeek =
    weekStart.toISOString().split("T")[0] ===
    getWeekStart(new Date()).toISOString().split("T")[0];

  const openBrowserForDay = (day: DayOfWeek) => {
    setBrowserDay(day);
    setBrowserOpen(true);
  };

  const handleCopyPreviousWeek = async () => {
    setIsCopying(true);
    
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const prevWeekStr = previousWeekStart.toISOString().split("T")[0];
    const currentWeekStr = weekStart.toISOString().split("T")[0];

    const result = await copyPreviousWeek(prevWeekStr, currentWeekStr);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Copied ${result.copiedCount} meals from last week!`);
      router.refresh();
    }

    setIsCopying(false);
    setShowCopyDialog(false);
  };

  // Convert recipes to CompactRecipe format for the browser
  const compactRecipes: CompactRecipe[] = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    image_url: r.image_url,
    category: r.category,
  }));

  // Get quick suggestions for day cards (combine recent and favorites)
  const quickSuggestions = [...recentlyCooked, ...favorites]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .slice(0, 3);

  // Calculate previous week date range for dialog
  const previousWeekStart = new Date(weekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(previousWeekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
  const prevWeekRange = `${previousWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${prevWeekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[140px] text-center font-mono">
            {formatWeekRange(weekStart)}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
          )}
          
          {/* Copy Previous Week Button */}
          {previousWeekMealCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCopyDialog(true)}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Last Week</span>
              <span className="sm:hidden">Copy</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selection Mode Banner */}
      {isPlacementMode && selectedRecipe && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm">
              <strong>{selectedRecipe.title}</strong> selected — tap a day to add
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRecipe(null)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Suggestions Row */}
      <SuggestionsRow
        recentlyCooked={recentlyCooked}
        favorites={favorites}
        quickMeals={quickMeals}
        neverCooked={neverCooked}
        selectedRecipeId={selectedRecipe?.id || null}
        onSelectRecipe={setSelectedRecipe}
      />

      {/* Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {DAYS.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + index);

          return (
            <TappableDayCard
              key={day}
              day={day}
              date={dayDate}
              assignments={weekPlan.assignments[day]}
              weekStart={weekStart.toISOString().split("T")[0]}
              suggestedRecipes={quickSuggestions}
              onOpenBrowser={() => openBrowserForDay(day)}
            />
          );
        })}
      </div>

      {/* Recipe Browser Sheet */}
      <RecipeBrowserSheet
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        recipes={compactRecipes}
        selectedDay={browserDay}
        weekStart={weekStart.toISOString().split("T")[0]}
      />

      {/* Copy Previous Week Dialog */}
      <AlertDialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Last Week&apos;s Meals?</AlertDialogTitle>
            <AlertDialogDescription>
              This will copy {previousWeekMealCount} meal{previousWeekMealCount !== 1 ? "s" : ""} from {prevWeekRange} to this week.
              Any existing meals will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCopying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCopyPreviousWeek}
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copy {previousWeekMealCount} Meal{previousWeekMealCount !== 1 ? "s" : ""}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Wrapper with context provider
export function MealPlanRedesign(props: MealPlanRedesignProps) {
  return (
    <MealPlanProvider>
      <MealPlanContent {...props} />
    </MealPlanProvider>
  );
}

