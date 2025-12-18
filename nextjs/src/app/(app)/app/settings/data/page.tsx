"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  getRecipeExportPreferences,
  updateRecipeExportPreferences,
} from "@/app/actions/settings";
import {
  getRecipesForExport,
  getExistingRecipeTitles,
} from "@/app/actions/export";
import { useSettings } from "@/contexts/settings-context";
import { BulkExportDialog } from "@/components/recipes/export/bulk-export-dialog";
import { BulkImportDialog } from "@/components/recipes/export/bulk-import-dialog";
import type { RecipeExportPreferences } from "@/types/settings";
import type { Recipe } from "@/types/recipe";

const DEFAULT_EXPORT_PREFS: RecipeExportPreferences = {
  include_ingredients: true,
  include_instructions: true,
  include_nutrition: true,
  include_tags: true,
  include_times: true,
  include_notes: true,
  include_servings: true,
};

export default function DataSettingsPage() {
  const router = useRouter();
  const { profile, preferencesV2, updatePrivacyPrefs } = useSettings();
  const [exportPrefs, setExportPrefs] = useState<RecipeExportPreferences>(DEFAULT_EXPORT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Export/Import dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [existingTitles, setExistingTitles] = useState<Set<string>>(new Set());
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);

  // Load initial preferences
  useEffect(() => {
    async function loadPrefs() {
      const result = await getRecipeExportPreferences();
      if (!result.error && result.data) {
        setExportPrefs(result.data);
      }
      setIsLoaded(true);
    }
    loadPrefs();
  }, []);

  // Handle export button click
  const handleExportClick = async () => {
    if (!profile.id) {
      toast.error("Please sign in to export recipes");
      return;
    }

    setIsLoadingExport(true);
    const result = await getRecipesForExport();
    setIsLoadingExport(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setRecipes(result.recipes || []);
    setShowExportDialog(true);
  };

  // Handle import button click
  const handleImportClick = async () => {
    if (!profile.id) {
      toast.error("Please sign in to import recipes");
      return;
    }

    setIsLoadingImport(true);
    const result = await getExistingRecipeTitles();
    setIsLoadingImport(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setExistingTitles(new Set(result.titles || []));
    setShowImportDialog(true);
  };

  // Handle import success
  const handleImportSuccess = () => {
    setShowImportDialog(false);
    router.refresh();
    toast.success("Recipes imported successfully!");
  };

  const updateExportPref = useCallback(async (key: keyof RecipeExportPreferences, value: boolean) => {
    // Optimistic update
    setExportPrefs(prev => ({ ...prev, [key]: value }));

    // Save to database
    const result = await updateRecipeExportPreferences({ [key]: value });
    if (result.error) {
      // Revert on error
      setExportPrefs(prev => ({ ...prev, [key]: !value }));
      toast.error(`Failed to save: ${result.error}`);
    }
  }, []);

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Data & Export"
        description="Import, export, and manage your recipe data"
      />

      {/* Privacy Settings */}
      <SettingSection
        title="Privacy"
        description="Control how your data is used. All options are off by default."
      >
        <SettingRow
          id="setting-analytics"
          label="Usage Analytics"
          description="Help improve the app by sharing anonymous usage patterns"
        >
          <Switch
            checked={preferencesV2?.privacy?.analyticsEnabled ?? false}
            onCheckedChange={(v) => updatePrivacyPrefs({ analyticsEnabled: v })}
          />
        </SettingRow>

        <SettingRow
          id="setting-crash-reporting"
          label="Crash Reporting"
          description="Send crash reports to help fix bugs faster"
        >
          <Switch
            checked={preferencesV2?.privacy?.crashReporting ?? false}
            onCheckedChange={(v) => updatePrivacyPrefs({ crashReporting: v })}
          />
        </SettingRow>

        <SettingRow
          id="setting-personalized-recommendations"
          label="Personalized Recommendations"
          description="Get AI-powered recipe suggestions based on your cooking history"
        >
          <Switch
            checked={preferencesV2?.privacy?.personalizedRecommendations ?? false}
            onCheckedChange={(v) => updatePrivacyPrefs({ personalizedRecommendations: v })}
          />
        </SettingRow>
      </SettingSection>

      {/* Import/Export */}
      <SettingSection title="Recipes">
        <SettingRow
          id="setting-bulk-export"
          label="Export All Recipes"
          description="Download all your recipes as a backup"
        >
          <Button variant="outline" onClick={handleExportClick} disabled={isLoadingExport}>
            {isLoadingExport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </SettingRow>

        <SettingRow
          id="setting-import-recipes"
          label="Import Recipes"
          description="Import from JSON or other apps"
        >
          <Button variant="outline" onClick={handleImportClick} disabled={isLoadingImport}>
            {isLoadingImport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
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
              checked={exportPrefs.include_ingredients}
              onCheckedChange={(v) => updateExportPref("include_ingredients", v)}
              disabled={!isLoaded}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-instructions"
            label="Include Instructions"
            description="Export cooking instructions"
          >
            <Switch
              checked={exportPrefs.include_instructions}
              onCheckedChange={(v) => updateExportPref("include_instructions", v)}
              disabled={!isLoaded}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-nutrition"
            label="Include Nutrition"
            description="Export nutritional information"
          >
            <Switch
              checked={exportPrefs.include_nutrition}
              onCheckedChange={(v) => updateExportPref("include_nutrition", v)}
              disabled={!isLoaded}
            />
          </SettingRow>

          <SettingRow
            id="setting-export-tags"
            label="Include Tags"
            description="Export recipe tags"
          >
            <Switch
              checked={exportPrefs.include_tags}
              onCheckedChange={(v) => updateExportPref("include_tags", v)}
              disabled={!isLoaded}
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

      {/* Export Dialog */}
      <BulkExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        recipes={recipes}
      />

      {/* Import Dialog - only render if profile.id is valid */}
      {profile.id && (
        <BulkImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          existingTitles={existingTitles}
          userId={profile.id}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
