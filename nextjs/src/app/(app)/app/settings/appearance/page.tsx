"use client";

import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
  const { preferencesV2, updateDisplayPrefs } = useSettings();
  const display = preferencesV2.display;

  return (
    <div className="flex flex-col gap-8">
      <SettingsHeader
        title="Date, Time & Ratings"
        description="Customize date formats, time display, and rating preferences"
      />

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
    </div>
  );
}
