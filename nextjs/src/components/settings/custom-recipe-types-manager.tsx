"use client";

import { useSettings } from "@/contexts/settings-context";
import { CustomRecipeTypesSection } from "./custom-recipe-types-section";

/**
 * Wrapper component that provides householdId from settings context
 * to the CustomRecipeTypesSection component
 */
export function CustomRecipeTypesManager() {
  const { household } = useSettings();
  const householdId = household?.household?.id;

  if (!householdId) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading household...
      </div>
    );
  }

  return <CustomRecipeTypesSection householdId={householdId} />;
}
