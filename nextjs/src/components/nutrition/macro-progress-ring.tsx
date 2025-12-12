"use client";

/**
 * Macro Progress Ring Component
 * Circular progress indicator for macro nutrient tracking
 * Shows percentage of daily goal achieved with color coding
 */

import { useMemo } from "react";
import type { MacroProgress } from "@/types/nutrition";
import { getProgressRingColor, formatProgressPercentage } from "@/lib/nutrition/calculations";
import { cn } from "@/lib/utils";

interface MacroProgressRingProps {
  progress: MacroProgress;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showPercentage?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    radius: 30,
    stroke: 4,
    fontSize: "text-xs",
    labelSize: "text-[10px]",
  },
  md: {
    radius: 45,
    stroke: 6,
    fontSize: "text-sm",
    labelSize: "text-xs",
  },
  lg: {
    radius: 60,
    stroke: 8,
    fontSize: "text-base",
    labelSize: "text-sm",
  },
};

export function MacroProgressRing({
  progress,
  size = "md",
  showLabel = true,
  showPercentage = true,
  className,
}: MacroProgressRingProps) {
  const config = SIZE_CONFIG[size];
  const diameter = config.radius * 2;
  const viewBox = `0 0 ${diameter} ${diameter}`;

  // Calculate circle properties
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = useMemo(() => {
    const cappedPercentage = Math.min(progress.percentage, 200); // Cap at 200%
    return circumference - (cappedPercentage / 100) * circumference;
  }, [progress.percentage, circumference]);

  // Get color class
  const strokeColor = getProgressRingColor(progress.color);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* SVG Ring */}
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg
          width={diameter}
          height={diameter}
          viewBox={viewBox}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.radius}
            cy={config.radius}
            r={config.radius - config.stroke / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-muted opacity-20"
          />

          {/* Progress circle */}
          <circle
            cx={config.radius}
            cy={config.radius}
            r={config.radius - config.stroke / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-500 ease-out", strokeColor)}
          />
        </svg>

        {/* Center text - percentage or value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {progress.actual !== null ? (
            <>
              <div className={cn("font-bold tabular-nums", config.fontSize)}>
                {showPercentage
                  ? formatProgressPercentage(progress.percentage)
                  : Math.round(progress.actual)}
              </div>
              {!showPercentage && (
                <div className={cn("text-muted-foreground", config.labelSize)}>
                  / {progress.target}
                </div>
              )}
            </>
          ) : (
            <div className={cn("text-muted-foreground", config.fontSize)}>N/A</div>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className={cn("text-center font-medium", config.labelSize)}>
          {progress.name}
        </div>
      )}
    </div>
  );
}

/**
 * Compact horizontal progress bar variant
 * Alternative to ring for tight spaces
 */
interface MacroProgressBarProps {
  progress: MacroProgress;
  showValue?: boolean;
  className?: string;
}

export function MacroProgressBar({
  progress,
  showValue = true,
  className,
}: MacroProgressBarProps) {
  const cappedPercentage = Math.min(progress.percentage, 100);

  // Get color classes
  const bgColor = progress.color === "green"
    ? "bg-green-500"
    : progress.color === "yellow"
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className={cn("space-y-1", className)}>
      {/* Header with label and value */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{progress.name}</span>
        {showValue && progress.actual !== null && (
          <span className="text-muted-foreground tabular-nums">
            {Math.round(progress.actual)} / {progress.target}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500 ease-out", bgColor)}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>

      {/* Percentage indicator */}
      <div className="text-right text-xs text-muted-foreground tabular-nums">
        {formatProgressPercentage(progress.percentage)}
      </div>
    </div>
  );
}
