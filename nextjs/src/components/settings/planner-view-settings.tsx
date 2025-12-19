"use client";

/**
 * Planner View Settings Section
 * Component for settings page to configure meal planner display preferences
 * Includes density selection and visibility toggles
 */

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidersHorizontal, RotateCcw, Columns3, Eye, Clock, Utensils } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  updatePlannerViewSettings,
  resetPlannerViewSettings,
} from "@/app/actions/settings";
import type { PlannerViewSettings, PlannerViewDensity } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";

interface PlannerViewSettingsProps {
  initialSettings?: PlannerViewSettings;
}

const DENSITY_OPTIONS: { value: PlannerViewDensity; label: string; description: string }[] = [
  { value: "compact", label: "Compact", description: "Minimal spacing for more info" },
  { value: "comfortable", label: "Comfortable", description: "Balanced spacing (default)" },
  { value: "spacious", label: "Spacious", description: "More breathing room" },
];

export function PlannerViewSettingsSection({ initialSettings }: PlannerViewSettingsProps) {
  const [settings, setSettings] = useState<PlannerViewSettings>(
    initialSettings || DEFAULT_PLANNER_VIEW_SETTINGS
  );
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);

  // Handle density change
  const handleDensityChange = (density: PlannerViewDensity) => {
    const updated = { ...settings, density };
    setSettings(updated);

    startTransition(async () => {
      const result = await updatePlannerViewSettings({ density });
      if (result.error) {
        // Rollback on error
        setSettings(settings);
        toast.error("Failed to update display density");
      } else {
        toast.success("Display density updated");
      }
    });
  };

  // Handle visibility toggle
  const handleToggle = (
    key: "showMealTypeHeaders" | "showNutritionBadges" | "showPrepTime"
  ) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);

    startTransition(async () => {
      const result = await updatePlannerViewSettings({ [key]: updated[key] });
      if (result.error) {
        // Rollback on error
        setSettings(settings);
        toast.error("Failed to update setting");
      }
    });
  };

  // Reset to defaults
  const handleReset = async () => {
    setIsResetting(true);
    const result = await resetPlannerViewSettings();
    setIsResetting(false);

    if (result.error) {
      toast.error("Failed to reset settings");
      return;
    }

    setSettings(DEFAULT_PLANNER_VIEW_SETTINGS);
    toast.success("Planner view reset to defaults");
  };

  // Check if settings differ from defaults
  const hasChanges =
    settings.density !== DEFAULT_PLANNER_VIEW_SETTINGS.density ||
    settings.showMealTypeHeaders !== DEFAULT_PLANNER_VIEW_SETTINGS.showMealTypeHeaders ||
    settings.showNutritionBadges !== DEFAULT_PLANNER_VIEW_SETTINGS.showNutritionBadges ||
    settings.showPrepTime !== DEFAULT_PLANNER_VIEW_SETTINGS.showPrepTime;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-5" />
              Meal Planner View
            </CardTitle>
            <CardDescription>
              Customize how the meal planner displays your weekly meals
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Density Selection */}
        <div className="flex flex-col gap-3">
          <Label className="flex items-center gap-2">
            <Columns3 className="size-4" />
            Display Density
          </Label>
          <RadioGroup
            value={settings.density}
            onValueChange={(value) => handleDensityChange(value as PlannerViewDensity)}
            className="grid gap-3"
          >
            {DENSITY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center flex gap-3">
                <RadioGroupItem
                  value={option.value}
                  id={`density-${option.value}`}
                  disabled={isPending}
                />
                <Label
                  htmlFor={`density-${option.value}`}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
                    settings.density === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Visibility Toggles */}
        <div className="flex flex-col gap-4">
          <Label className="flex items-center gap-2">
            <Eye className="size-4" />
            Show / Hide Elements
          </Label>

          <div className="flex flex-col gap-3">
            {/* Meal Type Headers */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Utensils className="size-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="show-meal-type-headers" className="cursor-pointer">
                    Meal Type Headers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show Breakfast, Lunch, Dinner groupings
                  </p>
                </div>
              </div>
              <Switch
                id="show-meal-type-headers"
                checked={settings.showMealTypeHeaders}
                onCheckedChange={() => handleToggle("showMealTypeHeaders")}
                disabled={isPending}
              />
            </div>

            {/* Nutrition Badges */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 text-muted-foreground flex items-center justify-center">
                  <span className="text-xs font-bold">N</span>
                </div>
                <div>
                  <Label htmlFor="show-nutrition-badges" className="cursor-pointer">
                    Nutrition Information
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display calorie and macro badges on recipes
                  </p>
                </div>
              </div>
              <Switch
                id="show-nutrition-badges"
                checked={settings.showNutritionBadges}
                onCheckedChange={() => handleToggle("showNutritionBadges")}
                disabled={isPending}
              />
            </div>

            {/* Prep Time */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="show-prep-time" className="cursor-pointer">
                    Prep Time
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show preparation time for each recipe
                  </p>
                </div>
              </div>
              <Switch
                id="show-prep-time"
                checked={settings.showPrepTime}
                onCheckedChange={() => handleToggle("showPrepTime")}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            These settings also apply to the quick toggle in the planner header
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isPending || isResetting || !hasChanges}
          >
            <RotateCcw className="size-3 mr-1.5" />
            {isResetting ? "Resetting..." : "Reset to Defaults"}
          </Button>
        </div>

        {/* Saving indicator */}
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
