"use client";

import { useState, useEffect, useCallback } from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getDifficultyThresholds,
  updateDifficultyThresholds,
  resetDifficultyThresholds,
} from "@/app/actions/settings";
import { useDifficultyThresholds } from "@/contexts/difficulty-thresholds-context";
import type { DifficultyThresholds } from "@/types/settings";
import { DEFAULT_DIFFICULTY_THRESHOLDS } from "@/types/settings";

export default function DifficultySettingsPage() {
  const { refresh: refreshContext } = useDifficultyThresholds();
  const [thresholds, setThresholds] = useState<DifficultyThresholds>(
    DEFAULT_DIFFICULTY_THRESHOLDS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch thresholds on mount
  useEffect(() => {
    async function fetchThresholds() {
      const result = await getDifficultyThresholds();
      if (result.data) {
        setThresholds(result.data);
      }
      setIsLoading(false);
    }
    fetchThresholds();
  }, []);

  // Debounced save
  const saveThresholds = useCallback(
    async (newThresholds: DifficultyThresholds) => {
      setIsSaving(true);
      const result = await updateDifficultyThresholds(newThresholds);
      setIsSaving(false);
      if (result.error) {
        toast.error("Failed to save settings");
      } else {
        toast.success("Settings saved");
        // Refresh context so other components (like recipe cards) update
        await refreshContext();
      }
    },
    [refreshContext]
  );

  // Handle threshold changes with auto-save
  const handleChange = useCallback(
    (
      category: keyof DifficultyThresholds,
      field: "easyMax" | "mediumMax",
      value: number
    ) => {
      const newThresholds = {
        ...thresholds,
        [category]: {
          ...thresholds[category],
          [field]: value,
        },
      };
      setThresholds(newThresholds);
      saveThresholds(newThresholds);
    },
    [thresholds, saveThresholds]
  );

  // Reset to defaults
  const handleReset = useCallback(async () => {
    setIsSaving(true);
    const result = await resetDifficultyThresholds();
    setIsSaving(false);
    if (result.error) {
      toast.error("Failed to reset settings");
    } else {
      setThresholds(DEFAULT_DIFFICULTY_THRESHOLDS);
      toast.success("Reset to defaults");
      // Refresh context so other components update
      await refreshContext();
    }
  }, [refreshContext]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <SettingsHeader
          title="Difficulty Settings"
          description="Customize how recipe difficulty is calculated"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SettingsHeader
        title="Difficulty Settings"
        description="Customize how recipe difficulty is calculated based on time, ingredients, and steps"
      />

      {/* How it works */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Gauge className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">How Difficulty Works</p>
            <ul className="text-xs text-muted-foreground flex flex-col gap-1">
              <li>
                • Recipes are rated <span className="text-green-600 dark:text-green-400 font-medium">Easy</span>,{" "}
                <span className="text-amber-600 dark:text-amber-400 font-medium">Medium</span>, or{" "}
                <span className="text-red-600 dark:text-red-400 font-medium">Hard</span> based on three factors
              </li>
              <li>• The <strong>hardest</strong> factor determines the overall difficulty</li>
              <li>• Adjust the thresholds below to match your skill level</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Time Thresholds */}
      <SettingSection
        title="Time Thresholds"
        description="Based on total time (prep + cook)"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time-easy" className="text-sm flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">Easy</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="time-easy"
                type="number"
                min={1}
                max={thresholds.time.mediumMax - 1}
                value={thresholds.time.easyMax}
                onChange={(e) =>
                  handleChange("time", "easyMax", parseInt(e.target.value) || 1)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-medium" className="text-sm flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">Medium</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="time-medium"
                type="number"
                min={thresholds.time.easyMax + 1}
                value={thresholds.time.mediumMax}
                onChange={(e) =>
                  handleChange("time", "mediumMax", parseInt(e.target.value) || 60)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-hard" className="text-sm flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">Hard</span> if above
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="time-hard"
                type="number"
                min={thresholds.time.easyMax + 1}
                value={thresholds.time.mediumMax}
                onChange={(e) =>
                  handleChange("time", "mediumMax", parseInt(e.target.value) || 60)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Ingredient Thresholds */}
      <SettingSection
        title="Ingredient Thresholds"
        description="Based on number of ingredients"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ing-easy" className="text-sm flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">Easy</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="ing-easy"
                type="number"
                min={1}
                max={thresholds.ingredients.mediumMax - 1}
                value={thresholds.ingredients.easyMax}
                onChange={(e) =>
                  handleChange("ingredients", "easyMax", parseInt(e.target.value) || 1)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ing-medium" className="text-sm flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">Medium</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="ing-medium"
                type="number"
                min={thresholds.ingredients.easyMax + 1}
                value={thresholds.ingredients.mediumMax}
                onChange={(e) =>
                  handleChange("ingredients", "mediumMax", parseInt(e.target.value) || 15)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ing-hard" className="text-sm flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">Hard</span> if above
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="ing-hard"
                type="number"
                min={thresholds.ingredients.easyMax + 1}
                value={thresholds.ingredients.mediumMax}
                onChange={(e) =>
                  handleChange("ingredients", "mediumMax", parseInt(e.target.value) || 15)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Steps Thresholds */}
      <SettingSection
        title="Steps Thresholds"
        description="Based on number of instruction steps"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="steps-easy" className="text-sm flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">Easy</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="steps-easy"
                type="number"
                min={1}
                max={thresholds.steps.mediumMax - 1}
                value={thresholds.steps.easyMax}
                onChange={(e) =>
                  handleChange("steps", "easyMax", parseInt(e.target.value) || 1)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">steps</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="steps-medium" className="text-sm flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">Medium</span> if under
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="steps-medium"
                type="number"
                min={thresholds.steps.easyMax + 1}
                value={thresholds.steps.mediumMax}
                onChange={(e) =>
                  handleChange("steps", "mediumMax", parseInt(e.target.value) || 12)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">steps</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="steps-hard" className="text-sm flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">Hard</span> if above
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="steps-hard"
                type="number"
                min={thresholds.steps.easyMax + 1}
                value={thresholds.steps.mediumMax}
                onChange={(e) =>
                  handleChange("steps", "mediumMax", parseInt(e.target.value) || 12)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">steps</span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
