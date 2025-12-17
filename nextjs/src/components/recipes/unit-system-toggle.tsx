"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UnitSystem } from "@/lib/ingredient-scaler";

interface UnitSystemToggleProps {
  defaultSystem: UnitSystem;
  onSystemChange: (system: UnitSystem) => void;
  className?: string;
}

/**
 * Toggle button for switching between metric and imperial unit systems
 * Used on recipe detail pages for quick per-recipe override of global preference
 */
export function UnitSystemToggle({
  defaultSystem,
  onSystemChange,
  className,
}: UnitSystemToggleProps) {
  const [currentSystem, setCurrentSystem] = useState(defaultSystem);

  const toggleSystem = () => {
    const newSystem = currentSystem === "imperial" ? "metric" : "imperial";
    setCurrentSystem(newSystem);
    onSystemChange(newSystem);
  };

  const displayLabel = currentSystem === "imperial" ? "US" : "Metric";
  const switchToLabel = currentSystem === "imperial" ? "metric" : "US";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSystem}
            className={className}
          >
            <Scale className="h-4 w-4 mr-1.5" />
            {displayLabel}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {switchToLabel} units</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
