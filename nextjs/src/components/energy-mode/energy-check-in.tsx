"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useEnergyMode } from "@/contexts/energy-mode-context";
import { SpoonSelector, SpoonDisplay } from "./spoon-selector";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { ENERGY_LEVEL_DESCRIPTIONS } from "@/types/energy-mode";

// ============================================================================
// Types
// ============================================================================

interface EnergyCheckInProps {
  className?: string;
  variant?: "full" | "compact" | "minimal";
  onDismiss?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function EnergyCheckIn({
  className,
  variant = "compact",
  onDismiss,
}: EnergyCheckInProps) {
  const {
    todayEnergy,
    setTodayEnergy,
    energyLabel,
    energyDescription,
    isEnabled,
    hasCheckedInToday,
    preferences,
  } = useEnergyMode();

  const [isExpanded, setIsExpanded] = useState(!hasCheckedInToday);

  // Don't render if energy mode is disabled
  if (!isEnabled) {
    return null;
  }

  // Minimal variant - just the spoon display
  if (variant === "minimal") {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-muted/50 hover:bg-muted transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
        aria-label={`Energy: ${energyLabel}. Click to change.`}
      >
        <SpoonDisplay level={todayEnergy} size="sm" />
        <span className="text-xs text-muted-foreground">{energyLabel}</span>
      </button>
    );
  }

  // Compact variant - collapsible pill
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border bg-card shadow-sm transition-all duration-200",
          isExpanded ? "p-4" : "p-2",
          className
        )}
      >
        {isExpanded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥄</span>
                <span className="font-medium text-sm">How are you feeling today?</span>
              </div>
              <div className="flex items-center gap-1">
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Collapse"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <SpoonSelector
              value={todayEnergy}
              onChange={setTodayEnergy}
              displayMode={preferences.displayMode}
              size="lg"
              showLabels
            />

            <p className="text-xs text-muted-foreground text-center">
              {ENERGY_LEVEL_DESCRIPTIONS[todayEnergy]}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              "w-full flex items-center justify-between gap-2",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            )}
            aria-label={`Energy: ${energyLabel}. Click to expand.`}
          >
            <div className="flex items-center gap-2">
              <SpoonDisplay level={todayEnergy} size="sm" />
              <span className="text-sm font-medium">{energyLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  // Full variant - always expanded card
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥄</span>
            <div>
              <h3 className="font-medium">Energy Check-In</h3>
              <p className="text-xs text-muted-foreground">
                How are you feeling today?
              </p>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <SpoonSelector
          value={todayEnergy}
          onChange={setTodayEnergy}
          displayMode={preferences.displayMode}
          size="lg"
          showLabels
        />

        <div className="text-center space-y-1">
          <p className="text-sm font-medium">{energyLabel}</p>
          <p className="text-xs text-muted-foreground">
            {ENERGY_LEVEL_DESCRIPTIONS[todayEnergy]}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Header Widget (For meal planner header)
// ============================================================================

interface EnergyHeaderWidgetProps {
  className?: string;
}

export function EnergyHeaderWidget({ className }: EnergyHeaderWidgetProps) {
  const { todayEnergy, setTodayEnergy, energyLabel, isEnabled, preferences } =
    useEnergyMode();
  const [isOpen, setIsOpen] = useState(false);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-muted/50 hover:bg-muted transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isOpen && "bg-muted"
        )}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Energy: ${energyLabel}. Click to change.`}
      >
        <SpoonDisplay level={todayEnergy} size="sm" />
        <span className="text-xs font-medium">{energyLabel}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          {/* Dropdown */}
          <div
            className={cn(
              "absolute right-0 top-full mt-2 z-50",
              "w-64 rounded-xl border bg-popover p-4 shadow-lg",
              "animate-in fade-in-0 zoom-in-95"
            )}
            role="dialog"
            aria-label="Energy level selector"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥄</span>
                <span className="font-medium text-sm">How are you feeling?</span>
              </div>

              <SpoonSelector
                value={todayEnergy}
                onChange={(level) => {
                  setTodayEnergy(level);
                  setIsOpen(false);
                }}
                displayMode={preferences.displayMode}
                size="md"
                showLabels
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
