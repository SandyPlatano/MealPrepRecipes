"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Check,
  Settings2,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  Volume2,
  MoreVertical,
  UtensilsCrossed,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";
import { detectTimers } from "@/lib/timer-detector";
import { convertIngredientsToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
import { getHighlightedIngredientIndices } from "@/lib/ingredient-matcher";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CookModeSettings } from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";
import { CookModeSettingsSheet } from "./cook-mode-settings-sheet";
import { CookModeScrollableView } from "./cook-mode-scrollable-view";
import { CookModeWizard } from "./cook-mode-wizard";
import { CookModeIngredientsSheet } from "./cook-mode-ingredients-sheet";
import { HINT_IDS } from "@/lib/hints";
import { cn } from "@/lib/utils";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useVoiceReadout } from "@/hooks/use-voice-readout";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { findMatchingCommand, DEFAULT_VOICE_COMMANDS } from "@/lib/default-voice-commands";
import type { GestureAction } from "@/types/settings";

interface CookingModeProps {
  recipe: Recipe;
  userUnitSystem?: UnitSystem;
  initialSettings?: CookModeSettings;
  dismissedHints?: string[];
  /** Base path for recipe routes (e.g., "/app" or "/demo"). Defaults to "/app" */
  basePath?: string;
}

// Font size CSS class mapping (including extra-large for kitchen readability)
const FONT_SIZE_CLASSES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  "extra-large": "text-xl",
} as const;

const PROSE_SIZE_CLASSES = {
  small: "prose-sm",
  medium: "prose-base",
  large: "prose-lg",
  "extra-large": "prose-xl",
} as const;

export function CookingMode({
  recipe,
  userUnitSystem = "imperial",
  initialSettings = DEFAULT_COOK_MODE_SETTINGS,
  dismissedHints = [],
  basePath = "/app",
}: CookingModeProps) {
  // Defensive: ensure arrays are never null/undefined
  const safeIngredients = recipe.ingredients || [];
  const safeInstructions = recipe.instructions || [];

  // Convert ingredients to user's preferred unit system
  const displayIngredients = convertIngredientsToSystem(safeIngredients, userUnitSystem);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const originalThemeRef = useRef(theme);

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
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);

  // Get current step text for voice readout
  const currentStepText = safeInstructions[currentStep] || "";

  // Get highlighted ingredients for current step
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

  // Navigation handlers (need to be defined before voice commands hook)
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

  const startTimer = useCallback((minutes: number) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerTotal(minutes * 60);
    setTimerRunning(true);
    toast.success(`Timer started for ${minutes} minutes`);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerTotal(0);
  }, []);

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

  // Execute gesture actions
  const executeGestureAction = useCallback((action: GestureAction) => {
    switch (action) {
      case "none":
        break;
      case "repeat":
        speak(currentStepText);
        break;
      case "timer":
        // For now, just start a quick 5-minute timer
        // Could be enhanced to open a timer picker
        startTimer(5);
        break;
      case "ingredients":
        setIngredientsSheetOpen(true);
        break;
      case "voice":
        // Toggle voice listening
        if (isListening) {
          stopListening();
        } else if (voiceCommandsSupported) {
          startListening();
        }
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
  }, [currentStepText, speak, startTimer, isListening, stopListening, startListening, voiceCommandsSupported, router]);

  // Swipe gesture hook for step navigation - with vertical swipe support
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number>(0);

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

  // Double-tap handler
  const [lastTap, setLastTap] = useState<number>(0);

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

  // Long-press handler
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(() => {
    const timer = setTimeout(() => {
      executeGestureAction(settings.gestures.longPressAction);
      if (settings.gestures.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  }, [settings.gestures, executeGestureAction]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Auto-read step when it changes (if enabled)
  useEffect(() => {
    if (settings.voice.enabled && settings.voice.autoReadSteps && voiceReadoutSupported) {
      readCurrentStep();
    }
  }, [currentStep, settings.voice.enabled, settings.voice.autoReadSteps, voiceReadoutSupported, readCurrentStep]);

  // Stop voice listening when disabled (e.g., from settings sheet)
  // Starting is handled directly in the mic button onClick
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
    // Restore original theme when leaving
    return () => {
      if (originalThemeRef.current && settings.display.themeOverride !== "system") {
        setTheme(originalThemeRef.current);
      }
    };
  }, [settings.display.themeOverride, setTheme]);

  // Keep screen awake (conditional on setting)
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Play timer sound using Web Audio API (no file needed)
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

      // Pleasant beep sound
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      // Play 3 short beeps
      const now = audioContext.currentTime;
      oscillator.start(now);

      // Beep pattern: on-off-on-off-on-off
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.setValueAtTime(0, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now + 0.3);
      gainNode.gain.setValueAtTime(0, now + 0.45);
      gainNode.gain.setValueAtTime(0.3, now + 0.6);
      gainNode.gain.setValueAtTime(0, now + 0.75);

      oscillator.stop(now + 0.8);

      // Cleanup
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

  // Timer logic with sound and auto-advance
  useEffect(() => {
    if (!timerRunning || (timerMinutes === 0 && timerSeconds === 0)) {
      if (timerMinutes === 0 && timerSeconds === 0 && timerTotal > 0) {
        // Timer finished
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

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const allIngredientsChecked = checkedIngredients.every((checked) => checked);
  const progress = ((currentStep + 1) / safeInstructions.length) * 100;

  // Font size classes based on settings
  const fontSizeClass = FONT_SIZE_CLASSES[settings.display.fontSize];
  const proseSizeClass = PROSE_SIZE_CLASSES[settings.display.fontSize];

  // Display customization helpers
  const getHighlightStyle = useCallback((style: string) => {
    switch (style) {
      case "bold":
        return "font-bold";
      case "underline":
        return "underline underline-offset-2";
      case "background":
        return `bg-[${settings.display.accentColor}]/20 px-1 rounded`;
      case "badge":
        return `inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[${settings.display.accentColor}]/20`;
      default:
        return "font-semibold";
    }
  }, [settings.display.accentColor]);

  const getTransitionClass = useCallback((transition: string) => {
    switch (transition) {
      case "fade":
        return "transition-opacity duration-300";
      case "slide":
        return "transition-transform duration-300";
      default:
        return "";
    }
  }, []);

  // Handle wizard completion - apply new settings and close wizard
  const handleWizardComplete = useCallback((newSettings: CookModeSettings) => {
    setSettings(newSettings);
    setShowWizard(false);
  }, []);

  // Handle wizard skip - use current/default settings
  const handleWizardSkip = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Show wizard for first-time users
  if (showWizard) {
    return (
      <CookModeWizard
        initialSettings={settings}
        onComplete={handleWizardComplete}
        onSkip={handleWizardSkip}
      />
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background p-6 lg:p-10",
        fontSizeClass,
        settings.display.highContrast && "contrast-more"
      )}
    >
      {/* Settings Sheet */}
      <CookModeSettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Mobile Ingredients Sheet */}
      <CookModeIngredientsSheet
        isOpen={ingredientsSheetOpen}
        onClose={() => setIngredientsSheetOpen(false)}
        ingredients={displayIngredients}
        checkedIngredients={checkedIngredients}
        highlightedIndices={highlightedIngredientIndices}
        onToggleIngredient={toggleIngredient}
      />

      {/* Mobile FAB for Ingredients - Only visible on mobile/tablet */}
      {settings.visibility.showIngredients && (
        <button
          onClick={() => setIngredientsSheetOpen(true)}
          className={cn(
            "fixed bottom-8 right-6 z-40 lg:hidden",
            "h-16 w-16 rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-xl shadow-primary/30",
            "flex items-center justify-center",
            "active:scale-95 transition-all duration-200",
            "hover:shadow-2xl hover:shadow-primary/40"
          )}
          aria-label="View ingredients"
        >
          <UtensilsCrossed className="h-7 w-7" />
          {/* Badge showing how many ingredients needed for this step */}
          {highlightedIngredientIndices.size > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
              {highlightedIngredientIndices.size}
            </span>
          )}
        </button>
      )}

      {/* Voice Listening Indicator - Fixed position */}
      {settings.voice.enabled && isListening && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg transition-all duration-300",
            isAwaitingCommand
              ? "bg-primary text-primary-foreground animate-pulse"
              : "bg-muted text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Mic className={cn("h-4 w-4", isAwaitingCommand && "animate-bounce")} />
            <span className="text-sm font-medium">
              {isAwaitingCommand
                ? "Listening... say a command"
                : `Say "${settings.voice.wakeWords?.[0] || "hey chef"}"`}
            </span>
          </div>
        </div>
      )}

      {/* Simplified Header - Clean, focused design */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Center: Step Indicator (always visible, prominent) */}
          <div className="text-center">
            <span className="text-lg lg:text-xl font-bold">
              Step {currentStep + 1} of {safeInstructions.length}
            </span>
          </div>

          {/* Right: Dropdown Menu for secondary controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12">
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Voice Commands */}
              <DropdownMenuItem
                disabled={!voiceCommandsSupported}
                onClick={() => {
                  console.log("[CookingMode] Voice button clicked");
                  console.log("[CookingMode] voiceCommandsSupported:", voiceCommandsSupported);
                  console.log("[CookingMode] isListening:", isListening);
                  console.log("[CookingMode] settings.voice:", settings.voice);

                  if (!voiceCommandsSupported) {
                    toast.error("Voice commands not supported in this browser. Try Chrome or Edge.");
                    return;
                  }
                  if (isListening) {
                    console.log("[CookingMode] Stopping voice...");
                    stopListening();
                    setSettings((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, enabled: false },
                    }));
                    toast.info("Voice commands disabled");
                  } else {
                    console.log("[CookingMode] Starting voice...");
                    setSettings((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, enabled: true },
                    }));
                    startListening();
                    toast.success(`Voice commands enabled! Say "${settings.voice.wakeWords?.[0] || "hey chef"}" to start.`);
                  }
                }}
              >
                {isListening ? (
                  <Mic className="h-4 w-4 mr-2" />
                ) : (
                  <MicOff className="h-4 w-4 mr-2" />
                )}
                {isListening ? "Disable Voice Commands" : "Enable Voice Commands"}
              </DropdownMenuItem>

              {/* Read Step Aloud */}
              {voiceReadoutSupported && (
                <DropdownMenuItem onClick={isSpeaking ? stopSpeaking : readCurrentStep}>
                  <Volume2 className={cn("h-4 w-4 mr-2", isSpeaking && "text-primary")} />
                  {isSpeaking ? "Stop Reading" : "Read Step Aloud"}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Fullscreen */}
              <DropdownMenuItem onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize className="h-4 w-4 mr-2" />
                ) : (
                  <Maximize className="h-4 w-4 mr-2" />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Settings */}
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Recipe Title */}
        <h1 className="text-3xl lg:text-4xl font-mono font-bold mb-6">{recipe.title}</h1>

        {/* Enhanced Progress bar - thicker, more visible */}
        {settings.visibility.showProgress && (
          <div className="mt-4">
            <div className="h-3 lg:h-4 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "max-w-6xl mx-auto grid gap-10 lg:gap-12",
          settings.visibility.showIngredients && "lg:grid-cols-[1fr_400px]"
        )}
      >
        {/* Main Content */}
        <div className="space-y-8">
          {settings.navigation.mode === "step-by-step" ? (
            <>
              {/* Step-by-Step View with Swipe Support */}
              <div
                ref={swipeRef as React.RefObject<HTMLDivElement>}
                onClick={handleTap}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
              >
                <Card className={cn(
                  "p-8 lg:p-12",
                  isSwiping && "opacity-90 scale-[0.99] transition-transform",
                  getTransitionClass(settings.display.stepTransition)
                )}>
                  <div className="space-y-8">
                  {/* Step Number Hero - Large, prominent, easy to scan */}
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "flex-shrink-0",
                        "w-16 h-16 lg:w-20 lg:h-20",
                        "rounded-2xl lg:rounded-3xl",
                        "bg-gradient-to-br from-primary to-primary/80",
                        "text-primary-foreground",
                        "flex items-center justify-center",
                        "text-2xl lg:text-3xl font-bold font-mono",
                        "shadow-lg shadow-primary/25",
                        currentStep === safeInstructions.length - 1 && "ring-4 ring-primary/30"
                      )}
                    >
                      {currentStep + 1}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                        Step
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg lg:text-xl font-semibold">
                          {currentStep + 1} of {safeInstructions.length}
                        </span>
                        {currentStep === safeInstructions.length - 1 && (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Final
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cn("prose dark:prose-invert max-w-none prose-p:leading-relaxed", proseSizeClass)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {safeInstructions[currentStep]}
                    </ReactMarkdown>
                  </div>

                  {/* Timer Section - conditional */}
                  {settings.visibility.showTimers && (
                    <>
                      {/* Auto-detected Timers */}
                      {(() => {
                        const detectedTimers = detectTimers(safeInstructions[currentStep]);
                        return detectedTimers.length > 0 ? (
                          <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t">
                            <span className="text-muted-foreground mr-2">
                              Detected timers:
                            </span>
                            {detectedTimers.map((timer, idx) => (
                              <Button
                                key={idx}
                                variant="default"
                                onClick={() => startTimer(timer.minutes)}
                                className="gap-2"
                              >
                                <Timer className="h-4 w-4" />
                                {timer.displayText}
                              </Button>
                            ))}
                          </div>
                        ) : null;
                      })()}

                      {/* Quick Timer Buttons */}
                      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
                        <span className="text-muted-foreground mr-2">Quick timers:</span>
                        {(settings.timers?.quickTimerPresets || [5, 10, 15, 20, 30]).map((mins) => (
                          <Button
                            key={mins}
                            variant="outline"
                            onClick={() => startTimer(mins)}
                          >
                            {mins} min
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                  </div>
                </Card>
              </div>

              {/* Navigation - Enhanced for touch */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="flex-1 h-16 text-base rounded-xl border-2"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
                <Button
                  size="lg"
                  onClick={handleNextStep}
                  disabled={currentStep === safeInstructions.length - 1}
                  className="flex-1 h-16 text-base rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            /* Scrollable View */
            <CookModeScrollableView
              instructions={safeInstructions}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onStartTimer={startTimer}
              proseSizeClass={proseSizeClass}
              showTimers={settings.visibility.showTimers}
            />
          )}

          {/* Done button - visible in both modes when on final step */}
          {currentStep === safeInstructions.length - 1 && (
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                toast.success("Great job! Enjoy your meal!");
                router.push(`${basePath}/recipes/${recipe.id}`);
              }}
            >
              <Check className="h-5 w-5 mr-2" />
              Done Cooking!
            </Button>
          )}
        </div>

        {/* Sidebar - only show on desktop if ingredients are visible */}
        {settings.visibility.showIngredients && (
          <div className="hidden lg:block space-y-8">
            {/* Timer display (always visible if timer is running) */}
            {(timerTotal > 0 || timerRunning) && (
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Timer className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Timer</span>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-6xl font-mono font-bold tabular-nums",
                      timerRunning && "text-primary"
                    )}>
                      {String(timerMinutes).padStart(2, "0")}:
                      {String(timerSeconds).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={toggleTimer}
                      className="h-12 w-12"
                    >
                      {timerRunning ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetTimer}
                      className="h-12 w-12"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Ingredients Checklist with Current Step Highlighting */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Ingredients</span>
                  <div className="flex items-center gap-2">
                    {highlightedIngredientIndices.size > 0 && (
                      <Badge variant="secondary" className="gap-1 text-sm">
                        {highlightedIngredientIndices.size} for this step
                      </Badge>
                    )}
                    {allIngredientsChecked && (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        All set!
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {displayIngredients.map((ingredient, index) => {
                    const isHighlighted = highlightedIngredientIndices.has(index);
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-4 rounded-lg p-3 -m-3 transition-colors",
                          isHighlighted && !checkedIngredients[index] && "bg-primary/10 ring-1 ring-primary/20"
                        )}
                      >
                        <Checkbox
                          id={`ingredient-${index}`}
                          checked={checkedIngredients[index]}
                          onCheckedChange={() => toggleIngredient(index)}
                          className="mt-0.5 h-6 w-6"
                        />
                        <label
                          htmlFor={`ingredient-${index}`}
                          className={cn(
                            "text-base leading-relaxed cursor-pointer flex-1",
                            checkedIngredients[index] && "line-through text-muted-foreground",
                            isHighlighted && !checkedIngredients[index] && "font-medium text-primary"
                          )}
                        >
                          {ingredient}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

