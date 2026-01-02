"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Curated emoji categories for meal planning app (~2KB vs ~150KB for emoji-mart)
const EMOJI_CATEGORIES = {
  foods: {
    label: "Food & Drink",
    emojis: [
      "🍳", "🥞", "🧇", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚",
      "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🌮",
      "🌯", "🥙", "🧆", "🥗", "🥘", "🫕", "🍝", "🍜", "🍲", "🍛",
      "🍣", "🍱", "🥟", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🍡",
      "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪",
      "🥛", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍷", "🍸", "🧉",
      "🥑", "🥕", "🌽", "🌶️", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄",
      "🍅", "🍆", "🥔", "🍠", "🫛", "🥜", "🫘", "🌰", "🫑", "🥗",
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒",
    ],
  },
  activity: {
    label: "Activity",
    emojis: [
      "⏰", "⌛", "⏱️", "🕐", "📅", "📆", "🗓️", "✅", "❌", "⭐",
      "🌟", "💫", "✨", "🔥", "💪", "🏃", "🧘", "🏋️", "🚴", "🏊",
    ],
  },
  nature: {
    label: "Nature",
    emojis: [
      "🌞", "🌙", "⭐", "🌈", "☀️", "🌤️", "⛅", "🌧️", "❄️", "🌸",
      "🌺", "🌻", "🌷", "🌱", "🌿", "🍀", "🍃", "🍂", "🍁", "🌵",
    ],
  },
  objects: {
    label: "Objects",
    emojis: [
      "🍴", "🥄", "🥢", "🔪", "🍽️", "🥣", "🫙", "🧊", "🧂", "🫗",
      "📝", "📋", "📌", "🏷️", "💡", "🔔", "❤️", "💚", "💙", "💜",
    ],
  },
  symbols: {
    label: "Symbols",
    emojis: [
      "✅", "❌", "⭐", "❤️", "💛", "💚", "💙", "💜", "🤎", "🖤",
      "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪", "🔶",
    ],
  },
  people: {
    label: "People",
    emojis: [
      "👨‍🍳", "👩‍🍳", "🧑‍🍳", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨",
      "👵", "🧓", "👴", "👪", "👨‍👩‍👧", "👨‍👩‍👦", "😋", "🤤", "😊", "🥰",
    ],
  },
} as const;

type CategoryKey = keyof typeof EMOJI_CATEGORIES;

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
  theme?: "light" | "dark" | "auto";
  categories?: CategoryKey[];
  perLine?: number;
  className?: string;
}

export function EmojiPicker({
  onEmojiSelect,
  categories = ["foods", "activity", "nature", "objects", "symbols", "people"],
  perLine = 8,
  className,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(categories[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onEmojiSelect({ native: emoji });
    },
    [onEmojiSelect]
  );

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flatMap((cat) => cat.emojis)
        .filter((emoji) => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div className={cn("w-72 bg-popover border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-2", className)}>
      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search emoji..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs flex-shrink-0"
              onClick={() => setActiveCategory(cat)}
            >
              {EMOJI_CATEGORIES[cat].emojis[0]} {EMOJI_CATEGORIES[cat].label.split(" ")[0]}
            </Button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div
        className="grid gap-0.5 max-h-48 overflow-y-auto"
        style={{ gridTemplateColumns: `repeat(${perLine}, 1fr)` }}
      >
        {filteredEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            onClick={() => handleEmojiClick(emoji)}
            className="h-8 w-8 flex items-center justify-center text-xl hover:bg-accent rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {filteredEmojis.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No emojis found
        </p>
      )}
    </div>
  );
}
