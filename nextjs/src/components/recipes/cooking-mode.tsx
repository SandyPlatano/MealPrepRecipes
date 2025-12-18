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
} from "lucide-react";
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
import { HINT_IDS } from "@/lib/hints";
import { cn } from "@/lib/utils";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useVoiceReadout } from "@/hooks/use-voice-readout";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

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
  // Convert ingredients to user's preferred unit system
  const displayIngredients = convertIngredientsToSystem(recipe.ingredients, userUnitSystem);
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

  // Cooking state
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(recipe.ingredients.length).fill(false)
  );
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);

  // Get current step text for voice readout
  const currentStepText = recipe.instructions[currentStep] || "";

  // Get highlighted ingredients for current step
  const highlightedIngredientIndices = getHighlightedIngredientIndices(
    currentStepText,
    recipe.ingredients
  );

  // Voice readout hook
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: voiceReadoutSupported } = useVoiceReadout({
    speed: settings.voice.readoutSpeed,
    enabled: settings.voice.enabled,
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
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, recipe.instructions.length]);

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
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onSetTimer: startTimer,
    onStopTimer: resetTimer,
    onRepeat: readCurrentStep,
    onReadStep: readCurrentStep,
    enabled: settings.voice.enabled,
    wakeWord: settings.voice.wakeWord,
  });

  // Swipe gesture hook for step navigation
  const { ref: swipeRef, isSwiping } = useSwipeGesture({
    onSwipeLeft: handleNextStep, // Swipe left = next step
    onSwipeRight: handlePrevStep, // Swipe right = previous step
    threshold: 50,
    enabled: settings.gestures.swipeEnabled,
    hapticFeedback: settings.gestures.hapticFeedback,
  });

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
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      toast.info("Auto-advanced to next step");
    }
  }, [settings.behavior.autoAdvance, currentStep, recipe.instructions.length]);

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
  const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

  // Font size classes based on settings
  const fontSizeClass = FONT_SIZE_CLASSES[settings.display.fontSize];
  const proseSizeClass = PROSE_SIZE_CLASSES[settings.display.fontSize];

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
        "min-h-screen bg-background p-4 lg:p-8",
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
                : `Say "${settings.voice.wakeWord}"`}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {/* Voice Commands Toggle Button - Always visible */}
            <Button
              variant={isListening ? "default" : "ghost"}
              size="icon"
              disabled={!voiceCommandsSupported}
              onClick={() => {
                if (!voiceCommandsSupported) {
                  toast.error("Voice commands not supported in this browser. Try Chrome or Edge.");
                  return;
                }
                if (isListening) {
                  // Stop listening and disable voice
                  stopListening();
                  setSettings((prev) => ({
                    ...prev,
                    voice: { ...prev.voice, enabled: false },
                  }));
                  toast.info("Voice commands disabled");
                } else {
                  // Enable voice and start listening DIRECTLY (avoids stale closure issues)
                  setSettings((prev) => ({
                    ...prev,
                    voice: { ...prev.voice, enabled: true },
                  }));
                  startListening(); // Call directly, don't wait for useEffect
                  toast.success(`Voice commands enabled! Say "${settings.voice.wakeWord}" to start.`);
                }
              }}
              title={
                !voiceCommandsSupported
                  ? "Voice commands not supported in this browser"
                  : isListening
                    ? "Stop voice commands"
                    : voiceError
                      ? `Voice error: ${voiceError}`
                      : `Start voice commands (say "${settings.voice.wakeWord}")`
              }
            >
              {isListening ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className={cn("h-5 w-5", voiceError && "text-destructive")} />
              )}
            </Button>
            {/* Read Step Button */}
            {voiceReadoutSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={isSpeaking ? stopSpeaking : readCurrentStep}
                title={isSpeaking ? "Stop reading" : "Read step aloud"}
              >
                <Volume2 className={cn("h-5 w-5", isSpeaking && "text-primary animate-pulse")} />
              </Button>
            )}
            <Badge variant="outline">Cooking Mode</Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <h1 className="text-3xl lg:text-4xl font-mono font-bold">{recipe.title}</h1>

        {/* Progress bar - conditional */}
        {settings.visibility.showProgress && (
          <>
            <div className="mt-3 h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2">
              Step {currentStep + 1} of {recipe.instructions.length}
            </p>
          </>
        )}
      </div>

      <div
        className={cn(
          "max-w-6xl mx-auto grid gap-8",
          settings.visibility.showIngredients && "lg:grid-cols-[1fr_350px]"
        )}
      >
        {/* Main Content */}
        <div className="space-y-6">
          {settings.navigation.mode === "step-by-step" ? (
            <>
              {/* Step-by-Step View with Swipe Support */}
              <div ref={swipeRef as React.RefObject<HTMLDivElement>}>
                <Card className={cn("p-6 lg:p-10", isSwiping && "opacity-90 scale-[0.99] transition-transform")}>
                  <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm lg:text-base font-medium text-muted-foreground">
                      STEP {currentStep + 1}
                    </span>
                    {currentStep === recipe.instructions.length - 1 && (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Final Step
                      </Badge>
                    )}
                  </div>
                  <div className={cn("prose dark:prose-invert max-w-none prose-p:leading-relaxed", proseSizeClass)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {recipe.instructions[currentStep]}
                    </ReactMarkdown>
                  </div>

                  {/* Timer Section - conditional */}
                  {settings.visibility.showTimers && (
                    <>
                      {/* Auto-detected Timers */}
                      {(() => {
                        const detectedTimers = detectTimers(recipe.instructions[currentStep]);
                        return detectedTimers.length > 0 ? (
                          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
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
                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                        <span className="text-muted-foreground mr-2">Quick timers:</span>
                        {[5, 10, 15, 20, 30].map((mins) => (
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

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="flex-1 h-14"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
                <Button
                  size="lg"
                  onClick={handleNextStep}
                  disabled={currentStep === recipe.instructions.length - 1}
                  className="flex-1 h-14"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            /* Scrollable View */
            <CookModeScrollableView
              instructions={recipe.instructions}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onStartTimer={startTimer}
              proseSizeClass={proseSizeClass}
              showTimers={settings.visibility.showTimers}
            />
          )}

          {/* Done button - visible in both modes when on final step */}
          {currentStep === recipe.instructions.length - 1 && (
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

        {/* Sidebar - only show if ingredients are visible */}
        {settings.visibility.showIngredients && (
          <div className="space-y-6">
            {/* Timer display (always visible if timer is running) */}
            {(timerTotal > 0 || timerRunning) && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span className="font-medium">Timer</span>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold">
                      {String(timerMinutes).padStart(2, "0")}:
                      {String(timerSeconds).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTimer}
                    >
                      {timerRunning ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetTimer}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Ingredients Checklist with Current Step Highlighting */}
            <Card className="p-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Ingredients</span>
                  <div className="flex items-center gap-2">
                    {highlightedIngredientIndices.size > 0 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
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
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {displayIngredients.map((ingredient, index) => {
                    const isHighlighted = highlightedIngredientIndices.has(index);
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3 rounded-md p-2 -m-2 transition-colors",
                          isHighlighted && !checkedIngredients[index] && "bg-primary/10 ring-1 ring-primary/20"
                        )}
                      >
                        <Checkbox
                          id={`ingredient-${index}`}
                          checked={checkedIngredients[index]}
                          onCheckedChange={() => toggleIngredient(index)}
                          className="mt-0.5 h-5 w-5"
                        />
                        <label
                          htmlFor={`ingredient-${index}`}
                          className={cn(
                            "leading-relaxed cursor-pointer flex-1",
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

