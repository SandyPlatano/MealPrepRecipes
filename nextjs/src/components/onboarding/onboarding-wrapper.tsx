"use client";

import { useState, useEffect } from "react";
import { OnboardingDialog } from "./onboarding-dialog";

interface OnboardingWrapperProps {
  shouldShow: boolean;
  currentName?: string;
  currentCookNames?: string[];
}

export function OnboardingWrapper({ shouldShow, currentName, currentCookNames }: OnboardingWrapperProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show onboarding after a brief delay
    if (shouldShow) {
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const handleComplete = () => {
    setOpen(false);
  };

  return (
    <OnboardingDialog
      open={open}
      onComplete={handleComplete}
      currentName={currentName}
      currentCookNames={currentCookNames}
    />
  );
}

