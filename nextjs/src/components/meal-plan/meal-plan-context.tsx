"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CompactRecipe } from "./compact-recipe-card";

interface MealPlanContextValue {
  // Selection state
  selectedRecipe: CompactRecipe | null;
  setSelectedRecipe: (recipe: CompactRecipe | null) => void;
  
  // Placement mode
  isPlacementMode: boolean;
  
  // Last action for undo
  lastAction: {
    type: "add" | "remove";
    recipeId: string;
    recipeTitle: string;
    day: string;
    assignmentId?: string;
  } | null;
  setLastAction: (action: MealPlanContextValue["lastAction"]) => void;
  clearLastAction: () => void;
}

const MealPlanContext = createContext<MealPlanContextValue | null>(null);

export function MealPlanProvider({ children }: { children: ReactNode }) {
  const [selectedRecipe, setSelectedRecipeState] = useState<CompactRecipe | null>(null);
  const [lastAction, setLastAction] = useState<MealPlanContextValue["lastAction"]>(null);

  const setSelectedRecipe = useCallback((recipe: CompactRecipe | null) => {
    setSelectedRecipeState(recipe);
  }, []);

  const clearLastAction = useCallback(() => {
    setLastAction(null);
  }, []);

  // Handle Escape key to cancel selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedRecipe) {
        setSelectedRecipeState(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRecipe]);

  // Clear selection after a timeout if no action taken (30 seconds)
  useEffect(() => {
    if (selectedRecipe) {
      const timeout = setTimeout(() => {
        setSelectedRecipeState(null);
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [selectedRecipe]);

  const value: MealPlanContextValue = {
    selectedRecipe,
    setSelectedRecipe,
    isPlacementMode: selectedRecipe !== null,
    lastAction,
    setLastAction,
    clearLastAction,
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlanContext() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error("useMealPlanContext must be used within a MealPlanProvider");
  }
  return context;
}

