"use client";

import { LayoutGrid } from "lucide-react";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingSection } from "@/components/settings/shared/setting-row";
import { RecipeSectionsManager } from "@/components/settings/recipe-layout/recipe-sections-manager";
import { useSettings } from "@/contexts/settings-context";

export default function RecipeLayoutSettingsPage() {
  const { preferencesV2, updateRecipeLayoutPrefs } = useSettings();

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Recipe Layout"
        description="Customize how recipe pages display ingredients, instructions, and other sections"
      />

      {/* Section 1: Section Order & Visibility */}
      <SettingSection
        title="Sections"
        description="Drag to reorder sections. Toggle visibility and width for each section."
      >
        <div className="pt-2">
          <RecipeSectionsManager
            layoutPrefs={preferencesV2.recipeLayout}
            onUpdate={updateRecipeLayoutPrefs}
          />
        </div>
      </SettingSection>

      {/* Layout Legend */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <LayoutGrid className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Layout Guide</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Half width</strong> (square icon): Sections render side-by-side when consecutive</li>
              <li>• <strong>Full width</strong> (rectangle icon): Section spans the entire width</li>
              <li>• Drag sections to change display order on recipe pages</li>
              <li>• Hidden sections won&apos;t appear even if the recipe has that data</li>
              <li>• Changes apply to all recipes globally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
