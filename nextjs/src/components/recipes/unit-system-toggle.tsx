"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/lib/ingredient-scaler";

interface UnitSystemToggleProps {
  defaultSystem: UnitSystem;
  onSystemChange: (system: UnitSystem) => void;
  className?: string;
}

/**
 * Segmented control for switching between metric and imperial unit systems
 * Uses a pill-shaped toggle that clearly shows both options and current selection
 * Visually distinct from serving size buttons to avoid confusion
 */
export function UnitSystemToggle({
  defaultSystem,
  onSystemChange,
  className,
}: UnitSystemToggleProps) {
  const [currentSystem, setCurrentSystem] = useState(defaultSystem);

  const selectSystem = (system: UnitSystem) => {
    if (system !== currentSystem) {
      setCurrentSystem(system);
      onSystemChange(system);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border/50 px-2 py-1",
              className
            )}
          >
            {/* Icon label */}
            <Ruler className="h-3.5 w-3.5 text-muted-foreground" />

            {/* Segmented control */}
            <div className="inline-flex rounded-full bg-background/80 p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => selectSystem("imperial")}
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium rounded-full transition-all duration-200",
                  currentSystem === "imperial"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                US
              </button>
              <button
                type="button"
                onClick={() => selectSystem("metric")}
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium rounded-full transition-all duration-200",
                  currentSystem === "metric"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Metric
              </button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch measurement units</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
