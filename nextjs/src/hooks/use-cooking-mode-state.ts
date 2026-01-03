import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import type { Recipe } from "@/types/recipe";
import type { CookModeSettings, GestureAction } from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import { convertIngredientsToSystem } from "@/lib/ingredient-scaler";
import { getHighlightedIngredientIndices } from "@/lib/ingredient-matcher";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useVoiceReadout } from "@/hooks/use-voice-readout";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { HINT_IDS, isHintDismissedLocally } from "@/lib/hints";

interface UseCookingModeStateProps {
  recipe: Recipe;
  userUnitSystem?: UnitSystem;
  initialSettings?: CookModeSettings;
  dismissedHints?: string[];
  basePath?: string;
}

export function useCookingModeState({
  recipe,
  userUnitSystem = "imperial",
  initialSettings = DEFAULT_COOK_MODE_SETTINGS,
  dismissedHints = [],
  basePath = "/app",
}: UseCookingModeStateProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const originalThemeRef = useRef(theme);

  // Defensive: ensure arrays are never null/undefined
  const safeIngredients = recipe.ingredients || [];
  const safeInstructions = recipe.instructions || [];
  const displayIngredients = convertIngredientsToSystem(safeIngredients, userUnitSystem);

  // Check if this is the first time user is entering cook mode
  const isFirstTime = !dismissedHints.includes(HINT_IDS.COOK_MODE_WIZARD);
  const [showWizard, setShowWizard] = useState(isFirstTime);

  // Settings state
  const [settings, setSettings] = useState<CookModeSettings>(initialSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ingredientsSheetOpen, setIngredientsSheetOpen] = useState(false);

  // Cooking state
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(safeIngredients.length).fill(false)
  );

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);

  // Gesture state
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Get current step text and highlighted ingredients
  const currentStepText = safeInstructions[currentStep] || "";
  const highlightedIngredientIndices = getHighlightedIngredientIndices(
    currentStepText,
    safeIngredients
  );

  // Voice readout hook
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: voiceReadoutSupported } = useVoiceReadout({
    speed: settings.voice.readoutSpeed,
    enabled: settings.voice.enabled,
    voiceName: settings.audio?.ttsVoice,
    pitch: settings.audio?.ttsPitch,
    rate: settings.audio?.ttsRate,
    volume: settings.audio?.ttsVolume,
  });

  // Read current step aloud
  const readCurrentStep = useCallback(() => {
    speak(currentStepText);
  }, [speak, currentStepText]);

  // Helper to read ingredients for current step
  const readIngredientsForStep = useCallback(() => {
    const stepIngredients: string[] = [];
    highlightedIngredientIndices.forEach((index) => {
      if (displayIngredients[index]) {
        stepIngredients.push(displayIngredients[index]);
      }
    });

    if (stepIngredients.length > 0) {
      const ingredientList = stepIngredients.join(", ");
      speak(`Ingredients for this step: ${ingredientList}`);
    } else {
      speak("No specific ingredients highlighted for this step");
    }
  }, [highlightedIngredientIndices, displayIngredients, speak]);

  // Navigation handlers
  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleNextStep = useCallback(() => {
    if (currentStep < safeInstructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, safeInstructions.length]);

  // Timer handlers
  const startTimer = useCallback((minutes: number) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerTotal(minutes * 60);
    setTimerRunning(true);
    toast.success(`Timer started for ${minutes} minutes`);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerRunning(!timerRunning);
  }, [timerRunning]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerTotal(0);
  }, []);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  // Execute gesture actions
  const executeGestureAction = useCallback((action: GestureAction) => {
    switch (action) {
      case "none":
        break;
      case "repeat":
        speak(currentStepText);
        break;
      case "timer":
        startTimer(5);
        break;
      case "ingredients":
        setIngredientsSheetOpen(true);
        break;
      case "voice":
        // Handled by voice commands toggle
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "settings":
        setSettingsOpen(true);
        break;
      case "exit":
        router.back();
        break;
    }
  }, [currentStepText, speak, startTimer, toggleFullscreen, router]);

  // Voice commands hook
  const {
    isListening,
    isAwaitingCommand,
    lastCommand,
    error: voiceError,
    isSupported: voiceCommandsSupported,
    startListening,
    stopListening,
  } = useVoiceCommands({
    wakeWords: settings.voice.wakeWords,
    commandMappings: settings.voice.commandMappings,
    commandTimeout: settings.voice.commandTimeout / 1000,
    confirmCommands: settings.voice.confirmCommands,
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onSetTimer: startTimer,
    onStopTimer: resetTimer,
    onRepeat: readCurrentStep,
    onReadStep: readCurrentStep,
    onReadIngredients: readIngredientsForStep,
    onPause: () => {
      stopSpeaking();
    },
    onResume: readCurrentStep,
    enabled: settings.voice.enabled,
  });

  // Swipe handling
  const handleSwipe = useCallback((direction: "left" | "right" | "up" | "down") => {
    if (!settings.gestures.swipeEnabled) return;

    switch (direction) {
      case "left":
        handleNextStep();
        break;
      case "right":
        handlePrevStep();
        break;
      case "up":
        executeGestureAction(settings.gestures.swipeUpAction);
        break;
      case "down":
        executeGestureAction(settings.gestures.swipeDownAction);
        break;
    }

    if (settings.gestures.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [settings.gestures, handleNextStep, handlePrevStep, executeGestureAction]);

  const { ref: swipeRef, isSwiping } = useSwipeGesture({
    onSwipeLeft: () => handleSwipe("left"),
    onSwipeRight: () => handleSwipe("right"),
    threshold: 50,
    enabled: settings.gestures.swipeEnabled,
    hapticFeedback: settings.gestures.hapticFeedback,
  });

  // Tap handlers
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      executeGestureAction(settings.gestures.doubleTapAction);
      setLastTap(0);
    } else {
      setLastTap(now);
      // Single tap logic (existing tapToAdvance)
      if (settings.gestures.tapToAdvance) {
        if (currentStep < safeInstructions.length - 1) {
          setCurrentStep((prev) => prev + 1);
        }
      }
    }
  }, [lastTap, settings.gestures, currentStep, safeInstructions.length, executeGestureAction]);

  const handleTouchStart = useCallback(() => {
    const timer = setTimeout(() => {
      executeGestureAction(settings.gestures.longPressAction);
      if (settings.gestures.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  }, [settings.gestures, executeGestureAction]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Ingredient checklist
  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  }, []);

  // Play timer sound using Web Audio API
  const playTimerSound = useCallback(() => {
    if (!settings.behavior.timerSounds) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      const now = audioContext.currentTime;
      oscillator.start(now);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.setValueAtTime(0, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now + 0.3);
      gainNode.gain.setValueAtTime(0, now + 0.45);
      gainNode.gain.setValueAtTime(0.3, now + 0.6);
      gainNode.gain.setValueAtTime(0, now + 0.75);

      oscillator.stop(now + 0.8);

      setTimeout(() => audioContext.close(), 1000);
    } catch {
      // Audio not supported
    }
  }, [settings.behavior.timerSounds]);

  // Auto-advance to next step
  const autoAdvanceStep = useCallback(() => {
    if (!settings.behavior.autoAdvance) return;
    if (currentStep < safeInstructions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      toast.info("Auto-advanced to next step");
    }
  }, [settings.behavior.autoAdvance, currentStep, safeInstructions.length]);

  // Wizard handlers
  const handleWizardComplete = useCallback((newSettings: CookModeSettings) => {
    setSettings(newSettings);
    setShowWizard(false);
  }, []);

  const handleWizardSkip = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Check localStorage on client-side mount as a fallback
  useEffect(() => {
    if (showWizard && isHintDismissedLocally(HINT_IDS.COOK_MODE_WIZARD)) {
      setShowWizard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-read step when it changes
  useEffect(() => {
    if (settings.voice.enabled && settings.voice.autoReadSteps && voiceReadoutSupported) {
      readCurrentStep();
    }
  }, [currentStep, settings.voice.enabled, settings.voice.autoReadSteps, voiceReadoutSupported, readCurrentStep]);

  // Stop voice listening when disabled
  useEffect(() => {
    if (!settings.voice.enabled && isListening) {
      stopListening();
    }
  }, [settings.voice.enabled, isListening, stopListening]);

  // Show error toast when voice fails
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Handle theme override
  useEffect(() => {
    if (settings.display.themeOverride !== "system") {
      setTheme(settings.display.themeOverride);
    }
    return () => {
      if (originalThemeRef.current && settings.display.themeOverride !== "system") {
        setTheme(originalThemeRef.current);
      }
    };
  }, [settings.display.themeOverride, setTheme]);

  // Keep screen awake
  useEffect(() => {
    if (!settings.behavior.keepScreenAwake) return;

    let wakeLock: { release: () => void } | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          const nav = navigator as { wakeLock?: { request: (type: string) => Promise<{ release: () => void }> } };
          if (nav.wakeLock) {
            wakeLock = await nav.wakeLock.request("screen");
          }
        }
      } catch {
        // Wake lock not supported or failed
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [settings.behavior.keepScreenAwake]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle page title with timer
  useEffect(() => {
    if (settings.timers?.showTimerInTitle && timerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      const timeStr = `${timerMinutes}:${timerSeconds.toString().padStart(2, "0")}`;
      document.title = `${timeStr} - Cooking Mode`;
    } else {
      document.title = `Cooking ${recipe.title}`;
    }

    return () => {
      document.title = "MealPrepRecipes";
    };
  }, [timerMinutes, timerSeconds, timerRunning, settings.timers?.showTimerInTitle, recipe.title]);

  // Timer countdown logic
  useEffect(() => {
    if (!timerRunning || (timerMinutes === 0 && timerSeconds === 0)) {
      if (timerMinutes === 0 && timerSeconds === 0 && timerTotal > 0) {
        toast.success("Timer finished!", { duration: 5000 });
        setTimerRunning(false);
        playTimerSound();
        autoAdvanceStep();
      }
      return;
    }

    const interval = setInterval(() => {
      if (timerSeconds > 0) {
        setTimerSeconds(timerSeconds - 1);
      } else if (timerMinutes > 0) {
        setTimerMinutes(timerMinutes - 1);
        setTimerSeconds(59);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerMinutes, timerSeconds, timerTotal, playTimerSound, autoAdvanceStep]);

  // Computed values
  const allIngredientsChecked = checkedIngredients.every((checked) => checked);
  const progress = ((currentStep + 1) / safeInstructions.length) * 100;

  return {
    // Data
    recipe,
    safeIngredients,
    safeInstructions,
    displayIngredients,
    currentStepText,
    highlightedIngredientIndices,
    basePath,

    // State
    settings,
    settingsOpen,
    isFullscreen,
    ingredientsSheetOpen,
    currentStep,
    checkedIngredients,
    showWizard,
    swipeRef,
    isSwiping,

    // Timer state
    timerMinutes,
    timerSeconds,
    timerRunning,
    timerTotal,

    // Voice state
    isListening,
    isAwaitingCommand,
    lastCommand,
    voiceError,
    voiceCommandsSupported,
    voiceReadoutSupported,
    isSpeaking,

    // Computed
    allIngredientsChecked,
    progress,

    // Actions
    setSettings,
    setSettingsOpen,
    setIngredientsSheetOpen,
    setCurrentStep,
    handlePrevStep,
    handleNextStep,
    toggleIngredient,
    readCurrentStep,
    readIngredientsForStep,
    handleWizardComplete,
    handleWizardSkip,

    // Timer controls
    startTimer,
    toggleTimer,
    resetTimer,

    // Voice controls
    startListening,
    stopListening,
    speak,
    stopSpeaking,

    // Gesture handlers
    handleTap,
    handleTouchStart,
    handleTouchEnd,
    handleSwipe,

    // Fullscreen
    toggleFullscreen,
  };
}
