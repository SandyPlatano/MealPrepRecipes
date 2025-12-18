"use client";

import { useState, useCallback, useEffect } from "react";
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
import { SpoonSelector } from "@/components/energy-mode";
import type { PlannerViewDensity } from "@/types/settings";
import type { EnergyLevel } from "@/types/energy-mode";
import { ENERGY_LEVEL_LABELS, ENERGY_LEVEL_DESCRIPTIONS } from "@/types/energy-mode";

const DENSITY_OPTIONS: { value: PlannerViewDensity; label: string; description: string }[] = [
  { value: "compact", label: "Compact", description: "Minimal spacing" },
  { value: "comfortable", label: "Comfortable", description: "Balanced spacing" },
  { value: "spacious", label: "Spacious", description: "More breathing room" },
];

export default function MealPlanningSettingsPage() {
  const {
    plannerViewSettings,
    mealTypeSettings,
    preferencesV2,
    updatePlannerSettings,
    updateEnergyModePrefs,
  } = useSettings();
  const [googleAccount, setGoogleAccount] = useState<string | null>(null);

  // Energy mode preferences
  const energyPrefs = preferencesV2.energyMode;

  // Fetch Google Calendar connection status
  const fetchGoogleStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/google-calendar/status");
      if (response.ok) {
        const data = await response.json();
        setGoogleAccount(data.connectedAccount);
      }
    } catch (error) {
      console.error("Failed to fetch Google Calendar status:", error);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchGoogleStatus();
  }, [fetchGoogleStatus]);

  const handleGoogleConnectionChange = useCallback(() => {
    fetchGoogleStatus();
  }, [fetchGoogleStatus]);

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

      {/* Energy Mode / Spoons */}
      <SettingSection
        title="Energy Mode"
        badge="New"
        description="Adapt meal suggestions based on your daily energy levels (Spoon Theory)"
      >
        <SettingRow
          id="setting-energy-mode-enabled"
          label="Enable Energy Mode"
          description="Show daily energy check-in and filter recipes by complexity"
        >
          <Switch
            id="setting-energy-mode-enabled-control"
            checked={energyPrefs.enabled}
            onCheckedChange={(checked) => {
              updateEnergyModePrefs({ enabled: checked });
            }}
          />
        </SettingRow>

        {energyPrefs.enabled && (
          <>
            <SettingRow
              id="setting-energy-default-level"
              label="Default Energy Level"
              description={`${ENERGY_LEVEL_LABELS[energyPrefs.defaultEnergyLevel]}: ${ENERGY_LEVEL_DESCRIPTIONS[energyPrefs.defaultEnergyLevel]}`}
            >
              <SpoonSelector
                value={energyPrefs.defaultEnergyLevel}
                onChange={(level: EnergyLevel) => {
                  updateEnergyModePrefs({ defaultEnergyLevel: level });
                }}
                displayMode={energyPrefs.displayMode}
                size="sm"
              />
            </SettingRow>

            <SettingRow
              id="setting-energy-display-mode"
              label="Display Style"
              description="How energy levels are shown"
            >
              <Select
                value={energyPrefs.displayMode}
                onValueChange={(value: "spoons" | "simple") => {
                  updateEnergyModePrefs({ displayMode: value });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spoons">Spoons 🥄</SelectItem>
                  <SelectItem value="simple">Numbers</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-energy-daily-prompt"
              label="Show Daily Prompt"
              description="Ask how you're feeling when opening the planner"
            >
              <Switch
                id="setting-energy-daily-prompt-control"
                checked={energyPrefs.showDailyPrompt}
                onCheckedChange={(checked) => {
                  updateEnergyModePrefs({ showDailyPrompt: checked });
                }}
              />
            </SettingRow>
          </>
        )}
      </SettingSection>

      {/* Meal Types */}
      <SettingSection title="Meal Types">
        <div id="setting-meal-type-emojis" className="py-2">
          <p id="setting-meal-type-colors" className="text-sm text-muted-foreground mb-4">
            Customize emojis, colors, and default calendar times for each meal type.
          </p>
          <div id="setting-meal-type-times">
            <MealTypeCustomizationSettings initialSettings={mealTypeSettings || undefined} />
          </div>
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
            id="setting-default-serving-size"
            label="Default Serving Size"
            description="Default number of servings for new recipes"
          >
            <div className="text-sm text-muted-foreground">4 servings</div>
          </SettingRow>

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

        <SettingSection title="Calendar Settings">
          <SettingRow
            id="setting-calendar-event-time"
            label="Default Event Time"
            description="When calendar events start by default"
          >
            <div className="text-sm text-muted-foreground">12:00 PM</div>
          </SettingRow>

          <SettingRow
            id="setting-calendar-event-duration"
            label="Event Duration"
            description="How long calendar events last"
          >
            <div className="text-sm text-muted-foreground">1 hour</div>
          </SettingRow>

          <SettingRow
            id="setting-calendar-excluded-days"
            label="Excluded Days"
            description="Days to skip when creating events"
          >
            <div className="text-sm text-muted-foreground">None</div>
          </SettingRow>
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
