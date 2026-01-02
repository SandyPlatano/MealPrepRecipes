"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

  const handleSystemChange = (value: string) => {
    if (value && value !== currentSystem) {
      const system = value as UnitSystem;
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
              "inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2 py-1",
              className
            )}
          >
            {/* Icon label */}
            <Ruler className="h-3.5 w-3.5 text-muted-foreground" />

            {/* Segmented control using ToggleGroup */}
            <ToggleGroup
              type="single"
              value={currentSystem}
              onValueChange={handleSystemChange}
              spacing={0}
              className="bg-background/80 rounded-full p-0.5 shadow-inner"
            >
              <ToggleGroupItem
                value="imperial"
                className="px-2.5 py-0.5 text-xs font-medium rounded-full data-[state=on]:bg-[#D9F99D] data-[state=on]:text-[#1A1A1A] data-[state=on]:border-[#D9F99D] data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
              >
                US
              </ToggleGroupItem>
              <ToggleGroupItem
                value="metric"
                className="px-2.5 py-0.5 text-xs font-medium rounded-full data-[state=on]:bg-[#D9F99D] data-[state=on]:text-[#1A1A1A] data-[state=on]:border-[#D9F99D] data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
              >
                Metric
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch measurement units</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
