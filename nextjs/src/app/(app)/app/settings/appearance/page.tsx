"use client";

import { useTheme } from "next-themes";
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
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  ACCENT_COLOR_PALETTE,
  DATE_FORMAT_OPTIONS,
  type WeekStartDay,
  type TimeFormat,
  type DateFormat,
  type RatingScale,
} from "@/types/user-preferences-v2";

const RATING_SCALE_OPTIONS: { value: RatingScale; label: string }[] = [
  { value: "5-star", label: "5 Stars" },
  { value: "10-star", label: "10 Stars" },
  { value: "thumbs", label: "Thumbs Up/Down" },
  { value: "letter", label: "Letter Grade (A-F)" },
  { value: "emoji", label: "Custom Emoji" },
];

const WEEK_START_OPTIONS: { value: WeekStartDay; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "saturday", label: "Saturday" },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { preferencesV2, updateDisplayPrefs } = useSettings();
  const display = preferencesV2.display;

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Appearance"
        description="Customize how the app looks and feels"
      />

      {/* Theme */}
      <SettingSection title="Theme">
        <SettingRow
          id="setting-theme-mode"
          label="Theme Mode"
          description="Choose system, light, or dark"
        >
          <div className="flex gap-2">
            {[
              { value: "system", icon: Monitor, label: "System" },
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          id="setting-accent-color"
          label="Accent Color"
          description="Customize the primary accent color"
        >
          <div className="flex flex-wrap gap-2 max-w-xs">
            {ACCENT_COLOR_PALETTE.map(({ key, color }) => (
              <button
                key={key}
                onClick={() => updateDisplayPrefs({ accentColor: color })}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  display.accentColor === color
                    ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color }}
                title={key}
              />
            ))}
          </div>
        </SettingRow>
      </SettingSection>

      {/* Date & Time */}
      <SettingSection title="Date & Time">
        <SettingRow
          id="setting-date-format"
          label="Date Format"
          description="How dates are displayed"
        >
          <Select
            value={display.dateFormat}
            onValueChange={(value: DateFormat) =>
              updateDisplayPrefs({ dateFormat: value })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.example}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-time-format"
          label="Time Format"
          description="12-hour or 24-hour clock"
        >
          <Select
            value={display.timeFormat}
            onValueChange={(value: TimeFormat) =>
              updateDisplayPrefs({ timeFormat: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (3:00 PM)</SelectItem>
              <SelectItem value="24h">24-hour (15:00)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          id="setting-week-start"
          label="Week Start Day"
          description="Which day the week starts on"
        >
          <Select
            value={display.weekStartDay}
            onValueChange={(value: WeekStartDay) =>
              updateDisplayPrefs({ weekStartDay: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEK_START_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingSection>

      {/* Rating */}
      <SettingSection title="Ratings">
        <SettingRow
          id="setting-rating-scale"
          label="Rating Scale"
          description="How you rate recipes"
        >
          <Select
            value={display.ratingScale}
            onValueChange={(value: RatingScale) =>
              updateDisplayPrefs({ ratingScale: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_SCALE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingSection>

      {/* Advanced */}
      <AdvancedToggle>
        <SettingSection title="Advanced Appearance">
          <SettingRow
            id="setting-seasonal-themes"
            label="Seasonal Themes"
            description="Enable holiday and seasonal variations"
          >
            <Switch
              id="setting-seasonal-themes-control"
              checked={display.seasonalThemes}
              onCheckedChange={(checked) =>
                updateDisplayPrefs({ seasonalThemes: checked })
              }
            />
          </SettingRow>

          <SettingRow
            id="setting-custom-rating-emojis"
            label="Custom Rating Emojis"
            description="Customize emojis for emoji rating scale"
          >
            <div className="flex gap-1">
              {display.customRatingEmojis.map((emoji, i) => (
                <span
                  key={i}
                  className="w-8 h-8 flex items-center justify-center bg-muted rounded text-lg"
                >
                  {emoji}
                </span>
              ))}
            </div>
          </SettingRow>
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
