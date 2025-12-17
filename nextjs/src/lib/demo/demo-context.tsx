"use client";

/**
 * Demo Context Provider
 * Manages all demo state and provides mock actions for the interactive demo
 *
 * Key features:
 * - Initializes with sample data
 * - Persists changes to localStorage within session
 * - Provides mock server actions that update local state
 * - Tracks AI usage for rate limiting
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { Recipe, RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { MealAssignmentWithRecipe, DayOfWeek, MealType, WeekPlanData } from "@/types/meal-plan";
import type { UserSettings } from "@/types/settings";
import type { WeeklyMacroDashboard } from "@/types/nutrition";
import {
  DEMO_CONFIG,
  DEMO_RECIPES,
  DEMO_NUTRITION,
  DEMO_MEAL_ASSIGNMENTS,
  DEMO_SHOPPING_LIST,
  DEMO_SMART_FOLDERS,
  DEMO_SETTINGS,
  DEMO_USER,
  getDemoRecipesWithNutrition,
  getDemoWeekPlanData,
  getDemoWeeklyNutrition,
  type DemoShoppingItem,
  type DemoSmartFolder,
} from "./sample-data";

// =============================================================================
// TYPES
// =============================================================================

interface DemoAIUsage {
  recipeImports: number;
  lastRecipeImport: string | null;
  mealSuggestions: number;
  lastMealSuggestion: string | null;
}

interface DemoState {
  recipes: RecipeWithFavoriteAndNutrition[];
  mealAssignments: MealAssignmentWithRecipe[];
  shoppingList: DemoShoppingItem[];
  smartFolders: DemoSmartFolder[];
  settings: Partial<UserSettings>;
  favoriteIds: Set<string>;
  aiUsage: DemoAIUsage;
  isInitialized: boolean;
}

interface DemoActions {
  // Recipe actions
  toggleFavorite: (recipeId: string) => void;
  updateRecipeRating: (recipeId: string, rating: number) => void;
  addRecipe: (recipe: Recipe) => void;

  // Meal plan actions
  addToMealPlan: (recipeId: string, day: DayOfWeek, mealType: MealType, cook?: string) => void;
  removeFromMealPlan: (assignmentId: string) => void;
  updateAssignmentCook: (assignmentId: string, cook: string | null) => void;
  updateAssignmentServings: (assignmentId: string, servings: number) => void;

  // Shopping list actions
  toggleShoppingItem: (itemId: string) => void;
  addShoppingItem: (item: Omit<DemoShoppingItem, "id">) => void;
  resetShoppingList: () => void;

  // AI usage tracking
  recordAIUsage: (type: "recipeImport" | "mealSuggestion") => boolean;
  checkAILimit: (type: "recipeImport" | "mealSuggestion") => { allowed: boolean; remaining: number };

  // Utility
  resetDemo: () => void;
}

interface DemoContextValue extends DemoState, DemoActions {
  user: typeof DEMO_USER;
  weekPlanData: WeekPlanData;
  weeklyNutrition: WeeklyMacroDashboard;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "bwfd-demo-state";

const AI_LIMITS = {
  recipeImport: 2, // 2 per day
  mealSuggestion: 1, // 1 per day
};

const DEFAULT_AI_USAGE: DemoAIUsage = {
  recipeImports: 0,
  lastRecipeImport: null,
  mealSuggestions: 0,
  lastMealSuggestion: null,
};

// =============================================================================
// CONTEXT
// =============================================================================

const DemoContext = createContext<DemoContextValue | null>(null);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getInitialState(): DemoState {
  return {
    recipes: getDemoRecipesWithNutrition(),
    mealAssignments: [...DEMO_MEAL_ASSIGNMENTS],
    shoppingList: [...DEMO_SHOPPING_LIST],
    smartFolders: [...DEMO_SMART_FOLDERS],
    settings: { ...DEMO_SETTINGS },
    favoriteIds: new Set(DEMO_CONFIG.favoriteIds),
    aiUsage: { ...DEFAULT_AI_USAGE },
    isInitialized: false,
  };
}

function loadStateFromStorage(): Partial<DemoState> | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Convert favoriteIds back to Set
    if (parsed.favoriteIds) {
      parsed.favoriteIds = new Set(parsed.favoriteIds);
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load demo state from storage:", error);
    return null;
  }
}

function saveStateToStorage(state: DemoState): void {
  if (typeof window === "undefined") return;

  try {
    // Convert Set to array for JSON serialization
    const toStore = {
      ...state,
      favoriteIds: Array.from(state.favoriteIds),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error("Failed to save demo state to storage:", error);
  }
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(getInitialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = loadStateFromStorage();
    if (stored) {
      setState((prev) => ({
        ...prev,
        ...stored,
        isInitialized: true,
      }));
    } else {
      setState((prev) => ({ ...prev, isInitialized: true }));
    }
  }, []);

  // Save state to localStorage on changes (after initialization)
  useEffect(() => {
    if (state.isInitialized) {
      saveStateToStorage(state);
    }
  }, [state]);

  // =============================================================================
  // RECIPE ACTIONS
  // =============================================================================

  const toggleFavorite = useCallback((recipeId: string) => {
    setState((prev) => {
      const newFavorites = new Set(prev.favoriteIds);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }

      const newRecipes = prev.recipes.map((r) =>
        r.id === recipeId ? { ...r, is_favorite: newFavorites.has(recipeId) } : r
      );

      return { ...prev, favoriteIds: newFavorites, recipes: newRecipes };
    });
  }, []);

  const updateRecipeRating = useCallback((recipeId: string, rating: number) => {
    setState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) =>
        r.id === recipeId ? { ...r, rating } : r
      ),
    }));
  }, []);

  const addRecipe = useCallback((recipe: Recipe) => {
    setState((prev) => ({
      ...prev,
      recipes: [
        {
          ...recipe,
          id: generateId(),
          is_favorite: false,
          nutrition: null,
        },
        ...prev.recipes,
      ],
    }));
  }, []);

  // =============================================================================
  // MEAL PLAN ACTIONS
  // =============================================================================

  const addToMealPlan = useCallback((
    recipeId: string,
    day: DayOfWeek,
    mealType: MealType,
    cook?: string
  ) => {
    setState((prev) => {
      const recipe = prev.recipes.find((r) => r.id === recipeId);
      if (!recipe) return prev;

      const newAssignment: MealAssignmentWithRecipe = {
        id: generateId(),
        meal_plan_id: "demo-meal-plan-id",
        recipe_id: recipeId,
        day_of_week: day,
        cook: cook || null,
        meal_type: mealType,
        serving_size: 2,
        created_at: new Date().toISOString(),
        recipe: {
          id: recipe.id,
          title: recipe.title,
          recipe_type: recipe.recipe_type,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
        },
      };

      return {
        ...prev,
        mealAssignments: [...prev.mealAssignments, newAssignment],
      };
    });
  }, []);

  const removeFromMealPlan = useCallback((assignmentId: string) => {
    setState((prev) => ({
      ...prev,
      mealAssignments: prev.mealAssignments.filter((a) => a.id !== assignmentId),
    }));
  }, []);

  const updateAssignmentCook = useCallback((assignmentId: string, cook: string | null) => {
    setState((prev) => ({
      ...prev,
      mealAssignments: prev.mealAssignments.map((a) =>
        a.id === assignmentId ? { ...a, cook } : a
      ),
    }));
  }, []);

  const updateAssignmentServings = useCallback((assignmentId: string, servings: number) => {
    setState((prev) => ({
      ...prev,
      mealAssignments: prev.mealAssignments.map((a) =>
        a.id === assignmentId ? { ...a, serving_size: servings } : a
      ),
    }));
  }, []);

  // =============================================================================
  // SHOPPING LIST ACTIONS
  // =============================================================================

  const toggleShoppingItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
  }, []);

  const addShoppingItem = useCallback((item: Omit<DemoShoppingItem, "id">) => {
    setState((prev) => ({
      ...prev,
      shoppingList: [
        { ...item, id: generateId() },
        ...prev.shoppingList,
      ],
    }));
  }, []);

  const resetShoppingList = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shoppingList: DEMO_SHOPPING_LIST.map((item) => ({ ...item, checked: false })),
    }));
  }, []);

  // =============================================================================
  // AI USAGE TRACKING
  // =============================================================================

  const checkAILimit = useCallback((type: "recipeImport" | "mealSuggestion") => {
    const limit = AI_LIMITS[type];
    const usageKey = type === "recipeImport" ? "recipeImports" : "mealSuggestions";
    const lastKey = type === "recipeImport" ? "lastRecipeImport" : "lastMealSuggestion";

    const usage = state.aiUsage[usageKey];
    const lastUsage = state.aiUsage[lastKey];

    // Reset count if last usage was not today
    const effectiveUsage = isToday(lastUsage) ? usage : 0;
    const remaining = Math.max(0, limit - effectiveUsage);

    return {
      allowed: remaining > 0,
      remaining,
    };
  }, [state.aiUsage]);

  const recordAIUsage = useCallback((type: "recipeImport" | "mealSuggestion") => {
    const { allowed } = checkAILimit(type);
    if (!allowed) return false;

    const usageKey = type === "recipeImport" ? "recipeImports" : "mealSuggestions";
    const lastKey = type === "recipeImport" ? "lastRecipeImport" : "lastMealSuggestion";

    setState((prev) => {
      const lastUsage = prev.aiUsage[lastKey];
      const currentUsage = isToday(lastUsage) ? prev.aiUsage[usageKey] : 0;

      return {
        ...prev,
        aiUsage: {
          ...prev.aiUsage,
          [usageKey]: currentUsage + 1,
          [lastKey]: new Date().toISOString(),
        },
      };
    });

    return true;
  }, [checkAILimit]);

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(getInitialState());
    setState((prev) => ({ ...prev, isInitialized: true }));
  }, []);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const weekPlanData = useMemo((): WeekPlanData => {
    const assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    state.mealAssignments.forEach((assignment) => {
      assignments[assignment.day_of_week].push(assignment);
    });

    return {
      meal_plan: {
        id: "demo-meal-plan-id",
        household_id: "demo-household-id",
        week_start: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      assignments,
    };
  }, [state.mealAssignments]);

  const weeklyNutrition = useMemo(() => getDemoWeeklyNutrition(), []);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const value: DemoContextValue = {
    // State
    ...state,
    user: DEMO_USER,
    weekPlanData,
    weeklyNutrition,

    // Actions
    toggleFavorite,
    updateRecipeRating,
    addRecipe,
    addToMealPlan,
    removeFromMealPlan,
    updateAssignmentCook,
    updateAssignmentServings,
    toggleShoppingItem,
    addShoppingItem,
    resetShoppingList,
    recordAIUsage,
    checkAILimit,
    resetDemo,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

// =============================================================================
// UTILITY HOOK - Check if in demo mode
// =============================================================================

export function useDemoMode() {
  const context = useContext(DemoContext);
  return {
    isDemo: context !== null,
    demo: context,
  };
}
