"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, X, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DayOfWeek } from "@/types/meal-plan";

interface BulkSelectionToolbarProps {
  selectedDays: Set<DayOfWeek>;
  mealCounts: Record<DayOfWeek, number>;
  onClearDays: (days: DayOfWeek[]) => Promise<void>;
  onCopyToNextWeek: (days: DayOfWeek[]) => Promise<void>;
  onCancel: () => void;
  onSelectAll: () => void;
  totalDays: number;
}

export function BulkSelectionToolbar({
  selectedDays,
  mealCounts,
  onClearDays,
  onCopyToNextWeek,
  onCancel,
  onSelectAll,
  totalDays,
}: BulkSelectionToolbarProps) {
  const [isPending, startTransition] = useTransition();

  // Calculate total meals in selected days
  const totalMeals = Array.from(selectedDays).reduce(
    (sum, day) => sum + (mealCounts[day] || 0),
    0
  );

  const handleClearSelected = () => {
    if (selectedDays.size === 0) return;

    startTransition(async () => {
      try {
        await onClearDays(Array.from(selectedDays));
        toast.success(`Cleared ${totalMeals} meals from ${selectedDays.size} day(s)`);
        onCancel();
      } catch {
        toast.error("Failed to clear meals");
      }
    });
  };

  const handleCopyToNextWeek = () => {
    if (totalMeals === 0) {
      toast.error("No meals to copy");
      return;
    }

    startTransition(async () => {
      try {
        await onCopyToNextWeek(Array.from(selectedDays));
        toast.success(`Copied ${totalMeals} meals to next week`);
        onCancel();
      } catch {
        toast.error("Failed to copy meals");
      }
    });
  };

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground rounded-lg p-3 md:p-4 shadow-lg",
        "animate-in slide-in-from-top-2 fade-in-0 duration-200",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
            {selectedDays.size} day{selectedDays.size !== 1 ? "s" : ""} selected
          </Badge>
          {totalMeals > 0 && (
            <span className="text-sm text-primary-foreground/80">
              ({totalMeals} meal{totalMeals !== 1 ? "s" : ""})
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedDays.size < totalDays && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <CheckSquare className="size-4 mr-1.5" />
              Select All
            </Button>
          )}

          {totalMeals > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToNextWeek}
                disabled={isPending || totalMeals === 0}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Copy className="size-4 mr-1.5" />
                Copy to Next Week
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelected}
                disabled={isPending || totalMeals === 0}
                className="text-primary-foreground hover:bg-destructive/80"
              >
                <Trash2 className="size-4 mr-1.5" />
                Clear Meals
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
