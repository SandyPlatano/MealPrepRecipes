"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  type WeekPlanData,
  type DayOfWeek,
  DAYS_OF_WEEK,
  formatWeekRange,
  getWeekStart,
} from "@/types/meal-plan";
import { addMealAssignment, removeMealAssignment } from "@/app/actions/meal-plans";
import { DraggableRecipe } from "./draggable-recipe";
import { DroppableDay } from "./droppable-day";
import { RecipeSidebar } from "./recipe-sidebar";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  tags?: string[];
}

interface DragDropMealPlanProps {
  weekStart: Date;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
}

export function DragDropMealPlan({
  weekStart,
  weekPlan,
  recipes,
  cookNames,
}: DragDropMealPlanProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Check if dropping a recipe onto a day
    if (over.id && typeof over.id === "string" && DAYS_OF_WEEK.includes(over.id as DayOfWeek)) {
      const recipeId = active.id as string;
      const day = over.id as DayOfWeek;
      
      // Add meal assignment
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const result = await addMealAssignment(weekStartStr, recipeId, day);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Added to meal plan!");
        router.refresh();
      }
    }

    setActiveId(null);
  };

  const activeRecipe = recipes.find((r) => r.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "Hide" : "Show"} Recipes
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-4" style={{ gridTemplateColumns: sidebarOpen ? "300px 1fr" : "1fr" }}>
          {/* Recipe Sidebar */}
          {sidebarOpen && (
            <RecipeSidebar recipes={recipes} />
          )}

          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = new Date(weekStart);
              dayDate.setDate(dayDate.getDate() + index);

              return (
                <DroppableDay
                  key={day}
                  day={day}
                  date={dayDate}
                  assignments={weekPlan.assignments[day]}
                  cookNames={cookNames}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeRecipe ? (
          <Card className="w-64 opacity-90 shadow-xl">
            <CardContent className="p-3">
              <p className="font-medium">{activeRecipe.title}</p>
              <p className="text-xs text-muted-foreground">{activeRecipe.recipe_type}</p>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

