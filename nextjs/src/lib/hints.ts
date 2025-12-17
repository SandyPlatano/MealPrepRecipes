// Contextual hint system constants and types

export const HINT_IDS = {
  MEAL_PLANNER_INTRO: "meal-planner-intro",
  RECIPES_INTRO: "recipes-intro",
  SHOPPING_LIST_INTRO: "shopping-list-intro",
  PANTRY_INTRO: "pantry-intro",
  COOK_MODE_WIZARD: "cook-mode-wizard",
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
};

// Helper to check if a hint is dismissed
export function isHintDismissed(
  hintId: HintId,
  dismissedHints: string[] | undefined
): boolean {
  return dismissedHints?.includes(hintId) ?? false;
}
