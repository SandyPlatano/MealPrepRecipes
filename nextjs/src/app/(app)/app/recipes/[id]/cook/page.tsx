import { notFound } from "next/navigation";
import { getRecipe } from "@/app/actions/recipes";
import { getSettings, getCookModeSettings } from "@/app/actions/settings";
import { CookingMode } from "@/components/recipes/cooking-mode";

interface CookPageProps {
  params: Promise<{ id: string }>;
}

export default async function CookPage({ params }: CookPageProps) {
  const { id } = await params;
  const [recipeResult, settingsResult, cookModeSettingsResult] = await Promise.all([
    getRecipe(id),
    getSettings(),
    getCookModeSettings(),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  const recipe = recipeResult.data;
  const userUnitSystem = (settingsResult.data?.unit_system as "imperial" | "metric") || "imperial";
  const cookModeSettings = cookModeSettingsResult.data;
  const dismissedHints = settingsResult.data?.dismissed_hints || [];

  return (
    <CookingMode
      recipe={recipe}
      userUnitSystem={userUnitSystem}
      initialSettings={cookModeSettings}
      dismissedHints={dismissedHints}
    />
  );
}

