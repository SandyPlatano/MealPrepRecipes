"use client";

import { useParams, notFound } from "next/navigation";
import { useDemo } from "@/lib/demo/demo-context";
import { CookingMode } from "@/components/recipes/cooking-mode";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";

export default function DemoCookModePage() {
  const params = useParams();
  const { recipes, settings } = useDemo();

  const recipeId = params.id as string;
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    notFound();
  }

  return (
    <CookingMode
      recipe={recipe}
      userUnitSystem={settings.unit_system || "imperial"}
      initialSettings={DEFAULT_COOK_MODE_SETTINGS}
      dismissedHints={[]}
      basePath="/demo"
    />
  );
}
