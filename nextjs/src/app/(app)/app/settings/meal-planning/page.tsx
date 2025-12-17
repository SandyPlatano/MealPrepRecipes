"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleCalendarButton } from "@/components/settings/google-calendar-button";
import { MealTypeCustomizationSettings } from "@/components/settings/meal-type-customization";
import type { PlannerViewDensity } from "@/types/settings";

const DENSITY_OPTIONS: { value: PlannerViewDensity; label: string; description: string }[] = [
  { value: "compact", label: "Compact", description: "Minimal spacing" },
  { value: "comfortable", label: "Comfortable", description: "Balanced spacing" },
  { value: "spacious", label: "Spacious", description: "More breathing room" },
];

export default function MealPlanningSettingsPage() {
  const { plannerViewSettings, mealTypeSettings, updatePlannerSettings } = useSettings();
  const router = useRouter();
  const [googleAccount, setGoogleAccount] = useState<string | null>(null);

  const handleGoogleConnectionChange = useCallback(() => {
    // Refresh page to get updated connection status
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Meal Planning"
        description="Customize your meal planner and calendar settings"
      />

      {/* Planner View */}
      <SettingSection title="Planner View">
        <SettingRow
          id="setting-planner-view-density"
          label="View Density"
          description="How compact the meal planner appears"
        >
          <Select
            value={plannerViewSettings?.density || "comfortable"}
            onValueChange={(value: PlannerViewDensity) => {
              updatePlannerSettings({ density: value });
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DENSITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-show-meal-headers"
          label="Show Meal Type Headers"
          description="Display headers like Breakfast, Lunch, Dinner"
        >
          <Switch
            id="setting-show-meal-headers-control"
            checked={plannerViewSettings?.showMealTypeHeaders ?? true}
            onCheckedChange={(checked) => {
              updatePlannerSettings({ showMealTypeHeaders: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          id="setting-show-nutrition-badges"
          label="Show Nutrition Badges"
          description="Display calorie and macro badges on recipes"
        >
          <Switch
            id="setting-show-nutrition-badges-control"
            checked={plannerViewSettings?.showNutritionBadges ?? true}
            onCheckedChange={(checked) => {
              updatePlannerSettings({ showNutritionBadges: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          id="setting-show-prep-time"
          label="Show Prep Time"
          description="Display preparation time on recipe cards"
        >
          <Switch
            id="setting-show-prep-time-control"
            checked={plannerViewSettings?.showPrepTime ?? true}
            onCheckedChange={(checked) => {
              updatePlannerSettings({ showPrepTime: checked });
            }}
          />
        </SettingRow>
      </SettingSection>

      {/* Meal Types */}
      <SettingSection title="Meal Types">
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            Customize emojis, colors, and default calendar times for each meal type.
          </p>
          <MealTypeCustomizationSettings initialSettings={mealTypeSettings || undefined} />
        </div>
      </SettingSection>

      {/* Calendar Integration */}
      <SettingSection title="Calendar Integration">
        <SettingRow
          id="setting-google-calendar"
          label="Google Calendar"
          description="Sync meals to your Google Calendar"
        >
          <GoogleCalendarButton
            connectedAccount={googleAccount}
            onConnectionChange={handleGoogleConnectionChange}
          />
        </SettingRow>
      </SettingSection>

      {/* Advanced */}
      <AdvancedToggle>
        <SettingSection title="Advanced Meal Planning">
          <SettingRow
            id="setting-custom-meal-types"
            label="Custom Meal Types"
            description="Create your own meal categories"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-custom-recipe-types"
            label="Custom Recipe Types"
            description="Create custom recipe categories"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-serving-presets"
            label="Serving Size Presets"
            description="Quick-select serving sizes"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
