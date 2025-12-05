"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Download,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Utensils,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealAssignmentWithRecipe } from "@/types/meal-plan";

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  onDownloadList: () => void;
  onAddToCalendar: () => Promise<void>;
  isAddingToCalendar?: boolean;
}

export function PlannerSummary({
  assignments,
  onDownloadList,
  onAddToCalendar,
  isAddingToCalendar = false,
}: PlannerSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique ingredients from all assigned recipes
  const allIngredients = useMemo(() => {
    const ingredientSet = new Set<string>();
    assignments.forEach((assignment) => {
      // We'd need to fetch full recipe data for ingredients
      // For now, we'll just count the assignments
    });
    return Array.from(ingredientSet);
  }, [assignments]);

  const totalMeals = assignments.length;
  const assignedWithCook = assignments.filter((a) => a.cook).length;

  if (totalMeals === 0) {
    return null;
  }

  return (
    <Card className="border-t-0 rounded-t-none">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardContent className="p-4">
          {/* Summary Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{totalMeals}</strong> meal{totalMeals !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {assignedWithCook}/{totalMeals} with cooks assigned
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadList}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download List</span>
                <span className="sm:hidden">Download</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onAddToCalendar}
                disabled={isAddingToCalendar}
                className="gap-2"
              >
                {isAddingToCalendar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Add to Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </Button>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  Preview
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Expandable Shopping List Preview */}
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Planned Meals</h4>
              <ScrollArea className="h-40">
                <div className="space-y-2 pr-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                    >
                      <div>
                        <span className="font-medium">
                          {assignment.recipe.title}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({assignment.day_of_week})
                        </span>
                      </div>
                      {assignment.cook && (
                        <span className="text-xs text-muted-foreground">
                          {assignment.cook}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

