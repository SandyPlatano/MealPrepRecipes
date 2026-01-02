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
        "bg-[#D9F99D] text-[#1A1A1A] rounded-lg p-3 md:p-4 shadow-md",
        "animate-in slide-in-from-top-2 fade-in-0 duration-200",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white/60 text-[#1A1A1A]">
            {selectedDays.size} day{selectedDays.size !== 1 ? "s" : ""} selected
          </Badge>
          {totalMeals > 0 && (
            <span className="text-sm text-[#1A1A1A]/70">
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
              className="text-[#1A1A1A] hover:bg-white/30"
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
                className="text-[#1A1A1A] hover:bg-white/30"
              >
                <Copy className="size-4 mr-1.5" />
                Copy to Next Week
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelected}
                disabled={isPending || totalMeals === 0}
                className="text-[#1A1A1A] hover:bg-red-400/40"
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
            className="text-[#1A1A1A] hover:bg-white/30"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
