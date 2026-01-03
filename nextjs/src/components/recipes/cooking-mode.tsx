"use client";

import { useRouter } from "next/navigation";
import type { Recipe } from "@/types/recipe";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import type { CookModeSettings } from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";
import { cn } from "@/lib/utils";
import { CookModeSettingsSheet } from "./cook-mode-settings-sheet";
import { CookModeScrollableView } from "./cook-mode-scrollable-view";
import { CookModeWizard } from "./cook-mode-wizard";
import { CookModeIngredientsSheet } from "./cook-mode-ingredients-sheet";
import { useCookingModeState } from "@/hooks/use-cooking-mode-state";
import {
  CookingModeHeader,
  CookingModeStep,
  CookingModeTimer,
  CookingModeIngredients,
  CookingModeNavigation,
  CookingModeVoiceIndicator,
  CookingModeFAB,
} from "./cooking-mode/index";

interface CookingModeProps {
  recipe: Recipe;
  userUnitSystem?: UnitSystem;
  initialSettings?: CookModeSettings;
  dismissedHints?: string[];
  /** Base path for recipe routes (e.g., "/app" or "/demo"). Defaults to "/app" */
  basePath?: string;
}

// Font size CSS class mapping
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
  const router = useRouter();

  // Use custom hook for all state and logic
  const {
    // Data
    safeInstructions,
    displayIngredients,
    highlightedIngredientIndices,

    // State
    settings,
    settingsOpen,
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
    handleWizardComplete,
    handleWizardSkip,

    // Timer controls
    startTimer,
    toggleTimer,
    resetTimer,

    // Voice controls
    startListening,
    stopListening,
    stopSpeaking,

    // Gesture handlers
    handleTap,
    handleTouchStart,
    handleTouchEnd,

    // Fullscreen
    toggleFullscreen,
  } = useCookingModeState({
    recipe,
    userUnitSystem,
    initialSettings,
    dismissedHints,
    basePath,
  });

  // Font size classes based on settings
  const fontSizeClass = FONT_SIZE_CLASSES[settings.display.fontSize];
  const proseSizeClass = PROSE_SIZE_CLASSES[settings.display.fontSize];

  // Display customization helpers
  const getTransitionClass = (transition: string) => {
    switch (transition) {
      case "fade":
        return "transition-opacity duration-300";
      case "slide":
        return "transition-transform duration-300";
      default:
        return "";
    }
  };

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

      {/* Mobile FAB for Ingredients */}
      {settings.visibility.showIngredients && (
        <CookingModeFAB
          highlightedCount={highlightedIngredientIndices.size}
          onClick={() => setIngredientsSheetOpen(true)}
        />
      )}

      {/* Voice Listening Indicator */}
      {settings.voice.enabled && (
        <CookingModeVoiceIndicator
          isListening={isListening}
          isAwaitingCommand={isAwaitingCommand}
          wakeWord={settings.voice.wakeWords?.[0] || "hey chef"}
        />
      )}

      {/* Header */}
      <CookingModeHeader
        currentStep={currentStep}
        totalSteps={safeInstructions.length}
        recipeTitle={recipe.title}
        progress={progress}
        showProgress={settings.visibility.showProgress}
        isFullscreen={false}
        isListening={isListening}
        isSpeaking={isSpeaking}
        voiceCommandsSupported={voiceCommandsSupported}
        voiceReadoutSupported={voiceReadoutSupported}
        settings={settings}
        onExit={() => router.back()}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setSettingsOpen(true)}
        onReadStep={readCurrentStep}
        onStopSpeaking={stopSpeaking}
        onStartListening={startListening}
        onStopListening={stopListening}
        onSettingsChange={setSettings}
      />

      <div
        className={cn(
          "max-w-6xl mx-auto grid gap-10 lg:gap-12",
          settings.visibility.showIngredients && "lg:grid-cols-[1fr_400px]"
        )}
      >
        {/* Main Content */}
        <div className="flex flex-col">
          {settings.navigation.mode === "step-by-step" ? (
            <>
              {/* Step-by-Step View */}
              <CookingModeStep
                stepNumber={currentStep + 1}
                totalSteps={safeInstructions.length}
                stepText={safeInstructions[currentStep]}
                showTimers={settings.visibility.showTimers}
                quickTimerPresets={settings.timers?.quickTimerPresets || [5, 10, 15, 20, 30]}
                isSwiping={isSwiping}
                transitionClass={getTransitionClass(settings.display.stepTransition)}
                proseSizeClass={proseSizeClass}
                onStartTimer={startTimer}
                onTap={handleTap}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                swipeRef={swipeRef as React.RefObject<HTMLDivElement>}
              />

              {/* Navigation */}
              <CookingModeNavigation
                currentStep={currentStep}
                totalSteps={safeInstructions.length}
                recipeId={recipe.id}
                basePath={basePath}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onNavigate={(path) => router.push(path)}
              />
            </>
          ) : (
            <>
              {/* Scrollable View */}
              <CookModeScrollableView
                instructions={safeInstructions}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onStartTimer={startTimer}
                proseSizeClass={proseSizeClass}
                showTimers={settings.visibility.showTimers}
              />

              {/* Done button for scrollable mode */}
              {currentStep === safeInstructions.length - 1 && (
                <CookingModeNavigation
                  currentStep={currentStep}
                  totalSteps={safeInstructions.length}
                  recipeId={recipe.id}
                  basePath={basePath}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                  onNavigate={(path) => router.push(path)}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar - only show on desktop if ingredients are visible */}
        {settings.visibility.showIngredients && (
          <div className="flex hidden lg:block flex-col">
            {/* Timer display */}
            <CookingModeTimer
              timerMinutes={timerMinutes}
              timerSeconds={timerSeconds}
              timerRunning={timerRunning}
              timerTotal={timerTotal}
              onToggle={toggleTimer}
              onReset={resetTimer}
            />

            {/* Ingredients Checklist */}
            <CookingModeIngredients
              ingredients={displayIngredients}
              checkedIngredients={checkedIngredients}
              highlightedIndices={highlightedIngredientIndices}
              allChecked={allIngredientsChecked}
              onToggle={toggleIngredient}
            />
          </div>
        )}
      </div>
    </div>
  );
}
