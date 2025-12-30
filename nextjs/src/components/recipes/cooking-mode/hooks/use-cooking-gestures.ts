import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { GestureAction } from "@/types/settings";

interface UseCookingGesturesProps {
  settings: {
    swipeEnabled: boolean;
    hapticFeedback: boolean;
    tapToAdvance: boolean;
    doubleTapAction: GestureAction;
    longPressAction: GestureAction;
    swipeUpAction: GestureAction;
    swipeDownAction: GestureAction;
  };
  currentStep: number;
  instructionsLength: number;
  currentStepText: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSpeak: (text: string) => void;
  onStartTimer: (minutes: number) => void;
  onToggleVoice: () => void;
  onToggleFullscreen: () => void;
  onOpenIngredients: () => void;
  onOpenSettings: () => void;
}

export interface CookingGesturesState {
  handleSwipe: (direction: "left" | "right" | "up" | "down") => void;
  handleTap: () => void;
  handleTouchStart: () => void;
  handleTouchEnd: () => void;
}

export function useCookingGestures({
  settings,
  currentStep,
  instructionsLength,
  currentStepText,
  onNextStep,
  onPrevStep,
  onSpeak,
  onStartTimer,
  onToggleVoice,
  onToggleFullscreen,
  onOpenIngredients,
  onOpenSettings,
}: UseCookingGesturesProps): CookingGesturesState {
  const router = useRouter();
  const [lastTap, setLastTap] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Execute gesture actions
  const executeGestureAction = useCallback(
    (action: GestureAction) => {
      switch (action) {
        case "none":
          break;
        case "repeat":
          onSpeak(currentStepText);
          break;
        case "timer":
          // Start a quick 5-minute timer
          onStartTimer(5);
          break;
        case "ingredients":
          onOpenIngredients();
          break;
        case "voice":
          onToggleVoice();
          break;
        case "fullscreen":
          onToggleFullscreen();
          break;
        case "settings":
          onOpenSettings();
          break;
        case "exit":
          router.back();
          break;
      }
    },
    [
      currentStepText,
      onSpeak,
      onStartTimer,
      onToggleVoice,
      onToggleFullscreen,
      onOpenIngredients,
      onOpenSettings,
      router,
    ]
  );

  const handleSwipe = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (!settings.swipeEnabled) return;

      switch (direction) {
        case "left":
          onNextStep();
          break;
        case "right":
          onPrevStep();
          break;
        case "up":
          executeGestureAction(settings.swipeUpAction);
          break;
        case "down":
          executeGestureAction(settings.swipeDownAction);
          break;
      }

      if (settings.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(30);
      }
    },
    [settings, onNextStep, onPrevStep, executeGestureAction]
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      executeGestureAction(settings.doubleTapAction);
      setLastTap(0);
    } else {
      setLastTap(now);
      // Single tap logic (existing tapToAdvance)
      if (settings.tapToAdvance) {
        if (currentStep < instructionsLength - 1) {
          onNextStep();
        }
      }
    }
  }, [lastTap, settings, currentStep, instructionsLength, executeGestureAction, onNextStep]);

  const handleTouchStart = useCallback(() => {
    const timer = setTimeout(() => {
      executeGestureAction(settings.longPressAction);
      if (settings.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  }, [settings, executeGestureAction]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return {
    handleSwipe,
    handleTap,
    handleTouchStart,
    handleTouchEnd,
  };
}
