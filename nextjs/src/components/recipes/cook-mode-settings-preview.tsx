"use client";

/**
 * Cook Mode Settings Preview
 * A compact, live preview component that shows how settings affect the cook mode UI.
 * Designed to fit all information in a single view without scrolling.
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
  /** Compact mode for smaller display */
  compact?: boolean;
}

// Shorter sample instruction for compact preview
const SAMPLE_INSTRUCTION_SHORT = "Preheat oven to 375°F. Whisk flour, sugar, and salt.";

// Font size mapping for preview text
const FONT_SIZE_CLASSES = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
  "extra-large": "text-lg",
} as const;

export function CookModeSettingsPreview({
  settings,
  className,
  compact = false,
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
        "rounded-lg border overflow-hidden transition-all duration-200",
        getThemeStyles(),
        className
      )}
    >
      {/* Compact Header */}
      <div className="px-3 py-1.5 border-b flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-50">
          Preview
        </span>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
          Cook Mode
        </Badge>
      </div>

      {/* Preview Content - Compact Layout */}
      <div className="flex p-2.5 flex-col">
        {/* Progress Bar - conditional */}
        {settings.visibility.showProgress && (
          <div className="flex items-center gap-2">
            <Progress value={33} className="h-1.5 flex-1" />
            <span className="text-[10px] opacity-50 whitespace-nowrap">1/3</span>
          </div>
        )}

        {/* Main Content - Horizontal Layout */}
        <div className="flex gap-2">
          {/* Instruction Card */}
          <Card
            className={cn(
              "p-2 flex-1 transition-all duration-200",
              settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
              settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium opacity-50">STEP 1</span>
                {/* Timer inline */}
                {settings.visibility.showTimers && (
                  <Badge variant="default" className="text-[10px] gap-1 h-4 px-1.5">
                    <Timer className="h-2.5 w-2.5" />
                    15m
                  </Badge>
                )}
              </div>
              <p className={cn("leading-snug transition-all duration-200", fontSizeClass)}>
                {SAMPLE_INSTRUCTION_SHORT}
              </p>
            </div>
          </Card>

          {/* Ingredients sidebar - conditional */}
          {settings.visibility.showIngredients && (
            <Card
              className={cn(
                "p-2 w-20 shrink-0 transition-all duration-200",
                settings.display.themeOverride === "dark" && "bg-zinc-800 border-zinc-700",
                settings.display.themeOverride === "light" && "bg-zinc-50 border-zinc-200"
              )}
            >
              <div className="flex items-center gap-1 mb-1">
                <ListChecks className="h-3 w-3 opacity-50" />
                <span className="text-[10px] font-medium">Items</span>
              </div>
              <div className="flex flex-col">
                {["Flour", "Sugar", "Salt"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm border opacity-50" />
                    <span className="text-[10px] opacity-70 truncate">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Behavior Indicators - Compact Row */}
        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-dashed">
          {settings.behavior.keepScreenAwake && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 px-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Awake
            </Badge>
          )}
          {settings.behavior.timerSounds && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              🔔
            </Badge>
          )}
          {settings.behavior.autoAdvance && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 px-1.5">
              <Check className="h-2.5 w-2.5" />
              Auto
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {settings.navigation.mode === "step-by-step" ? "Steps" : "Scroll"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
