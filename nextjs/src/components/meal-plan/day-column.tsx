"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Clock } from "lucide-react";
import { removeMealAssignment } from "@/app/actions/meal-plans";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";

interface DayColumnProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  onAddClick: () => void;
}

export function DayColumn({
  day,
  date,
  assignments,
  onAddClick,
}: DayColumnProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  // Check if this day is today
  const today = new Date();
  const isToday =
    date.toDateString() === today.toDateString();

  // Check if this day is in the past
  const isPast = date < new Date(today.setHours(0, 0, 0, 0));

  const handleRemove = async (assignmentId: string) => {
    setRemoving(assignmentId);
    await removeMealAssignment(assignmentId);
    setRemoving(null);
  };

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3);

  return (
    <Card className={`${isToday ? "ring-2 ring-primary" : ""} ${isPast ? "opacity-60" : ""}`}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>
            <span className="md:hidden">{dayAbbrev} </span>
            <span className="hidden md:inline">{day} </span>
            <span className="text-muted-foreground font-normal">{dayNumber}</span>
          </span>
          {isToday && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {/* Assignments */}
        {assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No meals planned
          </p>
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

        {/* Add Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={onAddClick}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </CardContent>
    </Card>
  );
}
