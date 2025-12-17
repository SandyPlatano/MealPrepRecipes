"use client";

import { cn } from "@/lib/utils";
import type { EnergyLevel } from "@/types/energy-mode";
import { ENERGY_LEVEL_LABELS } from "@/types/energy-mode";

// ============================================================================
// Types
// ============================================================================

interface SpoonSelectorProps {
  value: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
  displayMode?: "spoons" | "simple";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showLabels?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const LEVELS: EnergyLevel[] = [1, 2, 3, 4, 5];

const SIZE_CLASSES = {
  sm: "text-xl gap-1",
  md: "text-2xl gap-2",
  lg: "text-3xl gap-3",
} as const;

const BUTTON_SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
} as const;

// ============================================================================
// Component
// ============================================================================

export function SpoonSelector({
  value,
  onChange,
  displayMode = "spoons",
  size = "md",
  disabled = false,
  showLabels = false,
  className,
}: SpoonSelectorProps) {
  if (displayMode === "simple") {
    return (
      <SimpleSelector
        value={value}
        onChange={onChange}
        size={size}
        disabled={disabled}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn("flex items-center", SIZE_CLASSES[size])}
        role="radiogroup"
        aria-label="Energy level selector"
      >
        {LEVELS.map((level) => {
          const isSelected = level <= value;
          const isExact = level === value;

          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={isExact}
              aria-label={`${ENERGY_LEVEL_LABELS[level]} energy (${level} spoons)`}
              disabled={disabled}
              onClick={() => onChange(level)}
              className={cn(
                "transition-all duration-150 rounded-full flex items-center justify-center",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "hover:scale-110 active:scale-95",
                BUTTON_SIZE_CLASSES[size],
                disabled && "cursor-not-allowed opacity-50",
                !disabled && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-30 grayscale"
                )}
              >
                {isSelected ? "🥄" : "⚪"}
              </span>
            </button>
          );
        })}
      </div>

      {showLabels && (
        <div className="mt-2 text-sm text-muted-foreground">
          {ENERGY_LEVEL_LABELS[value]}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Simple Selector (Text-based alternative)
// ============================================================================

interface SimpleSelectorProps {
  value: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

function SimpleSelector({
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
}: SimpleSelectorProps) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Energy level selector"
    >
      {LEVELS.map((level) => {
        const isSelected = level === value;

        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${ENERGY_LEVEL_LABELS[level]} energy (level ${level})`}
            disabled={disabled}
            onClick={() => onChange(level)}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              textSizes[size],
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "cursor-pointer"
            )}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Display-Only Component (Read-only spoon display)
// ============================================================================

interface SpoonDisplayProps {
  level: EnergyLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SpoonDisplay({ level, size = "md", className }: SpoonDisplayProps) {
  return (
    <div
      className={cn("flex items-center", SIZE_CLASSES[size], className)}
      aria-label={`Energy level: ${ENERGY_LEVEL_LABELS[level]} (${level} spoons)`}
    >
      {LEVELS.map((l) => (
        <span
          key={l}
          className={cn(
            "transition-opacity duration-150",
            l <= level ? "opacity-100" : "opacity-30 grayscale"
          )}
        >
          {l <= level ? "🥄" : "⚪"}
        </span>
      ))}
    </div>
  );
}
