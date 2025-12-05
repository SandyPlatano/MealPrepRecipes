"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";
import { removeMealAssignment } from "@/app/actions/meal-plans";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import { useRouter } from "next/navigation";

interface DroppableDayProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  cookNames: string[];
}

export function DroppableDay({ day, date, assignments }: DroppableDayProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: day,
  });

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const isPast = date < new Date(today.setHours(0, 0, 0, 0));

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3);

  const handleRemove = async (assignmentId: string) => {
    setRemoving(assignmentId);
    await removeMealAssignment(assignmentId);
    setRemoving(null);
    router.refresh();
  };

  return (
    <Card
      ref={setNodeRef}
      className={`
        ${isToday ? "ring-2 ring-primary" : ""}
        ${isPast ? "opacity-60" : ""}
        ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}
        transition-all
      `}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>
            <span className="md:hidden">{dayAbbrev} </span>
            <span className="hidden md:inline">{day} </span>
            <span className="text-muted-foreground font-normal">{dayNumber}</span>
          </span>
          {isToday && (
            <Badge variant="default" className="text-xs">
              Today
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2 min-h-[120px]">
        {assignments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            {isOver ? (
              <p className="font-medium text-primary">Drop here!</p>
            ) : isPast ? (
              <p>No meals</p>
            ) : isToday ? (
              <p className="font-medium">Drop a recipe!</p>
            ) : (
              <p>Drag recipes here</p>
            )}
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group relative bg-secondary/50 rounded-md p-2 text-sm"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={assignment.recipe.title}>
                    {assignment.recipe.title}
                  </p>
                  {assignment.recipe.prep_time && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {assignment.recipe.prep_time}
                    </p>
                  )}
                  {assignment.cook && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cook: {assignment.cook}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(assignment.id)}
                  disabled={removing === assignment.id}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

