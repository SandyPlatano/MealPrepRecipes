"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Hourglass, Palette, RotateCcw, Smile } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  updateMealTypeSetting,
  resetMealTypeCustomization,
} from "@/app/actions/settings";
import {
  type MealTypeCustomization,
  type MealTypeKey,
  type MealTypeSettings,
  DEFAULT_MEAL_TYPE_SETTINGS,
  MEAL_TYPE_COLOR_PALETTE,
} from "@/types/settings";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface MealTypeCustomizationProps {
  initialSettings?: MealTypeCustomization;
}

const MEAL_TYPES: MealTypeKey[] = ["breakfast", "lunch", "dinner", "snack", "other"];

// Generate time options from 5:00 to 23:00 in 30-minute intervals
const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  return { value, label };
});

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

// Days of the week
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LABELS: Record<MealTypeKey, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  other: "Other",
};

export function MealTypeCustomizationSettings({ initialSettings }: MealTypeCustomizationProps) {
  const [settings, setSettings] = useState<MealTypeCustomization>(
    initialSettings || DEFAULT_MEAL_TYPE_SETTINGS
  );
  const [editingType, setEditingType] = useState<MealTypeKey | null>(null);
  const [editForm, setEditForm] = useState<MealTypeSettings | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("");

  // Open edit dialog for a meal type
  const handleEdit = (mealType: MealTypeKey) => {
    setEditingType(mealType);
    setEditForm({ ...settings[mealType] });
    setCustomColorInput(settings[mealType].color);
  };

  // Close dialog
  const handleClose = () => {
    setEditingType(null);
    setEditForm(null);
    setShowEmojiPicker(false);
  };

  // Save changes
  const handleSave = async () => {
    if (!editingType || !editForm) return;

    setIsSaving(true);
    const result = await updateMealTypeSetting(editingType, editForm);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to save settings");
      return;
    }

    // Update local state
    setSettings((prev) => ({
      ...prev,
      [editingType]: editForm,
    }));

    toast.success(`${LABELS[editingType]} settings saved`);
    handleClose();
  };

  // Reset single meal type to default
  const handleResetSingle = () => {
    if (!editingType) return;
    setEditForm(DEFAULT_MEAL_TYPE_SETTINGS[editingType]);
    setCustomColorInput(DEFAULT_MEAL_TYPE_SETTINGS[editingType].color);
  };

  // Reset all to defaults
  const handleResetAll = async () => {
    setIsSaving(true);
    const result = await resetMealTypeCustomization();
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to reset settings");
      return;
    }

    setSettings(DEFAULT_MEAL_TYPE_SETTINGS);
    toast.success("All meal type settings reset to defaults");
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: { native: string }) => {
    setEditForm((prev) => prev ? { ...prev, emoji: emoji.native } : null);
    setShowEmojiPicker(false);
  };

  // Handle color selection from palette
  const handleColorSelect = (color: string) => {
    setEditForm((prev) => prev ? { ...prev, color } : null);
    setCustomColorInput(color);
  };

  // Handle custom color input
  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setEditForm((prev) => prev ? { ...prev, color: value } : null);
    }
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    setEditForm((prev) => prev ? { ...prev, calendarTime: time } : null);
  };

  // Handle duration change
  const handleDurationChange = (duration: string) => {
    setEditForm((prev) => prev ? { ...prev, duration: parseInt(duration, 10) } : null);
  };

  // Handle excluded day toggle
  const handleExcludedDayToggle = (day: string) => {
    setEditForm((prev) => {
      if (!prev) return null;
      const currentExcluded = prev.excludedDays || [];
      const isExcluded = currentExcluded.includes(day);
      const updatedExcluded = isExcluded
        ? currentExcluded.filter((d) => d !== day)
        : [...currentExcluded, day];
      return { ...prev, excludedDays: updatedExcluded };
    });
  };

  // Clear emoji
  const handleClearEmoji = () => {
    setEditForm((prev) => prev ? { ...prev, emoji: "" } : null);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MEAL_TYPES.map((mealType) => {
          const typeSettings = settings[mealType];
          const hasEmoji = typeSettings.emoji && typeSettings.emoji.trim() !== "";

          return (
            <button
              key={mealType}
              onClick={() => handleEdit(mealType)}
              className={cn(
                "group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                "hover:border-primary hover:shadow-md hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "bg-card"
              )}
              style={{ borderColor: `${typeSettings.color}40` }}
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
                style={{ backgroundColor: typeSettings.color }}
              />

              {/* Emoji */}
              <div className="text-3xl mt-2 mb-2 h-10 flex items-center justify-center">
                {hasEmoji ? typeSettings.emoji : (
                  <span className="text-muted-foreground text-lg">--</span>
                )}
              </div>

              {/* Label */}
              <span className="text-sm font-medium mb-2">{LABELS[mealType]}</span>

              {/* Color swatch + Time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="h-3 w-3 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: typeSettings.color }}
                />
                <Clock className="h-3 w-3" />
                <span className="font-mono">{formatTime(typeSettings.calendarTime)}</span>
              </div>

              {/* Edit hint */}
              <span className="absolute bottom-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Click to edit
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Click a meal type to customize
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          disabled={isSaving}
        >
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset All
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingType !== null} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editForm?.emoji && <span className="text-xl">{editForm.emoji}</span>}
              Edit {editingType ? LABELS[editingType] : ""}
            </DialogTitle>
          </DialogHeader>

          {editForm && editingType && (
            <div className="flex flex-col gap-6 py-4">
              {/* Emoji Section */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  Emoji
                </Label>
                <div className="flex items-center gap-2">
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-16 text-2xl p-0"
                      >
                        {editForm.emoji || "—"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0 z-[10000]" align="start" usePortal={false}>
                      <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="auto"
                        previewPosition="none"
                        skinTonePosition="search"
                        categories={[
                          "foods",
                          "activity",
                          "nature",
                          "objects",
                          "symbols",
                          "people",
                        ]}
                        perLine={8}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearEmoji}
                    disabled={!editForm.emoji}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Color Section */}
              <div className="flex flex-col gap-3">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color
                </Label>

                {/* Color palette grid */}
                <div className="grid grid-cols-8 gap-2">
                  {MEAL_TYPE_COLOR_PALETTE.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => handleColorSelect(c.color)}
                      className={cn(
                        "h-8 w-8 rounded-md transition-all",
                        editForm.color === c.color
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
                      placeholder="#f97316"
                      className="font-mono text-sm pl-10"
                    />
                    <input
                      type="color"
                      value={editForm.color}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Calendar Time Section */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Calendar Time
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  When Google Calendar events are created, {LABELS[editingType].toLowerCase()} meals will start at this time.
                </p>
                <Select value={editForm.calendarTime} onValueChange={handleTimeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 z-[10000]">
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Duration Section */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4" />
                  Event Duration
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  How long {LABELS[editingType].toLowerCase()} calendar events last.
                </p>
                <Select value={String(editForm.duration || 60)} onValueChange={handleDurationChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Excluded Days Section */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Excluded Days
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Days to skip when creating {LABELS[editingType].toLowerCase()} calendar events.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isExcluded = editForm.excludedDays?.includes(day) ?? false;
                    return (
                      <Badge
                        key={day}
                        variant={isExcluded ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          isExcluded ? "bg-destructive hover:bg-destructive/80" : "hover:bg-accent"
                        )}
                        onClick={() => handleExcludedDayToggle(day)}
                      >
                        {day.slice(0, 3)}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="flex flex-col gap-2">
                <Label>Preview</Label>
                <div
                  className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${editForm.color}15`,
                    borderLeft: `4px solid ${editForm.color}`,
                  }}
                >
                  {editForm.emoji && (
                    <span className="text-lg">{editForm.emoji}</span>
                  )}
                  <span className="flex-1 font-semibold">{LABELS[editingType]}</span>
                  <Badge
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-5 font-mono"
                  >
                    3 meals
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSingle}
              disabled={isSaving}
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
