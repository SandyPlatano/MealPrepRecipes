"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, BarChart3, Bug, Sparkles, Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  getRecipeExportPreferences,
  updateRecipeExportPreferences,
} from "@/app/actions/settings";
import {
  getRecipesForExport,
  getExistingRecipeTitles,
} from "@/app/actions/export";
import { getCustomFieldDefinitions } from "@/app/actions/custom-fields";
import { getCustomIngredientCategories } from "@/app/actions/custom-ingredient-categories";
import { useSettings } from "@/contexts/settings-context";
import { BulkExportDialog } from "@/components/recipes/export/bulk-export-dialog";
import { BulkImportDialog } from "@/components/recipes/export/bulk-import-dialog";
import { CustomFieldsSection } from "@/components/settings/custom-fields-section";
import { CustomIngredientCategoriesSection } from "@/components/settings/custom-ingredient-categories-section";
import { CategoryOrderSection } from "@/components/settings/category-order-section";
import type { RecipeExportPreferences } from "@/types/settings";
import type { Recipe } from "@/types/recipe";
import type { CustomFieldDefinition } from "@/types/custom-fields";
import type { CustomIngredientCategory } from "@/types/custom-ingredient-category";

const DEFAULT_EXPORT_PREFS: RecipeExportPreferences = {
  include_ingredients: true,
  include_instructions: true,
  include_nutrition: true,
  include_tags: true,
  include_times: true,
  include_notes: true,
  include_servings: true,
};

// Privacy transparency data
interface PrivacyInfo {
  collected: string[];
  notCollected: string[];
  purpose: string;
}

const PRIVACY_INFO: Record<string, PrivacyInfo> = {
  analytics: {
    collected: [
      "Which features you use and how often",
      "Session duration and page views",
      "General app performance metrics",
    ],
    notCollected: [
      "Your recipes or personal content",
      "Your email or identity",
    ],
    purpose: "Helps us understand what's working and what needs improvement",
  },
  crashReporting: {
    collected: [
      "Error messages and stack traces",
      "Browser type and version (e.g., Chrome 120)",
      "Device type (e.g., Desktop, macOS)",
      "App version",
      "Session replay (all text is masked, media is blocked)",
    ],
    notCollected: [
      "Your recipes or personal data",
      "Any URL query parameters (filtered out)",
    ],
    purpose: "Helps us fix bugs faster by seeing what went wrong",
  },
  recommendations: {
    collected: [
      "Your recipe history (what you've cooked)",
      "Your meal planning patterns",
      "Your dietary preferences",
    ],
    notCollected: [
      "Data is processed by Anthropic's Claude AI",
      "Not stored externally or sold",
    ],
    purpose: "Suggests recipes you'll actually want to cook",
  },
};

interface PrivacySettingRowProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  infoKey: keyof typeof PRIVACY_INFO;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

function PrivacySettingRow({
  id,
  label,
  description,
  icon,
  infoKey,
  checked,
  onCheckedChange,
}: PrivacySettingRowProps) {
  const info = PRIVACY_INFO[infoKey];

  return (
    <div className="py-4 transition-all duration-300 rounded-lg px-2 -mx-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
          <div className="space-y-0.5">
            <label htmlFor={`${id}-control`} className="text-sm font-medium">
              {label}
            </label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-9 sm:ml-0">
          <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
      </div>

      <Accordion type="single" collapsible className="ml-9 mt-2">
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="py-1.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline">
            What data is collected?
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="space-y-3 text-xs">
              {/* What IS collected */}
              <div className="space-y-1.5">
                <p className="font-medium text-muted-foreground">We collect:</p>
                <ul className="space-y-1">
                  {info.collected.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What is NOT collected */}
              <div className="space-y-1.5">
                <p className="font-medium text-muted-foreground">We don&apos;t collect:</p>
                <ul className="space-y-1">
                  {info.notCollected.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purpose */}
              <p className="text-muted-foreground italic">
                Purpose: {info.purpose}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function DataSettingsPage() {
  const router = useRouter();
  const { profile, preferencesV2, updatePrivacyPrefs, household } = useSettings();
  const [exportPrefs, setExportPrefs] = useState<RecipeExportPreferences>(DEFAULT_EXPORT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Export/Import dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [existingTitles, setExistingTitles] = useState<Set<string>>(new Set());
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);

  // Custom data state
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [ingredientCategories, setIngredientCategories] = useState<CustomIngredientCategory[]>([]);
  const [isLoadingCustomData, setIsLoadingCustomData] = useState(true);

  // Get household ID
  const householdId = household?.household?.id;

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

  // Load custom fields and ingredient categories
  useEffect(() => {
    async function loadCustomData() {
      if (!householdId) {
        setIsLoadingCustomData(false);
        return;
      }

      setIsLoadingCustomData(true);

      const [fieldsResult, categoriesResult] = await Promise.all([
        getCustomFieldDefinitions(householdId),
        getCustomIngredientCategories(householdId),
      ]);

      if (fieldsResult.data) {
        setCustomFields(fieldsResult.data);
      }

      if (categoriesResult.data) {
        setIngredientCategories(categoriesResult.data);
      }

      setIsLoadingCustomData(false);
    }

    loadCustomData();
  }, [householdId]);

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
        description="Control how your data is used. All options are off by default. Tap 'What data is collected?' to learn more."
      >
        <PrivacySettingRow
          id="setting-analytics"
          label="Usage Analytics"
          description="Help improve the app by sharing anonymous usage patterns"
          icon={<BarChart3 className="h-4 w-4" />}
          infoKey="analytics"
          checked={preferencesV2?.privacy?.analyticsEnabled ?? false}
          onCheckedChange={(v) => updatePrivacyPrefs({ analyticsEnabled: v })}
        />

        <PrivacySettingRow
          id="setting-crash-reporting"
          label="Crash Reporting"
          description="Send crash reports to help fix bugs faster"
          icon={<Bug className="h-4 w-4" />}
          infoKey="crashReporting"
          checked={preferencesV2?.privacy?.crashReporting ?? false}
          onCheckedChange={(v) => updatePrivacyPrefs({ crashReporting: v })}
        />

        <PrivacySettingRow
          id="setting-personalized-recommendations"
          label="Personalized Recommendations"
          description="Get AI-powered recipe suggestions based on your cooking history"
          icon={<Sparkles className="h-4 w-4" />}
          infoKey="recommendations"
          checked={preferencesV2?.privacy?.personalizedRecommendations ?? false}
          onCheckedChange={(v) => updatePrivacyPrefs({ personalizedRecommendations: v })}
        />
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

        {/* Custom Fields Section */}
        {isLoadingCustomData ? (
          <SettingSection title="Custom Recipe Fields">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </SettingSection>
        ) : householdId ? (
          <CustomFieldsSection
            householdId={householdId}
            initialFields={customFields}
          />
        ) : (
          <SettingSection title="Custom Recipe Fields">
            <p className="text-sm text-muted-foreground py-4">
              Please join or create a household to use custom fields.
            </p>
          </SettingSection>
        )}

        {/* Ingredient Categories Section */}
        {isLoadingCustomData ? (
          <SettingSection title="Ingredient Categories">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </SettingSection>
        ) : householdId ? (
          <SettingSection title="">
            <CustomIngredientCategoriesSection
              householdId={householdId}
              initialCategories={ingredientCategories}
            />
          </SettingSection>
        ) : (
          <SettingSection title="Ingredient Categories">
            <p className="text-sm text-muted-foreground py-4">
              Please join or create a household to manage ingredient categories.
            </p>
          </SettingSection>
        )}

        {/* Category Order Section */}
        {isLoadingCustomData ? (
          <SettingSection title="Shopping Route">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </SettingSection>
        ) : ingredientCategories.length > 0 ? (
          <SettingSection title="">
            <CategoryOrderSection categories={ingredientCategories} />
          </SettingSection>
        ) : (
          <SettingSection title="Shopping Route">
            <p className="text-sm text-muted-foreground py-4">
              Add ingredient categories above to customize your shopping route.
            </p>
          </SettingSection>
        )}

        <SettingSection title="API Usage">
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
