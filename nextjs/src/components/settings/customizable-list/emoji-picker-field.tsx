"use client";

/**
 * EmojiPickerField - Reusable emoji picker with popover
 *
 * Extracted from custom-meal-types-section.tsx to eliminate duplication
 * across settings sections.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { EmojiPicker } from "@/components/ui/emoji-picker";

/** Category keys matching the emoji-picker component */
type CategoryKey = "foods" | "activity" | "nature" | "objects" | "symbols" | "people";

interface EmojiPickerFieldProps {
  /** Current emoji value */
  value: string;
  /** Callback when emoji changes */
  onChange: (emoji: string) => void;
  /** Callback to clear emoji */
  onClear?: () => void;
  /** Label text */
  label?: string;
  /** Emoji categories to show */
  categories?: CategoryKey[];
  /** Disabled state */
  disabled?: boolean;
}

const DEFAULT_CATEGORIES: CategoryKey[] = [
  "foods",
  "activity",
  "nature",
  "objects",
  "symbols",
  "people",
];

export function EmojiPickerField({
  value,
  onChange,
  onClear,
  label = "Emoji",
  categories = DEFAULT_CATEGORIES,
  disabled = false,
}: EmojiPickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emoji: { native: string }) => {
    onChange(emoji.native);
    setShowPicker(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  const hasEmoji = value && value.trim() !== "";

  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-2">
        <Smile className="h-4 w-4" />
        {label}
      </Label>

      <div className="flex items-center gap-2">
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-16 text-2xl p-0"
              disabled={disabled}
            >
              {hasEmoji ? value : "—"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-0 z-[10000]"
            align="start"
            usePortal={false}
          >
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              categories={categories}
              perLine={8}
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={!hasEmoji || disabled}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
