"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTour, type TourStep } from "@/contexts/tour-context";
import { X, ChevronRight } from "lucide-react";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * TourSpotlight renders an overlay with a cutout around the target element
 * and positions a popover with step content.
 */
export function TourSpotlight() {
  const {
    isActive,
    currentStepData,
    currentStep,
    totalSteps,
    nextStep,
    skipTour,
  } = useTour();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find target element and track its position
  const updateTargetPosition = useCallback(() => {
    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      // Element not found - could be on a different page
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [currentStepData]);

  // Update position on step change and resize
  useEffect(() => {
    if (!isActive) {
      setTargetRect(null);
      return;
    }

    updateTargetPosition();

    // Update on resize/scroll
    const handleUpdate = () => updateTargetPosition();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    // Also update periodically in case of layout shifts
    const interval = setInterval(handleUpdate, 500);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      clearInterval(interval);
    };
  }, [isActive, updateTargetPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, skipTour]);

  // Don't render on server or when not active
  if (!mounted || !isActive || !currentStepData) return null;

  const isLastStep = currentStep === totalSteps - 1;

  // Calculate popover position based on target and placement
  const getPopoverStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Center on screen if no target
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const popoverWidth = 320;

    switch (currentStepData.placement) {
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left + targetRect.width + padding,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - popoverWidth - padding,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      default:
        return {
          top: targetRect.top + targetRect.height + padding,
          left: targetRect.left,
        };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: "normal" }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White background = visible (dimmed) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = transparent (spotlight) */}
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Click blocker (allows clicking through the spotlight) */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          // Allow clicks on the target element
          if (targetRect) {
            const x = e.clientX;
            const y = e.clientY;
            const inSpotlight =
              x >= targetRect.left - 8 &&
              x <= targetRect.left + targetRect.width + 8 &&
              y >= targetRect.top - 8 &&
              y <= targetRect.top + targetRect.height + 8;
            if (inSpotlight) return;
          }
          // Otherwise, do nothing (block the click)
          e.stopPropagation();
        }}
      />

      {/* Popover */}
      <div
        ref={popoverRef}
        className={cn(
          "fixed z-[101] w-80 bg-card border border-border rounded-xl shadow-xl p-4",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={getPopoverStyle()}
      >
        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Skip tour"
        >
          <X className="size-4 text-muted-foreground" />
        </button>

        {/* Step content */}
        <div className="pr-6">
          <h3 className="font-semibold text-lg mb-1">{currentStepData.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? "Done" : "Next"}
              {!isLastStep && <ChevronRight className="size-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
