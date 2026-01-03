"use client";

/**
 * ColorPickerField - Reusable color picker with palette and custom input
 *
 * Extracted from custom-meal-types-section.tsx to eliminate duplication
 * across settings sections.
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { MEAL_TYPE_COLOR_PALETTE } from "@/types/settings";
import type { ColorPaletteItem } from "./types";

interface ColorPickerFieldProps {
  /** Current color value (hex) */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Custom color palette (defaults to MEAL_TYPE_COLOR_PALETTE) */
  palette?: readonly ColorPaletteItem[] | ColorPaletteItem[];
  /** Label text */
  label?: string;
  /** Allow custom hex input */
  allowCustom?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/** Validate hex color format */
function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function ColorPickerField({
  value,
  onChange,
  palette = MEAL_TYPE_COLOR_PALETTE,
  label = "Color",
  allowCustom = true,
  disabled = false,
}: ColorPickerFieldProps) {
  const [customInput, setCustomInput] = useState(value);

  // Sync custom input with value prop
  useEffect(() => {
    setCustomInput(value);
  }, [value]);

  const handleCustomChange = (input: string) => {
    setCustomInput(input);
    // Only update if valid hex
    if (isValidHex(input)) {
      onChange(input);
    }
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomInput(color);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        {label}
      </Label>

      {/* Color palette grid */}
      <div className="grid grid-cols-8 gap-2">
        {palette.map((c) => (
          <button
            type="button"
            key={c.key}
            onClick={() => handleColorSelect(c.color)}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-md transition-all",
              value === c.color
                ? "ring-2 ring-offset-2 ring-primary scale-110"
                : "hover:scale-110 ring-1 ring-black/10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ backgroundColor: c.color }}
            title={c.label}
          />
        ))}
      </div>

      {/* Custom color input */}
      {allowCustom && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Custom:</span>
          <div className="relative flex-1">
            <Input
              type="text"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="#f97316"
              className={cn(
                "font-mono text-sm pl-10",
                !isValidHex(customInput) && customInput !== value && "border-destructive"
              )}
              disabled={disabled}
            />
            <input
              type="color"
              value={isValidHex(value) ? value : "#000000"}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
