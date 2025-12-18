"use client";

import { cn } from "@/lib/utils";
import {
  PRESET_CATEGORIES,
  getPresetsByCategory,
  type LinkPreset,
} from "@/lib/sidebar/link-presets";
import { Check } from "lucide-react";

interface LinkPresetGridProps {
  existingHrefs: string[];
  onSelectPreset: (preset: LinkPreset) => void;
}

export function LinkPresetGrid({
  existingHrefs,
  onSelectPreset,
}: LinkPresetGridProps) {
  const presetsByCategory = getPresetsByCategory();

  const isPresetAdded = (preset: LinkPreset) =>
    existingHrefs.includes(preset.href);

  return (
    <div className="space-y-4">
      {PRESET_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {category.label}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {presetsByCategory[category.id].map((preset) => {
              const isAdded = isPresetAdded(preset);
              return (
                <button
                  key={preset.id}
                  onClick={() => !isAdded && onSelectPreset(preset)}
                  disabled={isAdded}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all",
                    "text-center min-h-[72px]",
                    isAdded
                      ? "opacity-50 cursor-not-allowed bg-muted/30 border-muted"
                      : "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer border-border"
                  )}
                >
                  {isAdded && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-xl">{preset.emoji}</span>
                  <span className="text-xs font-medium truncate w-full">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground text-center pt-2">
        Click a preset to customize before adding
      </p>
    </div>
  );
}
