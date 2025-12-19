"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";
import { updatePlannerViewSettings } from "@/app/actions/settings";
import type { PlannerViewSettings, PlannerViewDensity } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";

interface PlannerViewToggleProps {
  settings: PlannerViewSettings;
  onChange?: (settings: PlannerViewSettings) => void;
}

export function PlannerViewToggle({
  settings,
  onChange,
}: PlannerViewToggleProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isPending, startTransition] = useTransition();

  const handleDensityChange = (density: string) => {
    const newDensity = density as PlannerViewDensity;
    const updated = { ...localSettings, density: newDensity };
    setLocalSettings(updated);
    onChange?.(updated);

    startTransition(async () => {
      await updatePlannerViewSettings({ density: newDensity });
    });
  };

  const handleVisibilityToggle = (
    key: "showMealTypeHeaders" | "showNutritionBadges" | "showPrepTime"
  ) => {
    const updated = {
      ...localSettings,
      [key]: !localSettings[key],
    };
    setLocalSettings(updated);
    onChange?.(updated);

    startTransition(async () => {
      await updatePlannerViewSettings({ [key]: updated[key] });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="View settings"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Density Options */}
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Density
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={localSettings.density}
          onValueChange={handleDensityChange}
        >
          <DropdownMenuRadioItem
            value="compact"
            onSelect={(e) => e.preventDefault()}
          >
            Compact
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="comfortable"
            onSelect={(e) => e.preventDefault()}
          >
            Comfortable
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="spacious"
            onSelect={(e) => e.preventDefault()}
          >
            Spacious
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Visibility Toggles */}
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Show / Hide
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={localSettings.showMealTypeHeaders}
          onCheckedChange={() => handleVisibilityToggle("showMealTypeHeaders")}
          onSelect={(e) => e.preventDefault()}
        >
          Meal Type Headers
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={localSettings.showNutritionBadges}
          onCheckedChange={() => handleVisibilityToggle("showNutritionBadges")}
          onSelect={(e) => e.preventDefault()}
        >
          Nutrition Info
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={localSettings.showPrepTime}
          onCheckedChange={() => handleVisibilityToggle("showPrepTime")}
          onSelect={(e) => e.preventDefault()}
        >
          Prep Time
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
