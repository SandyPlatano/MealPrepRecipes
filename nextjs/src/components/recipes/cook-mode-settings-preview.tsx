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
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
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
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
          Preview
        </span>
        <Badge variant="outline" className="text-[10px] h-5">
          Cook Mode
        </Badge>
      </div>

      {/* Preview Content */}
      <div className="p-3 space-y-3">
        {/* Progress Bar - conditional */}
        <div
          className={cn(
            "transition-all duration-300",
            settings.visibility.showProgress
              ? "opacity-100 h-auto"
              : "opacity-0 h-0 overflow-hidden"
          )}
        >
          <Progress value={33} className="h-1.5" />
          <p className="text-[10px] opacity-60 mt-1">Step 1 of 3</p>
        </div>

        {/* Main Content Grid */}
        <div
          className={cn(
            "grid gap-3 transition-all duration-300",
            settings.visibility.showIngredients && "grid-cols-[1fr_80px]"
          )}
        >
          {/* Instruction Card */}
          <Card
            className={cn(
              "p-3 transition-all duration-300",
              settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
              settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
            )}
          >
            <div className="space-y-2">
              <span className="text-[10px] font-medium opacity-60">STEP 1</span>
              <p className={cn("leading-relaxed transition-all duration-300", fontSizeClass)}>
                {SAMPLE_INSTRUCTION}
              </p>

              {/* Timer badges - conditional */}
              <div
                className={cn(
                  "flex gap-1.5 pt-2 border-t transition-all duration-300",
                  settings.visibility.showTimers
                    ? "opacity-100 h-auto"
                    : "opacity-0 h-0 overflow-hidden border-0 pt-0"
                )}
              >
                <Badge variant="default" className="text-[10px] gap-1 h-5">
                  <Timer className="h-2.5 w-2.5" />
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
                "p-2 h-full transition-all duration-300",
                settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
                settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
              )}
            >
              <div className="flex items-center gap-1 mb-2">
                <ListChecks className="h-3 w-3 opacity-60" />
                <span className="text-[10px] font-medium">Ingredients</span>
              </div>
              <div className="space-y-1">
                {["Flour", "Sugar", "Salt"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm border opacity-60" />
                    <span className="text-[10px] opacity-80">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Behavior Indicators */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          {settings.behavior.keepScreenAwake && (
            <Badge variant="secondary" className="text-[9px] h-4 gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Screen awake
            </Badge>
          )}
          {settings.behavior.timerSounds && (
            <Badge variant="secondary" className="text-[9px] h-4 gap-0.5">
              🔔 Sounds
            </Badge>
          )}
          {settings.behavior.autoAdvance && (
            <Badge variant="secondary" className="text-[9px] h-4 gap-0.5">
              <Check className="h-2 w-2" />
              Auto-advance
            </Badge>
          )}
          <Badge variant="secondary" className="text-[9px] h-4">
            {settings.navigation.mode === "step-by-step" ? "Step-by-step" : "Scrollable"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
