"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";

interface CookingModeProps {
  recipe: Recipe;
}

export function CookingMode({ recipe }: CookingModeProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(recipe.ingredients.length).fill(false)
  );
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);

  // Keep screen awake (best effort with wake lock API)
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        // Wake lock not supported or failed
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!timerRunning || (timerMinutes === 0 && timerSeconds === 0)) {
      if (timerMinutes === 0 && timerSeconds === 0 && timerTotal > 0) {
        // Timer finished
        toast.success("Timer finished!", { duration: 5000 });
        setTimerRunning(false);
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
  }, [timerRunning, timerMinutes, timerSeconds, timerTotal]);

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const startTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerTotal(minutes * 60);
    setTimerRunning(true);
    toast.success(`Timer started for ${minutes} minutes`);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerTotal(0);
  };

  const allIngredientsChecked = checkedIngredients.every((checked) => checked);
  const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <Badge variant="outline">
            Cooking Mode
          </Badge>
        </div>
        <h1 className="text-3xl font-mono font-bold">{recipe.title}</h1>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep + 1} of {recipe.instructions.length}
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Current Instruction */}
          <Card className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  STEP {currentStep + 1}
                </span>
                {currentStep === recipe.instructions.length - 1 && (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    Final Step
                  </Badge>
                )}
              </div>
              <p className="text-2xl leading-relaxed">
                {recipe.instructions[currentStep]}
              </p>

              {/* Quick Timer Buttons */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                <span className="text-sm text-muted-foreground mr-2">Quick timers:</span>
                {[5, 10, 15, 20, 30].map((mins) => (
                  <Button
                    key={mins}
                    variant="outline"
                    size="sm"
                    onClick={() => startTimer(mins)}
                  >
                    {mins} min
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            <Button
              size="lg"
              onClick={handleNextStep}
              disabled={currentStep === recipe.instructions.length - 1}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {currentStep === recipe.instructions.length - 1 && (
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                toast.success("Great job! Enjoy your meal!");
                router.push(`/app/recipes/${recipe.id}`);
              }}
            >
              <Check className="h-5 w-5 mr-2" />
              Done Cooking!
            </Button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
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

          {/* Ingredients Checklist */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Ingredients</span>
                {allIngredientsChecked && (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    All set!
                  </Badge>
                )}
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={checkedIngredients[index]}
                      onCheckedChange={() => toggleIngredient(index)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className={`text-sm leading-relaxed cursor-pointer flex-1 ${
                        checkedIngredients[index]
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

