"use client";

import { useState } from "react";
import { RecipeGrid } from "./recipe-grid";
import { DiscoverDialog } from "./discover-dialog";
import type { RecipeWithFavoriteAndNutrition, RecipeWithFavorite } from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";

interface RecipesPageClientProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[];
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
}

export function RecipesPageClient({
  recipes,
  recipeCookCounts,
  recentlyCookedIds,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  customBadges = [],
}: RecipesPageClientProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Cast for discover dialog which doesn't need nutrition data
  const recipesForDiscover = recipes as RecipeWithFavorite[];

  return (
    <>
      <RecipeGrid
        recipes={recipes}
        recipeCookCounts={recipeCookCounts}
        userAllergenAlerts={userAllergenAlerts}
        customDietaryRestrictions={customDietaryRestrictions}
        customBadges={customBadges}
        onDiscoverClick={() => setDiscoverOpen(true)}
      />

      <DiscoverDialog
        open={discoverOpen}
        onOpenChange={setDiscoverOpen}
        recipes={recipesForDiscover}
        recipeCookCounts={recipeCookCounts}
        recentlyCookedIds={recentlyCookedIds}
      />
    </>
  );
}

