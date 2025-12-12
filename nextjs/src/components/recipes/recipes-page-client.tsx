"use client";

import { useState } from "react";
import { RecipeGrid } from "./recipe-grid";
import { DiscoverDialog } from "./discover-dialog";
import type { RecipeWithFavorite } from "@/types/recipe";

interface RecipesPageClientProps {
  recipes: RecipeWithFavorite[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[];
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
}

export function RecipesPageClient({
  recipes,
  recipeCookCounts,
  recentlyCookedIds,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
}: RecipesPageClientProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);

  return (
    <>
      <RecipeGrid
        recipes={recipes}
        recipeCookCounts={recipeCookCounts}
        userAllergenAlerts={userAllergenAlerts}
        customDietaryRestrictions={customDietaryRestrictions}
        onDiscoverClick={() => setDiscoverOpen(true)}
      />

      <DiscoverDialog
        open={discoverOpen}
        onOpenChange={setDiscoverOpen}
        recipes={recipes}
        recipeCookCounts={recipeCookCounts}
        recentlyCookedIds={recentlyCookedIds}
      />
    </>
  );
}

