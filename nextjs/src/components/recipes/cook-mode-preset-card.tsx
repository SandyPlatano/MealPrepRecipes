"use client";

/**
 * Cook Mode Preset Card
 * Selectable card for choosing a cook mode preset
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, Sparkles, Hand, Focus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CookModePreset } from "@/types/settings";

interface CookModePresetCardProps {
  preset: CookModePreset;
  isSelected: boolean;
  onSelect: () => void;
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Minus: Minus,
  Sparkles: Sparkles,
  Hand: Hand,
  Focus: Focus,
};

export function CookModePresetCard({
  preset,
  isSelected,
  onSelect,
}: CookModePresetCardProps) {
  const IconComponent = ICON_MAP[preset.icon] || Sparkles;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative p-5 lg:p-6 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="h-6 w-6 p-0 flex items-center justify-center">
            <Check className="h-3.5 w-3.5" />
          </Badge>
        </div>
      )}

      <div className="flex flex-col">
        {/* Icon and name */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{preset.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {preset.description}
        </p>

        {/* Quick settings summary */}
        <div className="flex flex-wrap gap-1.5">
          {preset.settings.visibility.showIngredients && (
            <Badge variant="secondary" className="text-xs">Ingredients</Badge>
          )}
          {preset.settings.visibility.showTimers && (
            <Badge variant="secondary" className="text-xs">Timers</Badge>
          )}
          {preset.settings.behavior.autoAdvance && (
            <Badge variant="secondary" className="text-xs">Auto-advance</Badge>
          )}
          {preset.settings.display.themeOverride !== "system" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {preset.settings.display.themeOverride}
            </Badge>
          )}
          {preset.settings.display.fontSize !== "medium" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {preset.settings.display.fontSize} text
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
