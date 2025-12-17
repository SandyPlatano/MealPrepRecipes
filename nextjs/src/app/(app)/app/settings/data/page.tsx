"use client";

import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export default function DataSettingsPage() {
  const { settings, updateSettingsField } = useSettings();
  const exportPrefs = settings.recipe_export_preferences;

  const updateExportPref = (key: string, value: boolean) => {
    const currentPrefs = exportPrefs || {
      include_ingredients: true,
      include_instructions: true,
      include_nutrition: true,
      include_tags: true,
      include_times: true,
      include_notes: true,
      include_servings: true,
    };
    updateSettingsField("recipe_export_preferences", {
      ...currentPrefs,
      [key]: value,
    });
  };

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Data & Export"
        description="Import, export, and manage your recipe data"
      />

      {/* Import/Export */}
      <SettingSection title="Recipes">
        <SettingRow
          id="setting-bulk-export"
          label="Export All Recipes"
          description="Download all your recipes as a backup"
        >
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </SettingRow>

        <SettingRow
          id="setting-import-recipes"
          label="Import Recipes"
          description="Import from JSON or other apps"
        >
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </SettingRow>
      </SettingSection>

      {/* Advanced */}
      <AdvancedToggle>
        <SettingSection title="Export Preferences">
          <p className="text-sm text-muted-foreground pb-2">
            Choose what to include when exporting recipes
          </p>

          <SettingRow
            id="setting-export-preferences"
            label="Include Ingredients"
            description="Export ingredient lists"
          >
            <Switch
              checked={exportPrefs?.include_ingredients ?? true}
              onCheckedChange={(v) => updateExportPref("include_ingredients", v)}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-instructions"
            label="Include Instructions"
            description="Export cooking instructions"
          >
            <Switch
              checked={exportPrefs?.include_instructions ?? true}
              onCheckedChange={(v) => updateExportPref("include_instructions", v)}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-nutrition"
            label="Include Nutrition"
            description="Export nutritional information"
          >
            <Switch
              checked={exportPrefs?.include_nutrition ?? true}
              onCheckedChange={(v) => updateExportPref("include_nutrition", v)}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-tags"
            label="Include Tags"
            description="Export recipe tags"
          >
            <Switch
              checked={exportPrefs?.include_tags ?? true}
              onCheckedChange={(v) => updateExportPref("include_tags", v)}
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Custom Data">
          <SettingRow
            id="setting-custom-fields"
            label="Custom Fields"
            description="Add custom metadata to recipes"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-ingredient-categories"
            label="Ingredient Categories"
            description="Organize shopping lists by category"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-category-order"
            label="Category Order"
            description="Reorder shopping list categories"
          >
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </SettingRow>

          <SettingRow
            id="setting-api-costs"
            label="API Usage"
            description="View API costs (admin only)"
          >
            <div className="text-sm text-muted-foreground">Admin only</div>
          </SettingRow>
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
