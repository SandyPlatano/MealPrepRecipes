"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { cn } from "@/lib/utils";
import { ACCENT_COLOR_PALETTE } from "@/types/user-preferences-v2";
import type {
  CookModeSettings,
  CookModeFontSize,
  CookModeTheme,
  IngredientHighlightStyle,
  StepTransition,
} from "@/types/settings";

const FONT_SIZE_OPTIONS: { value: CookModeFontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const THEME_OPTIONS: { value: CookModeTheme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const HIGHLIGHT_STYLE_OPTIONS: { value: IngredientHighlightStyle; label: string }[] = [
  { value: "bold", label: "Bold" },
  { value: "underline", label: "Underline" },
  { value: "background", label: "Background" },
  { value: "badge", label: "Badge" },
];

const TRANSITION_OPTIONS: { value: StepTransition; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];

interface DisplaySettingsProps {
  settings: CookModeSettings["display"];
  onUpdate: (updates: Partial<CookModeSettings["display"]>) => void;
}

export function DisplaySettings({ settings, onUpdate }: DisplaySettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingSection title="Text & Theme">
        <SettingRow
          id="setting-font-size"
          label="Font Size"
          description="How large the text appears"
        >
          <Select
            value={settings.fontSize}
            onValueChange={(value: CookModeFontSize) =>
              onUpdate({ fontSize: value })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-theme-override"
          label="Theme"
          description="Override app theme in cooking mode"
        >
          <Select
            value={settings.themeOverride}
            onValueChange={(value: CookModeTheme) =>
              onUpdate({ themeOverride: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-high-contrast"
          label="High Contrast"
          description="Enhanced readability with stronger contrast"
        >
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) =>
              onUpdate({ highContrast: checked })
            }
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Visual Styling">
        <SettingRow
          id="setting-accent-color"
          label="Accent Color"
          description="Color used for highlights and buttons"
        >
          <div className="flex flex-wrap gap-2 max-w-xs">
            {ACCENT_COLOR_PALETTE.map(({ key, color }) => (
              <button
                type="button"
                key={key}
                onClick={() => onUpdate({ accentColor: color })}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  settings.accentColor === color
                    ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color }}
                title={key}
              />
            ))}
          </div>
        </SettingRow>

        <SettingRow
          id="setting-ingredient-highlight"
          label="Ingredient Highlight Style"
          description="How ingredients are highlighted in steps"
        >
          <Select
            value={settings.ingredientHighlightStyle}
            onValueChange={(value: IngredientHighlightStyle) =>
              onUpdate({ ingredientHighlightStyle: value })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HIGHLIGHT_STYLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-step-transition"
          label="Step Transition"
          description="Animation when moving between steps"
        >
          <Select
            value={settings.stepTransition}
            onValueChange={(value: StepTransition) =>
              onUpdate({ stepTransition: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSITION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-show-step-numbers"
          label="Show Step Numbers"
          description="Display step numbers (1 of 10)"
        >
          <Switch
            checked={settings.showStepNumbers}
            onCheckedChange={(checked) =>
              onUpdate({ showStepNumbers: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-show-estimated-time"
          label="Show Estimated Time"
          description="Display time remaining for recipe"
        >
          <Switch
            checked={settings.showEstimatedTime}
            onCheckedChange={(checked) =>
              onUpdate({ showEstimatedTime: checked })
            }
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}
