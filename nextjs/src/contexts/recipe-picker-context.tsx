"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ActiveTab = "all" | "favorites" | "recent" | "suggestions";

interface RecipePickerState {
  searchQuery: string;
  activeTab: ActiveTab;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  clearSearch: () => void;
}

const RecipePickerContext = createContext<RecipePickerState | null>(null);

interface RecipePickerProviderProps {
  children: ReactNode;
}

export function RecipePickerProvider({ children }: RecipePickerProviderProps) {
  const [searchQuery, setSearchQueryState] = useState("");
  const [activeTab, setActiveTabState] = useState<ActiveTab>("all");

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
  }, []);

  return (
    <RecipePickerContext.Provider
      value={{
        searchQuery,
        activeTab,
        setSearchQuery,
        setActiveTab,
        clearSearch,
      }}
    >
      {children}
    </RecipePickerContext.Provider>
  );
}

export function useRecipePickerState() {
  const context = useContext(RecipePickerContext);
  if (!context) {
    throw new Error("useRecipePickerState must be used within a RecipePickerProvider");
  }
  return context;
}
