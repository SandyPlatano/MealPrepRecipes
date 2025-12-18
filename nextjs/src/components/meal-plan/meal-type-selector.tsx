"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MealTypeIcon } from "@/components/ui/meal-type-icon";
import { type MealType, MEAL_TYPE_CONFIG } from "@/types/meal-plan";
import type { MealTypeCustomization, MealTypeKey } from "@/types/settings";

interface MealTypeSelectorProps {
  value: MealType | null;
  onChange: (type: MealType | null) => void;
  disabled?: boolean;
  className?: string;
  /** Show compact version without icon - uses just emoji + color indicator */
  compact?: boolean;
  /** Full meal type settings including emoji and color */
  mealTypeSettings?: MealTypeCustomization;
  /** Use Lucide icon instead of emoji */
  useIcon?: boolean;
}

export function MealTypeSelector({
  value,
  onChange,
  disabled = false,
  className,
  compact = false,
  mealTypeSettings,
  useIcon = false,
}: MealTypeSelectorProps) {
  const defaultConfig = MEAL_TYPE_CONFIG[value ?? "other"];

  const handleChange = (newValue: string) => {
    if (newValue === "other") {
      onChange(null);
    } else {
      onChange(newValue as MealType);
    }
  };

  // Get emoji for a meal type, using custom if available and not empty
  const getEmoji = (type: MealType | "other"): string | null => {
    const customSettings = mealTypeSettings?.[type as MealTypeKey];
    if (customSettings?.emoji !== undefined && customSettings.emoji !== "") {
      return customSettings.emoji;
    }
    // If explicitly set to empty string, return null to hide emoji
    if (customSettings?.emoji === "") {
      return null;
    }
    return MEAL_TYPE_CONFIG[type].emoji;
  };

  // Get color for a meal type, using custom if available
  const getColor = (type: MealType | "other"): string => {
    const customSettings = mealTypeSettings?.[type as MealTypeKey];
    return customSettings?.color || MEAL_TYPE_CONFIG[type].accentColor;
  };

  const currentEmoji = getEmoji(value ?? "other");
  const currentColor = getColor(value ?? "other");

  return (
    <Select
      value={value ?? "other"}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={className}
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: currentColor,
        }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentColor }}
            aria-hidden="true"
          />
          {currentEmoji && <span className="flex-shrink-0">{currentEmoji}</span>}
          {!compact && <span className="truncate ml-0.5">{defaultConfig.label}</span>}
        </span>
      </SelectTrigger>
      <SelectContent className="z-[10000]">
        {(["breakfast", "lunch", "dinner", "snack", "other"] as const).map((type) => {
          const typeConfig = MEAL_TYPE_CONFIG[type];
          const typeEmoji = getEmoji(type);
          const typeColor = getColor(type);
          return (
            <SelectItem key={type} value={type}>
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: typeColor }}
                  aria-hidden="true"
                />
                {typeEmoji && <span>{typeEmoji}</span>}
                <span className="ml-0.5">{typeConfig.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
