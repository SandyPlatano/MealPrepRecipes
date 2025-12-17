"use client";

import { useCallback, useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MacroGoalsSection } from "@/components/settings/macro-goals-section";
import { CustomBadgesSection } from "@/components/settings/custom-badges-section";
import { SubstitutionsSection } from "@/components/settings/substitutions-section";
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/types/settings";
import type { MacroGoals, MacroGoalPreset } from "@/types/nutrition";
import {
  getDefaultSubstitutions,
  getUserSubstitutions,
  type UserSubstitution,
  type Substitution,
} from "@/lib/substitutions";

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
  const { settings, updateSettingsField, updateSettingsBatch } = useSettings();

  // Substitutions state
  const [userSubstitutions, setUserSubstitutions] = useState<UserSubstitution[]>([]);
  const [defaultSubstitutions, setDefaultSubstitutions] = useState<Substitution[]>([]);
  const [substitutionsLoaded, setSubstitutionsLoaded] = useState(false);

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
    <div className="space-y-8">
      <SettingsHeader
        title="Dietary & Nutrition"
        description="Manage allergens, dietary restrictions, and nutrition tracking"
      />

      {/* Allergens */}
      <SettingSection title="Allergen Alerts">
        <SettingRow
          id="setting-allergen-alerts"
          label="Track Allergens"
          description="Get warnings when recipes contain these allergens"
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
          label="Dietary Restrictions"
          description="Custom restrictions to track"
        >
          <div className="text-sm text-muted-foreground">
            {settings.custom_dietary_restrictions?.length ? (
              <div className="flex flex-wrap gap-1">
                {settings.custom_dietary_restrictions.map((r) => (
                  <Badge key={r} variant="secondary">
                    {r}
                  </Badge>
                ))}
              </div>
            ) : (
              "No custom restrictions"
            )}
          </div>
        </SettingRow>
      </SettingSection>

      {/* Nutrition Tracking */}
      <div id="setting-macro-tracking">
        <div id="setting-macro-goals">
          <div id="setting-macro-preset">
            <MacroGoalsSection
              initialGoals={settings.macro_goals || undefined}
              initialEnabled={settings.macro_tracking_enabled ?? false}
              initialPreset={settings.macro_goal_preset || undefined}
              onSave={handleMacroSave}
            />
          </div>
        </div>
      </div>

      {/* Units */}
      <SettingSection title="Measurements">
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
      </SettingSection>

      {/* Custom Nutrition Badges */}
      <div id="setting-custom-badges">
        <CustomBadgesSection />
      </div>

      {/* Ingredient Substitutions */}
      <div id="setting-substitutions">
        {substitutionsLoaded ? (
          <SubstitutionsSection
            initialUserSubstitutions={userSubstitutions}
            defaultSubstitutions={defaultSubstitutions}
          />
        ) : (
          <SettingSection title="Ingredient Substitutions">
            <div className="text-sm text-muted-foreground py-4">Loading substitutions...</div>
          </SettingSection>
        )}
      </div>
    </div>
  );
}
