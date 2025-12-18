// ============================================================================
// Recipe Layout Customization Types
// ============================================================================

/**
 * Recipe section identifiers - matches sections in recipe-detail.tsx
 */
export type RecipeSectionId =
  | "ingredients"
  | "instructions"
  | "nutrition"
  | "notes"
  | "cooking-history"
  | "reviews";

/**
 * Width options for sections in grid layout
 */
export type RecipeSectionWidth = "full" | "half";

/**
 * Configuration for a single recipe section
 */
export interface RecipeSectionConfig {
  /** Section identifier */
  id: RecipeSectionId;

  /** Whether section is visible */
  visible: boolean;

  /** Width in grid layout (full-width or half-width) */
  width: RecipeSectionWidth;

  /** Display order (lower = higher position) */
  sortOrder: number;
}

/**
 * Full recipe layout preferences
 */
export interface RecipeLayoutPreferences {
  /** Individual section configurations */
  sections: Record<RecipeSectionId, RecipeSectionConfig>;

  /** Section order as array of IDs (for rendering) */
  sectionOrder: RecipeSectionId[];

  /** Schema version for future migrations */
  schemaVersion: number;
}

// ============================================================================
// Constants & Defaults
// ============================================================================

export const RECIPE_SECTION_LABELS: Record<RecipeSectionId, string> = {
  ingredients: "Ingredients",
  instructions: "Instructions",
  nutrition: "Nutrition Facts",
  notes: "Notes",
  "cooking-history": "Cooking History",
  reviews: "Community Reviews",
};

export const RECIPE_SECTION_DESCRIPTIONS: Record<RecipeSectionId, string> = {
  ingredients: "List of ingredients with scaling options",
  instructions: "Step-by-step cooking instructions",
  nutrition: "Nutritional information per serving",
  notes: "Personal notes and tips",
  "cooking-history": "Your past cooking sessions",
  reviews: "Community reviews and ratings",
};

export const DEFAULT_RECIPE_SECTION_ORDER: RecipeSectionId[] = [
  "ingredients",
  "instructions",
  "nutrition",
  "notes",
  "cooking-history",
  "reviews",
];

export const DEFAULT_RECIPE_SECTIONS: Record<RecipeSectionId, RecipeSectionConfig> = {
  ingredients: {
    id: "ingredients",
    visible: true,
    width: "half",
    sortOrder: 0,
  },
  instructions: {
    id: "instructions",
    visible: true,
    width: "half",
    sortOrder: 1,
  },
  nutrition: {
    id: "nutrition",
    visible: true,
    width: "full",
    sortOrder: 2,
  },
  notes: {
    id: "notes",
    visible: true,
    width: "full",
    sortOrder: 3,
  },
  "cooking-history": {
    id: "cooking-history",
    visible: true,
    width: "full",
    sortOrder: 4,
  },
  reviews: {
    id: "reviews",
    visible: true,
    width: "full",
    sortOrder: 5,
  },
};

export const CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION = 1;

export const DEFAULT_RECIPE_LAYOUT_PREFERENCES: RecipeLayoutPreferences = {
  sections: { ...DEFAULT_RECIPE_SECTIONS },
  sectionOrder: [...DEFAULT_RECIPE_SECTION_ORDER],
  schemaVersion: CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ordered sections based on preferences
 */
export function getOrderedSections(
  prefs: RecipeLayoutPreferences
): RecipeSectionConfig[] {
  return prefs.sectionOrder.map((id) => prefs.sections[id]);
}

/**
 * Get visible sections in order
 */
export function getVisibleSections(
  prefs: RecipeLayoutPreferences
): RecipeSectionConfig[] {
  return getOrderedSections(prefs).filter((section) => section.visible);
}

/**
 * Update section order after drag-and-drop
 */
export function reorderSections(
  prefs: RecipeLayoutPreferences,
  oldIndex: number,
  newIndex: number
): RecipeLayoutPreferences {
  const newOrder = [...prefs.sectionOrder];
  const [removed] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, removed);

  // Update sortOrder for all sections
  const newSections = { ...prefs.sections };
  newOrder.forEach((id, index) => {
    newSections[id] = { ...newSections[id], sortOrder: index };
  });

  return {
    ...prefs,
    sectionOrder: newOrder,
    sections: newSections,
  };
}

/**
 * Toggle section visibility
 */
export function toggleSectionVisibility(
  prefs: RecipeLayoutPreferences,
  sectionId: RecipeSectionId
): RecipeLayoutPreferences {
  return {
    ...prefs,
    sections: {
      ...prefs.sections,
      [sectionId]: {
        ...prefs.sections[sectionId],
        visible: !prefs.sections[sectionId].visible,
      },
    },
  };
}

/**
 * Update section width
 */
export function updateSectionWidth(
  prefs: RecipeLayoutPreferences,
  sectionId: RecipeSectionId,
  width: RecipeSectionWidth
): RecipeLayoutPreferences {
  return {
    ...prefs,
    sections: {
      ...prefs.sections,
      [sectionId]: {
        ...prefs.sections[sectionId],
        width,
      },
    },
  };
}

/**
 * Reset to default layout (returns deep copy to prevent mutations)
 */
export function resetToDefaultLayout(): RecipeLayoutPreferences {
  return {
    sections: Object.fromEntries(
      Object.entries(DEFAULT_RECIPE_SECTIONS).map(([key, value]) => [
        key,
        { ...value },
      ])
    ) as Record<RecipeSectionId, RecipeSectionConfig>,
    sectionOrder: [...DEFAULT_RECIPE_SECTION_ORDER],
    schemaVersion: CURRENT_RECIPE_LAYOUT_SCHEMA_VERSION,
  };
}
