"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { moveAssignment } from "@/app/actions/meal-plans";
import { toast } from "sonner";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";

interface PlannerDndContextProps {
  children: React.ReactNode;
  assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]>;
}

interface DragItem {
  assignmentId: string;
  recipeTitle: string;
  sourceDay: DayOfWeek;
}

export function PlannerDndContext({
  children,
  assignments,
}: PlannerDndContextProps) {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  // Configure sensors with activation constraints for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Small delay to distinguish drag from click
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        // Long press for touch devices
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const assignmentId = active.id as string;

    // Find the assignment and its source day
    for (const [day, dayAssignments] of Object.entries(assignments)) {
      const assignment = dayAssignments.find((a) => a.id === assignmentId);
      if (assignment) {
        setActiveItem({
          assignmentId: assignment.id,
          recipeTitle: assignment.recipe.title,
          sourceDay: day as DayOfWeek,
        });
        break;
      }
    }
  }, [assignments]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);

    if (!over) return;

    const assignmentId = active.id as string;
    const targetDay = over.id as DayOfWeek;

    // Find source day
    let sourceDay: DayOfWeek | null = null;
    for (const [day, dayAssignments] of Object.entries(assignments)) {
      if (dayAssignments.some((a) => a.id === assignmentId)) {
        sourceDay = day as DayOfWeek;
        break;
      }
    }

    // Only move if dropped on a different day
    if (sourceDay && targetDay !== sourceDay) {
      const assignment = assignments[sourceDay].find((a) => a.id === assignmentId);
      const result = await moveAssignment(assignmentId, targetDay);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Moved "${assignment?.recipe.title}" to ${targetDay}`);
      }
    }
  }, [assignments]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div className="bg-card border shadow-lg rounded-lg p-3 opacity-90 max-w-[250px]">
            <p className="font-medium truncate">{activeItem.recipeTitle}</p>
            <p className="text-xs text-muted-foreground">
              Moving from {activeItem.sourceDay}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
