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
import { ChefHat, Plus, Users, ArrowRight, Check } from "lucide-react";
import { updateProfile, updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
  currentName?: string;
  currentCookNames?: string[];
}

export function OnboardingDialog({
  open,
  onComplete,
  currentName = "",
  currentCookNames = [],
}: OnboardingDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(currentName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentName.split(" ")[1] || "");
  const [cookNames, setCookNames] = useState<string[]>(currentCookNames.length > 0 ? currentCookNames : ["Me", ""]);
  const [saving, setSaving] = useState(false);

  const progress = (step / 3) * 100;

  const addCook = () => {
    setCookNames([...cookNames, ""]);
  };

  const removeCook = (index: number) => {
    if (cookNames.length > 1) {
      setCookNames(cookNames.filter((_, i) => i !== index));
    }
  };

  const updateCook = (index: number, value: string) => {
    const newNames = [...cookNames];
    newNames[index] = value;
    setCookNames(newNames);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);

    // Save profile
    if (firstName.trim()) {
      const profileResult = await updateProfile(firstName.trim(), lastName.trim());
      if (profileResult.error) {
        toast.error("Failed to save profile");
        setSaving(false);
        return;
      }
    }

    // Save cook names
    const filteredCookNames = cookNames.filter((n) => n.trim());
    if (filteredCookNames.length > 0) {
      const settingsResult = await updateSettings({
        dark_mode: false,
        cook_names: filteredCookNames,
        email_notifications: true,
      });
      if (settingsResult.error) {
        toast.error("Failed to save settings");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onComplete();
    router.push("/app/recipes/new");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono">Welcome! 👋</DialogTitle>
          <DialogDescription>
            Let's get you set up. This'll only take a minute.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">What's your name?</h3>
                <p className="text-sm text-muted-foreground">
                  We'll use this to personalize your experience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
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
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Who's cooking?</h3>
                <p className="text-sm text-muted-foreground">
                  Add everyone who helps with meals.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {cookNames.map((cook, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cook}
                    onChange={(e) => updateCook(index, e.target.value)}
                    placeholder={index === 0 ? "Your name" : "Partner's name"}
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

        {/* Step 3: Ready */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">You're all set!</h3>
                <p className="text-sm text-muted-foreground">
                  Time to add your first recipe.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h4 className="font-medium">Quick Tips:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
                onClick={() => setStep(2)}
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

