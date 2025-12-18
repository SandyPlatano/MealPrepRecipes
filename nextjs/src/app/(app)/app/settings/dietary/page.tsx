"use client";

import { useCallback, useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow } from "@/components/settings/shared/setting-row";
import { SettingsCard } from "@/components/settings/shared/settings-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MacroGoalsSection } from "@/components/settings/macro-goals-section";
import { CustomBadgesSection } from "@/components/settings/custom-badges-section";
import { SubstitutionsSection } from "@/components/settings/substitutions-section";
import { AlertTriangle, Ruler, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/types/settings";
import type { MacroGoals, MacroGoalPreset } from "@/types/nutrition";
import {
  getDefaultSubstitutions,
  getUserSubstitutions,
  type UserSubstitution,
  type Substitution,
} from "@/app/actions/substitutions";

const ALLERGENS = [
  "Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soy",
  "Sesame",
];

export default function DietarySettingsPage() {
  const { settings, updateSettingsField, updateSettingsBatch, addDietaryRestriction, removeDietaryRestriction } = useSettings();

  // Substitutions state
  const [userSubstitutions, setUserSubstitutions] = useState<UserSubstitution[]>([]);
  const [defaultSubstitutions, setDefaultSubstitutions] = useState<Substitution[]>([]);
  const [substitutionsLoaded, setSubstitutionsLoaded] = useState(false);

  // Custom dietary restrictions input state
  const [newRestriction, setNewRestriction] = useState("");

  // Load substitutions data
  useEffect(() => {
    async function loadSubstitutions() {
      const [defaults, userSubs] = await Promise.all([
        getDefaultSubstitutions(),
        getUserSubstitutions(),
      ]);
      setDefaultSubstitutions(defaults);
      setUserSubstitutions(userSubs);
      setSubstitutionsLoaded(true);
    }
    loadSubstitutions();
  }, []);

  const toggleAllergen = (allergen: string) => {
    const current = settings.allergen_alerts || [];
    const updated = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    updateSettingsField("allergen_alerts", updated);
  };

  const handleMacroSave = useCallback(
    async (goals: MacroGoals, enabled: boolean, preset: MacroGoalPreset) => {
      updateSettingsBatch({
        macro_goals: goals,
        macro_tracking_enabled: enabled,
        macro_goal_preset: preset,
      });
    },
    [updateSettingsBatch]
  );

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Dietary & Nutrition"
        description="Manage allergens, dietary restrictions, and nutrition tracking"
      />

      {/* Allergens */}
      <SettingsCard
        id="section-allergens"
        icon={AlertTriangle}
        title="Allergen Alerts"
        description="Get warnings when recipes contain allergens"
      >
        <SettingRow
          id="setting-allergen-alerts"
          label="Track Allergens"
          description="Select allergens you want to be warned about"
        >
          <div className="flex flex-wrap gap-2 max-w-sm">
            {ALLERGENS.map((allergen) => {
              const isActive = settings.allergen_alerts?.includes(allergen);
              return (
                <Badge
                  key={allergen}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    isActive
                      ? "bg-destructive hover:bg-destructive/80"
                      : "hover:bg-accent"
                  )}
                  onClick={() => toggleAllergen(allergen)}
                >
                  {allergen}
                </Badge>
              );
            })}
          </div>
        </SettingRow>

        <SettingRow
          id="setting-dietary-restrictions"
          label="Custom Restrictions"
          description="Additional dietary restrictions you track"
        >
          <div className="space-y-2 max-w-md">
            <div className="flex gap-2">
              <Input
                placeholder="Add restriction (e.g., 'Low-Carb')"
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newRestriction.trim()) {
                    await addDietaryRestriction(newRestriction.trim());
                    setNewRestriction("");
                  }
                }}
              />
              <Button
                onClick={async () => {
                  await addDietaryRestriction(newRestriction.trim());
                  setNewRestriction("");
                }}
                disabled={!newRestriction.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {settings.custom_dietary_restrictions?.length ? (
              <div className="flex flex-wrap gap-2">
                {settings.custom_dietary_restrictions.map((r) => (
                  <Badge
                    key={r}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeDietaryRestriction(r)}
                  >
                    {r}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No custom restrictions</p>
            )}
          </div>
        </SettingRow>
      </SettingsCard>

      {/* Nutrition Tracking */}
      <MacroGoalsSection
        id="section-nutrition"
        initialGoals={settings.macro_goals || undefined}
        initialEnabled={settings.macro_tracking_enabled ?? false}
        initialPreset={settings.macro_goal_preset || undefined}
        onSave={handleMacroSave}
      />

      {/* Measurements */}
      <SettingsCard
        id="section-measurements"
        icon={Ruler}
        title="Measurements"
        description="Configure measurement units for recipes"
      >
        <SettingRow
          id="setting-unit-system"
          label="Unit System"
          description="Imperial (cups, oz) or Metric (ml, g)"
        >
          <Select
            value={settings.unit_system || "imperial"}
            onValueChange={(value: UnitSystem) =>
              updateSettingsField("unit_system", value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">Imperial</SelectItem>
              <SelectItem value="metric">Metric</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      {/* Custom Nutrition Badges */}
      <CustomBadgesSection id="section-badges" />

      {/* Ingredient Substitutions */}
      {substitutionsLoaded ? (
        <SubstitutionsSection
          id="section-substitutions"
          initialUserSubstitutions={userSubstitutions}
          defaultSubstitutions={defaultSubstitutions}
        />
      ) : (
        <SettingsCard
          id="section-substitutions"
          icon={Ruler}
          title="Ingredient Substitutions"
          description="Loading substitutions..."
        >
          <div className="text-sm text-muted-foreground py-4">Loading...</div>
        </SettingsCard>
      )}
    </div>
  );
}
