"use client";

import { FOOD_EMOJIS } from "@/types/settings";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {FOOD_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-lg border-2 text-2xl transition-all hover:scale-110",
            value === emoji
              ? "border-primary bg-primary/10 scale-110"
              : "border-border bg-background hover:border-primary/50"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
