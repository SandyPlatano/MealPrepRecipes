"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateDisplayPreferences } from "@/app/actions/user-preferences";
import type {
  DisplayPreferences,
  WeekStartDay,
  TimeFormat,
  DateFormat,
  RatingScale,
  ThemeMode,
} from "@/types/user-preferences-v2";
import {
  ACCENT_COLOR_PALETTE,
  DATE_FORMAT_OPTIONS,
} from "@/types/user-preferences-v2";
import {
  Calendar,
  Clock,
  Palette,
  Star,
  ThumbsUp,
  Smile,
  Sun,
  Moon,
  Monitor,
  Sparkles,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface DisplayPreferencesSectionProps {
  userId: string;
  initialPreferences: DisplayPreferences;
}

const WEEK_START_OPTIONS = [
  { value: "monday" as WeekStartDay, label: "Monday" },
  { value: "sunday" as WeekStartDay, label: "Sunday" },
  { value: "saturday" as WeekStartDay, label: "Saturday" },
];

const RATING_SCALE_OPTIONS = [
  { value: "5-star" as RatingScale, label: "5-Star", icon: Star, example: "⭐⭐⭐⭐⭐" },
  { value: "10-star" as RatingScale, label: "10-Star", icon: Star, example: "10 stars max" },
  { value: "thumbs" as RatingScale, label: "Thumbs", icon: ThumbsUp, example: "👍 / 👎" },
  { value: "letter" as RatingScale, label: "Letter", icon: Star, example: "A, B, C, D, F" },
  { value: "emoji" as RatingScale, label: "Emoji", icon: Smile, example: "Custom emojis" },
];

const THEME_OPTIONS = [
  { value: "system" as ThemeMode, label: "System", icon: Monitor },
  { value: "light" as ThemeMode, label: "Light", icon: Sun },
  { value: "dark" as ThemeMode, label: "Dark", icon: Moon },
];

export function DisplayPreferencesSection({
  userId,
  initialPreferences,
}: DisplayPreferencesSectionProps) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<number | null>(null);
  const [customColorInput, setCustomColorInput] = useState(preferences.accentColor);

  const handleUpdate = async (updates: Partial<DisplayPreferences>) => {
    const updatedPrefs = { ...preferences, ...updates };
    setPreferences(updatedPrefs);

    setIsSaving(true);
    const result = await updateDisplayPreferences(userId, updates);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to save preferences");
      setPreferences(preferences); // Revert on error
    } else {
      toast.success("Display preferences saved");
    }
  };

  const handleEmojiSelect = (index: number, emoji: { native: string }) => {
    const newEmojis = [...preferences.customRatingEmojis];
    newEmojis[index] = emoji.native;
    handleUpdate({ customRatingEmojis: newEmojis });
    setEmojiPickerOpen(null);
  };

  const handleColorSelect = (color: string) => {
    setCustomColorInput(color);
    handleUpdate({ accentColor: color });
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      handleUpdate({ accentColor: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Start Day */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label>Week Starts On</Label>
        </div>
        <Select
          value={preferences.weekStartDay}
          onValueChange={(value) =>
            handleUpdate({ weekStartDay: value as WeekStartDay })
          }
        >
          <SelectTrigger>
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
      </div>

      {/* Time Format */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label>Time Format</Label>
        </div>
        <RadioGroup
          value={preferences.timeFormat}
          onValueChange={(value) =>
            handleUpdate({ timeFormat: value as TimeFormat })
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="12h" id="12h" />
            <Label htmlFor="12h" className="font-normal cursor-pointer">
              12-hour (3:00 PM)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="24h" id="24h" />
            <Label htmlFor="24h" className="font-normal cursor-pointer">
              24-hour (15:00)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Date Format */}
      <div className="space-y-3">
        <Label>Date Format</Label>
        <Select
          value={preferences.dateFormat}
          onValueChange={(value) =>
            handleUpdate({ dateFormat: value as DateFormat })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label} <span className="text-muted-foreground ml-2">({opt.example})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Scale */}
      <div className="space-y-3">
        <Label>Rating Scale</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {RATING_SCALE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preferences.ratingScale === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => handleUpdate({ ratingScale: opt.value })}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                  "hover:border-primary hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <Icon className="h-5 w-5 mb-2" />
                <span className="text-sm font-medium mb-1">{opt.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {opt.example}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Rating Emojis (shown when emoji scale is selected) */}
        {preferences.ratingScale === "emoji" && (
          <Card className="p-4 mt-4">
            <Label className="mb-3 block">Custom Rating Emojis (Worst → Best)</Label>
            <div className="flex items-center gap-2">
              {preferences.customRatingEmojis.map((emoji, idx) => (
                <Popover
                  key={idx}
                  open={emojiPickerOpen === idx}
                  onOpenChange={(open) => setEmojiPickerOpen(open ? idx : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-12 text-2xl p-0 flex-shrink-0"
                    >
                      {emoji || "—"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0 z-[10000]" align="start" usePortal={false}>
                    <Picker
                      data={data}
                      onEmojiSelect={(e: { native: string }) => handleEmojiSelect(idx, e)}
                      theme="auto"
                      previewPosition="none"
                      skinTonePosition="search"
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preferences.theme === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => handleUpdate({ theme: opt.value })}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Label>Accent Color</Label>
        </div>

        {/* Color palette grid */}
        <div className="grid grid-cols-9 sm:grid-cols-12 lg:grid-cols-17 gap-2">
          {ACCENT_COLOR_PALETTE.map((c) => (
            <button
              key={c.key}
              onClick={() => handleColorSelect(c.color)}
              className={cn(
                "h-8 w-8 rounded-md transition-all",
                preferences.accentColor === c.color
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-110 ring-1 ring-black/10"
              )}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}
        </div>

        {/* Custom color input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Custom:</span>
          <div className="relative flex-1">
            <Input
              type="text"
              value={customColorInput}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#6366f1"
              className="font-mono text-sm pl-10"
            />
            <input
              type="color"
              value={preferences.accentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
            />
          </div>
        </div>
      </div>

      {/* Seasonal Themes */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <Label>Seasonal Themes</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically adjust theme based on the season
          </p>
        </div>
        <Switch
          checked={preferences.seasonalThemes}
          onCheckedChange={(checked) =>
            handleUpdate({ seasonalThemes: checked })
          }
        />
      </div>

      {isSaving && (
        <p className="text-xs text-muted-foreground text-center">Saving...</p>
      )}
    </div>
  );
}
