"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, RefreshCw, Lock } from "lucide-react";
// Re-export utilities for backwards compatibility
export { getWeekOptions, getUpcomingWeeks } from "./week-utils";
import { generateMultiWeekShoppingList } from "@/app/actions/shopping-list";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/subscriptions/UpgradeModal";
import type { SubscriptionTier } from "@/types/subscription";

interface WeekOption {
  weekStart: string;
  label: string;
  mealCount: number;
}

interface WeekSelectorProps {
  currentWeekStart: string;
  weekOptions: WeekOption[];
  subscriptionTier?: SubscriptionTier;
  canSelectMultiple?: boolean;
  onGenerateComplete?: () => void;
}

export function WeekSelector({
  currentWeekStart,
  weekOptions,
  subscriptionTier = 'free',
  canSelectMultiple = false,
  onGenerateComplete,
}: WeekSelectorProps) {
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([currentWeekStart]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const isPro = subscriptionTier !== 'free';

  const handleWeekToggle = (weekStart: string) => {
    if (!canSelectMultiple && weekStart !== currentWeekStart) {
      // Show upgrade prompt for free users trying to select other weeks
      setUpgradeModalOpen(true);
      return;
    }

    setSelectedWeeks((prev) => {
      if (prev.includes(weekStart)) {
        // Don't allow deselecting all weeks
        if (prev.length === 1) return prev;
        return prev.filter((w) => w !== weekStart);
      } else {
        // Limit to 4 weeks max
        if (prev.length >= 4) {
          toast.error("Maximum 4 weeks can be selected");
          return prev;
        }
        return [...prev, weekStart];
      }
    });
  };

  const handleGenerate = async () => {
    if (selectedWeeks.length === 0) {
      toast.error("Select at least one week");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMultiWeekShoppingList(selectedWeeks);

      if (result.error) {
        toast.error(result.error);
      } else {
        const weekCount = selectedWeeks.length;
        toast.success(
          `Generated shopping list from ${weekCount} week${weekCount > 1 ? "s" : ""} (${result.itemCount} items)`
        );
        onGenerateComplete?.();
      }
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("Failed to generate shopping list");
    } finally {
      setIsGenerating(false);
    }
  };

  // If only one week is available, don't show the selector
  if (weekOptions.length <= 1 && !isPro) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            Generate Shopping List
            {!canSelectMultiple && (
              <span className="text-xs font-normal text-muted-foreground ml-auto flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Pro: Multi-week
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {weekOptions.map((week) => {
              const isSelected = selectedWeeks.includes(week.weekStart);
              const isCurrentWeek = week.weekStart === currentWeekStart;
              const isDisabled = !canSelectMultiple && !isCurrentWeek;

              return (
                <div
                  key={week.weekStart}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  } ${isDisabled ? "opacity-50" : "cursor-pointer"}`}
                  onClick={() => !isDisabled && handleWeekToggle(week.weekStart)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => handleWeekToggle(week.weekStart)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {week.label}
                      {isCurrentWeek && (
                        <span className="ml-2 text-xs text-primary">(Current)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {week.mealCount} meal{week.mealCount !== 1 ? "s" : ""} planned
                    </div>
                  </div>
                  {isDisabled && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedWeeks.length === 0}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating
              ? "Generating..."
              : `Generate for ${selectedWeeks.length} Week${selectedWeeks.length > 1 ? "s" : ""}`}
          </Button>

          {selectedWeeks.length > 1 && (
            <p className="text-xs text-muted-foreground text-center">
              Ingredients from all selected weeks will be combined and merged
            </p>
          )}
        </CardContent>
      </Card>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="Multi-Week Shopping Lists"
      />
    </>
  );
}

