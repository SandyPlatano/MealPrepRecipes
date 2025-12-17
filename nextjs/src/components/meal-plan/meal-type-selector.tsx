"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type MealType, MEAL_TYPE_CONFIG } from "@/types/meal-plan";

interface MealTypeSelectorProps {
  value: MealType | null;
  onChange: (type: MealType | null) => void;
  disabled?: boolean;
  className?: string;
  /** Show compact version without icon - uses just emoji + color indicator */
  compact?: boolean;
}

export function MealTypeSelector({
  value,
  onChange,
  disabled = false,
  className,
  compact = false,
}: MealTypeSelectorProps) {
  const config = MEAL_TYPE_CONFIG[value ?? "other"];

  const handleChange = (newValue: string) => {
    if (newValue === "other") {
      onChange(null);
    } else {
      onChange(newValue as MealType);
    }
  };

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
          borderLeftColor: config.accentColor,
        }}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.accentColor }}
            aria-hidden="true"
          />
          <span className="flex-shrink-0">{config.emoji}</span>
          {!compact && <span className="truncate">{config.label}</span>}
        </span>
      </SelectTrigger>
      <SelectContent className="z-[10000]">
        {(["breakfast", "lunch", "dinner", "snack", "other"] as const).map((type) => {
          const typeConfig = MEAL_TYPE_CONFIG[type];
          return (
            <SelectItem key={type} value={type}>
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: typeConfig.accentColor }}
                  aria-hidden="true"
                />
                <span>{typeConfig.emoji}</span>
                <span>{typeConfig.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
