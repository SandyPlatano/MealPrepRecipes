// Contextual hint system constants and types

export const HINT_IDS = {
  MEAL_PLANNER_INTRO: "meal-planner-intro",
  RECIPES_INTRO: "recipes-intro",
  SHOPPING_LIST_INTRO: "shopping-list-intro",
  PANTRY_INTRO: "pantry-intro",
  COOK_MODE_WIZARD: "cook-mode-wizard",
  FIRST_RECIPE_SUCCESS: "first-recipe-success",
} as const;

export type HintId = (typeof HINT_IDS)[keyof typeof HINT_IDS];

export interface HintContent {
  title: string;
  description: string;
}

export const HINT_CONTENT: Record<HintId, HintContent> = {
  [HINT_IDS.MEAL_PLANNER_INTRO]: {
    title: "Plan Your Week",
    description:
      "Click 'Add Meal' to select recipes for each day. Assign cooks to balance responsibilities.",
  },
  [HINT_IDS.RECIPES_INTRO]: {
    title: "Find Recipes Fast",
    description:
      "Use filters to search by tag, ingredient, or cook time. Star favorites for quick access.",
  },
  [HINT_IDS.SHOPPING_LIST_INTRO]: {
    title: "Smart Shopping",
    description:
      "Your list auto-generates from planned meals. Pantry items are excluded automatically.",
  },
  [HINT_IDS.PANTRY_INTRO]: {
    title: "Scan Your Pantry",
    description:
      "Use AI to scan photos of your fridge or pantry. Items update your inventory automatically.",
  },
  [HINT_IDS.COOK_MODE_WIZARD]: {
    title: "Set Up Cook Mode",
    description:
      "Customize your cooking experience with font sizes, themes, and helpful features.",
  },
  [HINT_IDS.FIRST_RECIPE_SUCCESS]: {
    title: "Great First Recipe!",
    description:
      "Add it to your meal plan, rate it after cooking, and use Cmd+K to search anytime.",
  },
};

// Helper to check if a hint is dismissed (server-side check)
export function isHintDismissed(
  hintId: HintId,
  dismissedHints: string[] | undefined
): boolean {
  return dismissedHints?.includes(hintId) ?? false;
}

// localStorage-based hint persistence (client-side)
const STORAGE_KEY = "dismissed_hints";

function getDismissedHintsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function dismissHintLocally(hintId: HintId): void {
  if (typeof window === "undefined") return;
  const dismissed = getDismissedHintsFromStorage();
  if (!dismissed.includes(hintId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, hintId]));
  }
}

export function isHintDismissedLocally(hintId: HintId): boolean {
  if (typeof window === "undefined") return false;
  return getDismissedHintsFromStorage().includes(hintId);
}
