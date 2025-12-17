"use client";

/**
 * Cook Mode Settings Preview
 * A live preview component that shows how settings affect the cook mode UI.
 * Used in both the settings sheet and the first-time wizard.
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, Check, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CookModeSettings } from "@/types/settings";

interface CookModeSettingsPreviewProps {
  settings: CookModeSettings;
  className?: string;
}

// Sample instruction for the preview
const SAMPLE_INSTRUCTION = "Preheat the oven to 375°F. In a large bowl, whisk together the flour, sugar, and salt until well combined.";

// Font size mapping for preview text
const FONT_SIZE_CLASSES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
} as const;

export function CookModeSettingsPreview({
  settings,
  className,
}: CookModeSettingsPreviewProps) {
  const fontSizeClass = FONT_SIZE_CLASSES[settings.display.fontSize];

  // Determine background based on theme override
  const getThemeStyles = () => {
    switch (settings.display.themeOverride) {
      case "dark":
        return "bg-zinc-900 text-zinc-100";
      case "light":
        return "bg-white text-zinc-900";
      default:
        return "bg-background text-foreground";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-300",
        getThemeStyles(),
        className
      )}
    >
      {/* Preview Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
          Preview
        </span>
        <Badge variant="outline" className="text-xs">
          Cook Mode
        </Badge>
      </div>

      {/* Preview Content */}
      <div className="p-4 space-y-4">
        {/* Progress Bar - conditional */}
        <div
          className={cn(
            "transition-all duration-300",
            settings.visibility.showProgress
              ? "opacity-100 h-auto"
              : "opacity-0 h-0 overflow-hidden"
          )}
        >
          <Progress value={33} className="h-2" />
          <p className="text-xs opacity-60 mt-1.5">Step 1 of 3</p>
        </div>

        {/* Main Content Grid */}
        <div
          className={cn(
            "grid gap-4 transition-all duration-300",
            settings.visibility.showIngredients && "grid-cols-[1fr_100px]"
          )}
        >
          {/* Instruction Card */}
          <Card
            className={cn(
              "p-4 transition-all duration-300",
              settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
              settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
            )}
          >
            <div className="space-y-3">
              <span className="text-xs font-medium opacity-60">STEP 1</span>
              <p className={cn("leading-relaxed transition-all duration-300", fontSizeClass)}>
                {SAMPLE_INSTRUCTION}
              </p>

              {/* Timer badges - conditional */}
              <div
                className={cn(
                  "flex gap-2 pt-3 border-t transition-all duration-300",
                  settings.visibility.showTimers
                    ? "opacity-100 h-auto"
                    : "opacity-0 h-0 overflow-hidden border-0 pt-0"
                )}
              >
                <Badge variant="default" className="text-xs gap-1.5 h-6">
                  <Timer className="h-3 w-3" />
                  15 min
                </Badge>
              </div>
            </div>
          </Card>

          {/* Ingredients sidebar - conditional */}
          <div
            className={cn(
              "transition-all duration-300",
              settings.visibility.showIngredients
                ? "opacity-100 w-auto"
                : "opacity-0 w-0 overflow-hidden"
            )}
          >
            <Card
              className={cn(
                "p-3 h-full transition-all duration-300",
                settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
                settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
              )}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <ListChecks className="h-4 w-4 opacity-60" />
                <span className="text-xs font-medium">Ingredients</span>
              </div>
              <div className="space-y-2">
                {["Flour", "Sugar", "Salt"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border opacity-60" />
                    <span className="text-xs opacity-80">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Behavior Indicators */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {settings.behavior.keepScreenAwake && (
            <Badge variant="secondary" className="text-xs h-6 gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Screen awake
            </Badge>
          )}
          {settings.behavior.timerSounds && (
            <Badge variant="secondary" className="text-xs h-6 gap-1">
              🔔 Sounds
            </Badge>
          )}
          {settings.behavior.autoAdvance && (
            <Badge variant="secondary" className="text-xs h-6 gap-1">
              <Check className="h-3 w-3" />
              Auto-advance
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs h-6">
            {settings.navigation.mode === "step-by-step" ? "Step-by-step" : "Scrollable"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
