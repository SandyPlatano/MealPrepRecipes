"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Plus, Users, ArrowRight, Check, Activity, Target } from "lucide-react";
import { updateProfile, updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import type { MacroGoals, MacroGoalPreset } from "@/types/nutrition";
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";

// Default colors for cooks
const defaultColors = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
  currentName?: string;
  currentCookNames?: string[];
  currentCookColors?: Record<string, string>;
}

export function OnboardingDialog({
  open,
  onComplete,
  currentName = "",
  currentCookNames = [],
  currentCookColors = {},
}: OnboardingDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(currentName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentName.split(" ")[1] || "");
  const [cookNames, setCookNames] = useState<string[]>(currentCookNames.length > 0 ? currentCookNames : ["Me", ""]);
  const [cookColors, setCookColors] = useState<Record<string, string>>(currentCookColors);
  const [saving, setSaving] = useState(false);

  // Nutrition tracking state
  const [nutritionEnabled, setNutritionEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<MacroGoalPreset | null>(null);
  const [macroGoals, setMacroGoals] = useState<MacroGoals>(MACRO_GOAL_PRESETS.maintenance);

  const progress = (step / 4) * 100;

  const addCook = () => {
    setCookNames([...cookNames, ""]);
  };

  const removeCook = (index: number) => {
    if (cookNames.length > 1) {
      setCookNames(cookNames.filter((_, i) => i !== index));
    }
  };

  const updateCook = (index: number, value: string) => {
    const oldName = cookNames[index];
    const newNames = [...cookNames];
    newNames[index] = value;
    setCookNames(newNames);

    // Transfer color from old name to new name
    if (oldName && oldName !== value && cookColors[oldName]) {
      const newColors = { ...cookColors };
      newColors[value] = newColors[oldName];
      delete newColors[oldName];
      setCookColors(newColors);
    }
  };

  const updateCookColor = (cookName: string, color: string) => {
    setCookColors({ ...cookColors, [cookName]: color });
  };

  const getCookColor = (cookName: string, index: number) => {
    return cookColors[cookName] || defaultColors[index % defaultColors.length];
  };

  // Apply a nutrition goal preset
  const applyPreset = (preset: Exclude<MacroGoalPreset, "custom">) => {
    setMacroGoals(MACRO_GOAL_PRESETS[preset]);
    setSelectedPreset(preset);
    setNutritionEnabled(true);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);

    try {
      // Save profile
      if (firstName.trim()) {
        const profileResult = await updateProfile(firstName.trim(), lastName.trim());
        if (profileResult.error) {
          console.error("Profile save error:", profileResult.error);
          toast.error(`Failed to save profile: ${profileResult.error}`);
          setSaving(false);
          return;
        }
      }

      // Save cook names, colors, and nutrition settings
      const filteredCookNames = cookNames.filter((n) => n.trim());

      // Build cook colors object with defaults for cooks without explicit colors
      const finalCookColors: Record<string, string> = {};
      filteredCookNames.forEach((name, index) => {
        finalCookColors[name] = cookColors[name] || defaultColors[index % defaultColors.length];
      });

      // Build settings object
      const settingsToSave: {
        cook_names?: string[];
        cook_colors?: Record<string, string>;
        macro_tracking_enabled?: boolean;
        macro_goals?: MacroGoals;
        macro_goal_preset?: MacroGoalPreset | null;
      } = {};

      if (filteredCookNames.length > 0) {
        settingsToSave.cook_names = filteredCookNames;
        settingsToSave.cook_colors = finalCookColors;
      }

      // Add nutrition settings if enabled
      if (nutritionEnabled && selectedPreset) {
        settingsToSave.macro_tracking_enabled = true;
        settingsToSave.macro_goals = macroGoals;
        settingsToSave.macro_goal_preset = selectedPreset;
      }

      // Save settings if there's anything to save
      if (Object.keys(settingsToSave).length > 0) {
        const settingsResult = await updateSettings(settingsToSave);
        if (settingsResult.error) {
          console.error("Settings save error:", settingsResult.error);
          toast.error(`Failed to save settings: ${settingsResult.error}`);
          setSaving(false);
          return;
        }
      }

      setSaving(false);
      onComplete();
      // Refresh the router to ensure saved data is reflected
      router.refresh();
      // Small delay to ensure revalidation completes before redirect
      setTimeout(() => {
        router.push("/app/recipes");
      }, 100);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("An unexpected error occurred");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono">Welcome! 👋</DialogTitle>
          <DialogDescription>
            Let&apos;s get you set up. This&apos;ll only take a minute.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">What&apos;s your name?</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll use this to personalize your experience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  maxLength={50}
                />
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!firstName.trim()}
              className="w-full"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Cook Names */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Who&apos;s cooking?</h3>
                <p className="text-sm text-muted-foreground">
                  Add everyone who helps with meals.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {cookNames.map((cook, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="relative overflow-hidden rounded-md shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-gray-300 dark:hover:ring-gray-700 transition-all h-10 w-12 flex-shrink-0">
                    <input
                      type="color"
                      value={getCookColor(cook, index)}
                      onChange={(e) => updateCookColor(cook || `cook-${index}`, e.target.value)}
                      className="h-full w-full cursor-pointer"
                      style={{
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                        width: '100%',
                        height: '100%',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                      title="Choose color"
                    />
                  </div>
                  <Input
                    value={cook}
                    onChange={(e) => updateCook(index, e.target.value)}
                    placeholder={index === 0 ? "Your name" : "Partner's name"}
                    maxLength={50}
                    className="flex-1"
                  />
                  {cookNames.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCook(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addCook}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Person
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Nutrition Goals (Optional) */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Track your nutrition?</h3>
                <p className="text-sm text-muted-foreground">
                  Optional: Set daily macro goals for meal planning.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Choose a goal
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedPreset === "weight_loss" ? "default" : "outline"}
                  onClick={() => applyPreset("weight_loss")}
                  className="h-auto flex-col items-start gap-1 px-3 py-2"
                >
                  <span className="font-semibold">Weight Loss</span>
                  <span className="text-xs opacity-80">1800 cal • 140g protein</span>
                </Button>
                <Button
                  variant={selectedPreset === "muscle_building" ? "default" : "outline"}
                  onClick={() => applyPreset("muscle_building")}
                  className="h-auto flex-col items-start gap-1 px-3 py-2"
                >
                  <span className="font-semibold">Muscle Building</span>
                  <span className="text-xs opacity-80">2500 cal • 180g protein</span>
                </Button>
                <Button
                  variant={selectedPreset === "maintenance" ? "default" : "outline"}
                  onClick={() => applyPreset("maintenance")}
                  className="h-auto flex-col items-start gap-1 px-3 py-2"
                >
                  <span className="font-semibold">Maintenance</span>
                  <span className="text-xs opacity-80">2000 cal • 150g protein</span>
                </Button>
                <Button
                  variant={selectedPreset === "custom" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPreset("custom");
                    setNutritionEnabled(true);
                  }}
                  className="h-auto flex-col items-start gap-1 px-3 py-2"
                >
                  <span className="font-semibold">Custom</span>
                  <span className="text-xs opacity-80">Set your own targets</span>
                </Button>
              </div>

              {/* Custom macro inputs - shown when custom is selected */}
              {selectedPreset === "custom" && (
                <div className="flex flex-col gap-3 pt-2 border-t">
                  <Label className="text-sm">Set your daily targets</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="onboard-calories" className="text-xs text-muted-foreground">Calories</Label>
                      <Input
                        id="onboard-calories"
                        type="number"
                        min="1000"
                        max="5000"
                        step="50"
                        value={macroGoals.calories}
                        onChange={(e) => setMacroGoals({ ...macroGoals, calories: parseInt(e.target.value) || 2000 })}
                        className="h-9"
                        placeholder="2000"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="onboard-protein" className="text-xs text-muted-foreground">Protein (g)</Label>
                      <Input
                        id="onboard-protein"
                        type="number"
                        min="50"
                        max="400"
                        step="5"
                        value={macroGoals.protein_g}
                        onChange={(e) => setMacroGoals({ ...macroGoals, protein_g: parseInt(e.target.value) || 150 })}
                        className="h-9"
                        placeholder="150"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="onboard-carbs" className="text-xs text-muted-foreground">Carbs (g)</Label>
                      <Input
                        id="onboard-carbs"
                        type="number"
                        min="50"
                        max="600"
                        step="10"
                        value={macroGoals.carbs_g}
                        onChange={(e) => setMacroGoals({ ...macroGoals, carbs_g: parseInt(e.target.value) || 200 })}
                        className="h-9"
                        placeholder="200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="onboard-fat" className="text-xs text-muted-foreground">Fat (g)</Label>
                      <Input
                        id="onboard-fat"
                        type="number"
                        min="20"
                        max="250"
                        step="5"
                        value={macroGoals.fat_g}
                        onChange={(e) => setMacroGoals({ ...macroGoals, fat_g: parseInt(e.target.value) || 65 })}
                        className="h-9"
                        placeholder="65"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skip option */}
              <Button
                variant={!nutritionEnabled ? "secondary" : "ghost"}
                onClick={() => {
                  setNutritionEnabled(false);
                  setSelectedPreset(null);
                }}
                className="w-full justify-start text-sm"
                size="sm"
              >
                Skip for now — set up later in settings
              </Button>

              <p className="text-xs text-muted-foreground">
                You can customize your goals anytime in Settings → Dietary.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">You&apos;re all set!</h3>
                <p className="text-sm text-muted-foreground">
                  Time to add your first recipe.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 flex flex-col gap-3">
              <h4 className="font-medium">Quick Tips:</h4>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Import recipes from any website with AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Drag recipes onto your weekly meal plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Auto-generate shopping lists from your plan</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Saving..." : "Add My First Recipe"}
                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

