"use client";

/**
 * Macro Goals Settings Section
 * Component for settings page to configure daily macro goals
 * Includes toggle, preset buttons, and manual input
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { MacroGoals, MacroGoalPreset } from "@/types/nutrition";
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";
import { toast } from "sonner";

interface MacroGoalsSectionProps {
  initialGoals?: MacroGoals | null;
  initialEnabled?: boolean;
  initialPreset?: MacroGoalPreset | null;
  onSave?: (goals: MacroGoals, enabled: boolean, preset: MacroGoalPreset) => Promise<void>;
  className?: string;
}

export function MacroGoalsSection({
  initialGoals,
  initialEnabled = false,
  initialPreset = null,
  onSave,
  className,
}: MacroGoalsSectionProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [selectedPreset, setSelectedPreset] = useState<MacroGoalPreset | null>(
    initialPreset || (initialGoals ? "custom" : null)
  );
  const [goals, setGoals] = useState<MacroGoals>(
    initialGoals || {
      calories: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 65,
      fiber_g: 25,
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  // Apply preset when selected
  const applyPreset = (preset: Exclude<MacroGoalPreset, "custom">) => {
    setGoals(MACRO_GOAL_PRESETS[preset]);
    setSelectedPreset(preset);
  };

  // Handle manual input changes
  const handleGoalChange = (key: keyof MacroGoals, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    setGoals((prev) => ({ ...prev, [key]: numValue }));
    setSelectedPreset("custom"); // Mark as custom when manually edited
  };

  // Auto-save on changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (onSave && enabled) {
        try {
          setIsSaving(true);
          await onSave(goals, enabled, selectedPreset || "custom");
        } catch (error) {
          toast.error("Failed to save macro goals");
          console.error(error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [goals, enabled, selectedPreset, onSave]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Nutrition Tracking
            </CardTitle>
            <CardDescription>
              Set daily macro goals and track your nutrition progress
            </CardDescription>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          {/* Goal Presets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              <PresetButton
                label="Weight Loss"
                preset="weight_loss"
                selected={selectedPreset === "weight_loss"}
                onClick={() => applyPreset("weight_loss")}
                description="1800 cal • 140g protein"
              />
              <PresetButton
                label="Muscle Building"
                preset="muscle_building"
                selected={selectedPreset === "muscle_building"}
                onClick={() => applyPreset("muscle_building")}
                description="2500 cal • 180g protein"
              />
              <PresetButton
                label="Maintenance"
                preset="maintenance"
                selected={selectedPreset === "maintenance"}
                onClick={() => applyPreset("maintenance")}
                description="2000 cal • 150g protein"
              />
              <PresetButton
                label="Custom"
                preset="custom"
                selected={selectedPreset === "custom"}
                onClick={() => setSelectedPreset("custom")}
                description="Set your own"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a preset or set custom goals below
            </p>
          </div>

          {/* Manual Goal Inputs */}
          <div className="space-y-4">
            <Label>Daily Targets</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-sm">
                  Calories
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="calories"
                    type="number"
                    min="500"
                    max="5000"
                    step="50"
                    value={goals.calories}
                    onChange={(e) => handleGoalChange("calories", e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-sm text-muted-foreground">kcal</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm">
                  Protein
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="protein"
                    type="number"
                    min="50"
                    max="500"
                    step="5"
                    value={goals.protein_g}
                    onChange={(e) => handleGoalChange("protein_g", e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm">
                  Carbohydrates
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="carbs"
                    type="number"
                    min="50"
                    max="1000"
                    step="10"
                    value={goals.carbs_g}
                    onChange={(e) => handleGoalChange("carbs_g", e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat" className="text-sm">
                  Fat
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fat"
                    type="number"
                    min="20"
                    max="500"
                    step="5"
                    value={goals.fat_g}
                    onChange={(e) => handleGoalChange("fat_g", e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiber" className="text-sm">
                  Fiber (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fiber"
                    type="number"
                    min="10"
                    max="100"
                    step="1"
                    value={goals.fiber_g || ""}
                    onChange={(e) => handleGoalChange("fiber_g", e.target.value)}
                    className="font-mono"
                    placeholder="25"
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Macro Distribution */}
          <MacroDistributionSummary goals={goals} />

          {/* Auto-save indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Saving...
            </div>
          )}
        </CardContent>
      )}

      {!enabled && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable nutrition tracking to set macro goals and monitor your daily intake.
          </p>
        </CardContent>
      )}

      {enabled && (
        <CardContent className="pt-0 border-t mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/nutrition">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Nutrition Dashboard
            </Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Preset button component
 */
interface PresetButtonProps {
  label: string;
  preset: MacroGoalPreset;
  selected: boolean;
  onClick: () => void;
  description: string;
}

function PresetButton({ label, selected, onClick, description }: PresetButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      className="h-auto flex-col items-start gap-1 px-3 py-2"
    >
      <span className="font-semibold">{label}</span>
      <span className="text-xs opacity-80">{description}</span>
    </Button>
  );
}

/**
 * Show calculated macro distribution
 */
function MacroDistributionSummary({ goals }: { goals: MacroGoals }) {
  const proteinCal = goals.protein_g * 4;
  const carbsCal = goals.carbs_g * 4;
  const fatCal = goals.fat_g * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  const proteinPct = Math.round((proteinCal / totalMacroCal) * 100);
  const carbsPct = Math.round((carbsCal / totalMacroCal) * 100);
  const fatPct = Math.round((fatCal / totalMacroCal) * 100);

  // Check if balanced (typical ranges)
  const isBalanced =
    proteinPct >= 20 &&
    proteinPct <= 35 &&
    carbsPct >= 45 &&
    carbsPct <= 65 &&
    fatPct >= 20 &&
    fatPct <= 35;

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Macro Distribution</Label>
        {isBalanced && (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Balanced
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">{proteinPct}%</div>
          <div className="text-xs text-muted-foreground">Protein</div>
        </div>
        <div>
          <div className="font-semibold text-amber-600 dark:text-amber-400">{carbsPct}%</div>
          <div className="text-xs text-muted-foreground">Carbs</div>
        </div>
        <div>
          <div className="font-semibold text-purple-600 dark:text-purple-400">{fatPct}%</div>
          <div className="text-xs text-muted-foreground">Fat</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Balanced diet: 20-35% protein, 45-65% carbs, 20-35% fat
      </p>
    </div>
  );
}
