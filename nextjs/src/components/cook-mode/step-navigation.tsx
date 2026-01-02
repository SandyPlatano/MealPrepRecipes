"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onRepeat: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Navigation controls for cooking steps
 * - Large touch-friendly buttons (min 44x44px)
 * - Progress bar
 * - Keyboard shortcuts (arrow keys)
 */
export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onRepeat,
  isLoading = false,
  className,
}: StepNavigationProps) {
  const progress = (currentStep / totalSteps) * 100;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (!isFirstStep) {
            event.preventDefault();
            onPrevious();
          }
          break;
        case "ArrowRight":
          if (!isLastStep) {
            event.preventDefault();
            onNext();
          }
          break;
        case "r":
        case "R":
          event.preventDefault();
          onRepeat();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, totalSteps, isFirstStep, isLastStep, onPrevious, onNext, onRepeat]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">
          {currentStep} of {totalSteps} steps completed
        </p>
      </div>

      {/* Navigation buttons - large touch targets */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className="h-14 text-base"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onRepeat}
          disabled={isLoading}
          className="h-14 text-base"
          title="Repeat current step (R)"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="sr-only">Repeat</span>
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={isLastStep || isLoading}
          className="h-14 text-base bg-[#D9F99D] text-[#1A1A1A] hover:bg-[#D9F99D]/90"
        >
          Next
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <p className="text-xs text-muted-foreground text-center">
        Use arrow keys to navigate • Press R to repeat
      </p>
    </div>
  );
}
