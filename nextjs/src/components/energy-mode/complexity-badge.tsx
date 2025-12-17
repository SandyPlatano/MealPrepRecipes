"use client";

import { cn } from "@/lib/utils";
import { useEnergyModeOptional } from "@/contexts/energy-mode-context";

// ============================================================================
// Types
// ============================================================================

interface ComplexityBadgeProps {
  /** Recipe complexity score (1-5 scale) */
  complexity: number;
  /** Show text label alongside badge */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

interface ComplexityIndicatorProps {
  /** Recipe complexity score (1-5 scale) */
  complexity: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const COMPLEXITY_CONFIG = {
  1: { label: "Very Easy", color: "bg-emerald-500", textColor: "text-emerald-600" },
  2: { label: "Easy", color: "bg-green-500", textColor: "text-green-600" },
  3: { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-600" },
  4: { label: "Complex", color: "bg-orange-500", textColor: "text-orange-600" },
  5: { label: "Challenging", color: "bg-red-500", textColor: "text-red-600" },
} as const;

function getComplexityLevel(complexity: number): 1 | 2 | 3 | 4 | 5 {
  const clamped = Math.max(1, Math.min(5, Math.round(complexity)));
  return clamped as 1 | 2 | 3 | 4 | 5;
}

// ============================================================================
// ComplexityBadge Component
// ============================================================================

export function ComplexityBadge({
  complexity,
  showLabel = false,
  size = "md",
  className,
}: ComplexityBadgeProps) {
  const energyMode = useEnergyModeOptional();
  const level = getComplexityLevel(complexity);
  const config = COMPLEXITY_CONFIG[level];

  // Check if recipe exceeds current energy capacity
  const exceedsEnergy =
    energyMode?.isEnabled && complexity > energyMode.maxComplexity;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-base px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        sizeClasses[size],
        exceedsEnergy
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-muted text-muted-foreground",
        className
      )}
      title={
        exceedsEnergy
          ? `This recipe may be too complex for your current energy level`
          : config.label
      }
    >
      <span
        className={cn("w-2 h-2 rounded-full", config.color)}
        aria-hidden
      />
      {showLabel && <span>{config.label}</span>}
      {exceedsEnergy && !showLabel && (
        <span className="text-xs">!</span>
      )}
    </span>
  );
}

// ============================================================================
// ComplexityIndicator Component (Simple dot indicator)
// ============================================================================

export function ComplexityIndicator({
  complexity,
  size = "md",
  className,
}: ComplexityIndicatorProps) {
  const energyMode = useEnergyModeOptional();
  const level = getComplexityLevel(complexity);
  const config = COMPLEXITY_CONFIG[level];

  const exceedsEnergy =
    energyMode?.isEnabled && complexity > energyMode.maxComplexity;

  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        sizeClasses[size],
        exceedsEnergy ? "bg-red-500 animate-pulse" : config.color,
        className
      )}
      title={
        exceedsEnergy
          ? `May be too complex for current energy (${config.label})`
          : config.label
      }
      aria-label={config.label}
    />
  );
}

// ============================================================================
// ComplexityBar Component (Visual bar representation)
// ============================================================================

interface ComplexityBarProps {
  complexity: number;
  maxComplexity?: number;
  showLabel?: boolean;
  className?: string;
}

export function ComplexityBar({
  complexity,
  maxComplexity,
  showLabel = false,
  className,
}: ComplexityBarProps) {
  const energyMode = useEnergyModeOptional();
  const level = getComplexityLevel(complexity);
  const config = COMPLEXITY_CONFIG[level];

  // Use provided maxComplexity or energy mode's maxComplexity
  const effectiveMax = maxComplexity ?? energyMode?.maxComplexity ?? 5;
  const exceedsEnergy = complexity > effectiveMax;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            exceedsEnergy ? "bg-red-500" : config.color
          )}
          style={{ width: `${(complexity / 5) * 100}%` }}
        />
      </div>

      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium whitespace-nowrap",
            exceedsEnergy ? "text-red-600" : config.textColor
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// EnergyMatchIndicator Component
// Shows if a recipe matches current energy level
// ============================================================================

interface EnergyMatchIndicatorProps {
  complexity: number;
  className?: string;
}

export function EnergyMatchIndicator({
  complexity,
  className,
}: EnergyMatchIndicatorProps) {
  const energyMode = useEnergyModeOptional();

  // Don't show if energy mode is disabled
  if (!energyMode?.isEnabled) {
    return null;
  }

  const exceedsEnergy = complexity > energyMode.maxComplexity;
  const isEasyEnough = complexity <= energyMode.maxComplexity;
  const isPerfectMatch =
    complexity <= energyMode.maxComplexity && complexity >= energyMode.maxComplexity - 1;

  if (exceedsEnergy) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-red-600",
          className
        )}
        title="This recipe may be too complex for your current energy level"
      >
        <span>⚠️</span>
        <span>High effort</span>
      </span>
    );
  }

  if (isPerfectMatch) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-emerald-600",
          className
        )}
        title="Great match for your energy level"
      >
        <span>✨</span>
        <span>Perfect for today</span>
      </span>
    );
  }

  if (isEasyEnough) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-green-600",
          className
        )}
        title="Within your energy capacity"
      >
        <span>✓</span>
        <span>Doable</span>
      </span>
    );
  }

  return null;
}
