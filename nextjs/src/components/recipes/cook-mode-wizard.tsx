"use client";

/**
 * Cook Mode Wizard
 * Full-screen onboarding wizard for first-time cook mode users.
 * Features:
 * - 4-step guided setup
 * - Preset selection on step 1
 * - Live preview throughout
 * - Skip option always available
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChefHat,
  ArrowRight,
  ArrowLeft,
  X,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCookModeSettings } from "@/app/actions/settings";
import { dismissHint } from "@/app/actions/settings";
import { HINT_IDS, dismissHintLocally } from "@/lib/hints";
import { toast } from "sonner";
import type {
  CookModeSettings,
  CookModeFontSize,
  CookModeTheme,
} from "@/types/settings";
import { COOK_MODE_PRESETS, getMatchingPreset } from "@/lib/cook-mode-presets";
import { CookModePresetCard } from "./cook-mode-preset-card";
import { CookModeSettingsPreview } from "./cook-mode-settings-preview";

interface CookModeWizardProps {
  initialSettings: CookModeSettings;
  onComplete: (settings: CookModeSettings) => void;
  onSkip: () => void;
}

const TOTAL_STEPS = 4;

export function CookModeWizard({
  initialSettings,
  onComplete,
  onSkip,
}: CookModeWizardProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<CookModeSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;
  const currentPreset = getMatchingPreset(settings);

  // Update a single setting category
  const updateSetting = useCallback(
    <K extends keyof CookModeSettings>(
      category: K,
      key: keyof CookModeSettings[K],
      value: CookModeSettings[K][typeof key]
    ) => {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    },
    []
  );

  // Apply a preset
  const applyPreset = useCallback((presetKey: string) => {
    const preset = COOK_MODE_PRESETS.find((p) => p.key === presetKey);
    if (preset) {
      setSettings(preset.settings);
    }
  }, []);

  // Handle skip
  const handleSkip = useCallback(async () => {
    // Always dismiss locally first as a reliable fallback
    dismissHintLocally(HINT_IDS.COOK_MODE_WIZARD);

    // Dismiss hint in database so wizard won't show again
    const dismissResult = await dismissHint(HINT_IDS.COOK_MODE_WIZARD);
    if (dismissResult.error) {
      console.error("Failed to dismiss wizard hint:", dismissResult.error);
      // Continue anyway - localStorage backup ensures wizard won't show again
    }
    onSkip();
  }, [onSkip]);

  // Handle completion
  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save settings
      const result = await updateCookModeSettings(settings);
      if (result.error) {
        toast.error("Failed to save settings");
        setIsSaving(false);
        return;
      }

      // Always dismiss locally first as a reliable fallback
      dismissHintLocally(HINT_IDS.COOK_MODE_WIZARD);

      // Dismiss hint in database so wizard won't show again
      const dismissResult = await dismissHint(HINT_IDS.COOK_MODE_WIZARD);
      if (dismissResult.error) {
        console.error("Failed to dismiss wizard hint:", dismissResult.error);
        // Continue anyway - localStorage backup ensures wizard won't show again
      }

      toast.success("Cook mode configured!");
      onComplete(settings);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }, [settings, onComplete]);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold">Set Up Cook Mode</h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          <X className="h-4 w-4 mr-1" />
          Skip
        </Button>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
            {/* Main Content */}
            <div className="flex flex-col">
              {/* Step 1: Welcome + Presets */}
              {step === 1 && (
                <div className="flex flex-col">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                      Welcome to Cook Mode! 🍳
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Choose a preset that fits your cooking style, or customize everything yourself.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {COOK_MODE_PRESETS.map((preset) => (
                      <CookModePresetCard
                        key={preset.key}
                        preset={preset}
                        isSelected={currentPreset === preset.key}
                        onSelect={() => applyPreset(preset.key)}
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground">
                    Don&apos;t worry — you can customize these settings in the next steps or change them anytime.
                  </p>
                </div>
              )}

              {/* Step 2: Display Settings */}
              {step === 2 && (
                <div className="flex flex-col">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-3">Display Settings</h2>
                    <p className="text-lg text-muted-foreground">
                      Adjust how cook mode looks on your screen.
                    </p>
                  </div>

                  {/* Font Size */}
                  <div className="flex flex-col">
                    <Label className="text-base font-medium">Font Size</Label>
                    <p className="text-sm text-muted-foreground">
                      Larger text is easier to read from a distance in the kitchen.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {(["small", "medium", "large"] as CookModeFontSize[]).map(
                        (size) => (
                          <Button
                            key={size}
                            variant={
                              settings.display.fontSize === size
                                ? "default"
                                : "outline"
                            }
                            size="lg"
                            onClick={() =>
                              updateSetting("display", "fontSize", size)
                            }
                            className="capitalize h-14"
                          >
                            {size}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Theme Override */}
                  <div className="flex flex-col">
                    <Label className="text-base font-medium">Theme Override</Label>
                    <p className="text-sm text-muted-foreground">
                      Dark mode can be easier on your eyes, or match your kitchen lighting.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { value: "system", icon: Monitor, label: "System" },
                          { value: "light", icon: Sun, label: "Light" },
                          { value: "dark", icon: Moon, label: "Dark" },
                        ] as { value: CookModeTheme; icon: typeof Monitor; label: string }[]
                      ).map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={
                            settings.display.themeOverride === value
                              ? "default"
                              : "outline"
                          }
                          size="lg"
                          onClick={() =>
                            updateSetting("display", "themeOverride", value)
                          }
                          className="h-14 gap-2"
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Visibility */}
              {step === 3 && (
                <div className="flex flex-col">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-3">What to Show</h2>
                    <p className="text-lg text-muted-foreground">
                      Choose which elements appear on screen while cooking.
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <WizardToggle
                      label="Ingredients Sidebar"
                      description="Keep track of ingredients with a checklist on the side."
                      checked={settings.visibility.showIngredients}
                      onCheckedChange={(checked) =>
                        updateSetting("visibility", "showIngredients", checked)
                      }
                    />
                    <WizardToggle
                      label="Timers"
                      description="Show detected cooking timers and quick-start buttons."
                      checked={settings.visibility.showTimers}
                      onCheckedChange={(checked) =>
                        updateSetting("visibility", "showTimers", checked)
                      }
                    />
                    <WizardToggle
                      label="Progress Bar"
                      description="See how far along you are in the recipe."
                      checked={settings.visibility.showProgress}
                      onCheckedChange={(checked) =>
                        updateSetting("visibility", "showProgress", checked)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Behavior */}
              {step === 4 && (
                <div className="flex flex-col">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-3">Behavior Settings</h2>
                    <p className="text-lg text-muted-foreground">
                      Fine-tune how cook mode behaves while you&apos;re cooking.
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <WizardToggle
                      label="Keep Screen Awake"
                      description="Prevent your device from sleeping while cooking. Great for messy hands!"
                      checked={settings.behavior.keepScreenAwake}
                      onCheckedChange={(checked) =>
                        updateSetting("behavior", "keepScreenAwake", checked)
                      }
                    />
                    <WizardToggle
                      label="Timer Sounds"
                      description="Play a sound when your cooking timer finishes."
                      checked={settings.behavior.timerSounds}
                      onCheckedChange={(checked) =>
                        updateSetting("behavior", "timerSounds", checked)
                      }
                    />
                    <WizardToggle
                      label="Auto-Advance Steps"
                      description="Automatically move to the next step when a timer ends. Perfect for hands-free cooking!"
                      checked={settings.behavior.autoAdvance}
                      onCheckedChange={(checked) =>
                        updateSetting("behavior", "autoAdvance", checked)
                      }
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      ✨ You can always change these settings later using the gear icon in cook mode.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel - Always visible on large screens */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <CookModeSettingsPreview settings={settings} className="min-h-[400px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="gap-2"
          >
            {step === TOTAL_STEPS ? (
              <>
                {isSaving ? "Saving..." : "Start Cooking!"}
                {!isSaving && <Check className="h-4 w-4" />}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Toggle setting for wizard with larger tap targets
 */
interface WizardToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function WizardToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: WizardToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors text-left w-full",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        checked && "bg-primary/5 border-primary/50"
      )}
    >
      <div className="flex-1 pr-4">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()}
      />
    </button>
  );
}
