"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateMealTypeEmojiSettings } from "@/app/actions/settings";
import {
  type MealTypeEmojiSettings as MealTypeEmojiSettingsType,
  type MealTypeKey,
  DEFAULT_MEAL_TYPE_EMOJIS,
} from "@/types/settings";
import { MEAL_TYPE_CONFIG } from "@/types/meal-plan";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface MealTypeEmojiSettingsProps {
  initialEmojis?: MealTypeEmojiSettingsType;
}

const MEAL_TYPES: MealTypeKey[] = ["breakfast", "lunch", "dinner", "snack", "other"];

export function MealTypeEmojiSettings({ initialEmojis }: MealTypeEmojiSettingsProps) {
  const [emojis, setEmojis] = useState<MealTypeEmojiSettingsType>(
    initialEmojis || DEFAULT_MEAL_TYPE_EMOJIS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [openPicker, setOpenPicker] = useState<MealTypeKey | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save when emojis change (debounced)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const result = await updateMealTypeEmojiSettings(emojis);
      setIsSaving(false);

      if (result.error) {
        toast.error("Failed to save emoji settings");
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [emojis]);

  const handleEmojiSelect = (mealType: MealTypeKey, emoji: { native: string }) => {
    setEmojis((prev) => ({
      ...prev,
      [mealType]: emoji.native,
    }));
    setOpenPicker(null);
  };

  const handleClearEmoji = (mealType: MealTypeKey) => {
    setEmojis((prev) => ({
      ...prev,
      [mealType]: "",
    }));
  };

  const handleResetToDefault = (mealType: MealTypeKey) => {
    setEmojis((prev) => ({
      ...prev,
      [mealType]: DEFAULT_MEAL_TYPE_EMOJIS[mealType],
    }));
  };

  const handleResetAll = () => {
    setEmojis(DEFAULT_MEAL_TYPE_EMOJIS);
    toast.success("Reset all emojis to defaults");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {MEAL_TYPES.map((mealType) => {
          const config = MEAL_TYPE_CONFIG[mealType === "other" ? "other" : mealType];
          const currentEmoji = emojis[mealType];
          const hasEmoji = currentEmoji && currentEmoji.trim() !== "";

          return (
            <div key={mealType} className="flex items-center gap-3">
              {/* Color indicator */}
              <div
                className="h-8 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.accentColor }}
                title={`${config.label} color`}
              />

              {/* Label */}
              <Label className="w-20 text-sm font-medium capitalize">
                {config.label}
              </Label>

              {/* Emoji picker */}
              <Popover
                open={openPicker === mealType}
                onOpenChange={(open) => setOpenPicker(open ? mealType : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-14 text-xl p-0"
                    title={hasEmoji ? "Click to change emoji" : "Click to add emoji"}
                  >
                    {hasEmoji ? currentEmoji : "—"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-0 z-[10000]" align="start" usePortal={false}>
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: { native: string }) =>
                      handleEmojiSelect(mealType, emoji)
                    }
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

              {/* Clear / Reset buttons */}
              <div className="flex gap-1">
                {hasEmoji && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleClearEmoji(mealType)}
                    title="Remove emoji"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {currentEmoji !== DEFAULT_MEAL_TYPE_EMOJIS[mealType] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleResetToDefault(mealType)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          {isSaving ? "Saving..." : "Changes save automatically"}
        </p>
        <Button variant="outline" size="sm" onClick={handleResetAll}>
          Reset All to Defaults
        </Button>
      </div>
    </div>
  );
}
