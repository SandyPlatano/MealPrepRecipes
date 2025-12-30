"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface UseCookingNavigationOptions {
  totalSteps: number;
  autoAdvanceEnabled: boolean;
}

export interface UseCookingNavigationReturn {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  progress: number;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  autoAdvanceStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

/**
 * Hook for managing step navigation in cooking mode.
 */
export function useCookingNavigation({
  totalSteps,
  autoAdvanceEnabled,
}: UseCookingNavigationOptions): UseCookingNavigationReturn {
  const [currentStep, setCurrentStep] = useState(0);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const autoAdvanceStep = useCallback(() => {
    if (!autoAdvanceEnabled) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      toast.info("Auto-advanced to next step");
    }
  }, [autoAdvanceEnabled, currentStep, totalSteps]);

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    currentStep,
    setCurrentStep,
    progress,
    handlePrevStep,
    handleNextStep,
    autoAdvanceStep,
    isFirstStep,
    isLastStep,
  };
}
