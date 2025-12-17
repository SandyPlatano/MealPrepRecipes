"use client";

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
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/types/settings";

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
  const { settings, updateSettingsField } = useSettings();

  const toggleAllergen = (allergen: string) => {
    const current = settings.allergen_alerts || [];
    const updated = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    updateSettingsField("allergen_alerts", updated);
  };

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
      <SettingSection title="Nutrition Tracking">
        <SettingRow
          id="setting-macro-tracking"
          label="Macro Tracking"
          description="Enable macronutrient tracking"
        >
          <Switch
            id="setting-macro-tracking-control"
            checked={settings.macro_tracking_enabled ?? false}
            onCheckedChange={(checked) =>
              updateSettingsField("macro_tracking_enabled", checked)
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-macro-goals"
          label="Macro Goals"
          description="Daily targets for protein, carbs, and fats"
        >
          <div className="text-sm text-muted-foreground">
            {settings.macro_goals ? (
              <div className="flex gap-3">
                <span>P: {settings.macro_goals.protein_g}g</span>
                <span>C: {settings.macro_goals.carbs_g}g</span>
                <span>F: {settings.macro_goals.fat_g}g</span>
              </div>
            ) : (
              "Not set"
            )}
          </div>
        </SettingRow>
      </SettingSection>

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

      {/* Advanced */}
      <AdvancedToggle>
        <SettingSection title="Advanced Dietary Settings">
          <SettingRow
            id="setting-custom-badges"
            label="Custom Nutrition Badges"
            description="Create custom nutrition indicator badges"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-substitutions"
            label="Ingredient Substitutions"
            description="Automatic ingredient swaps"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
