"use client";

/**
 * Difficulty Thresholds Context
 *
 * Provides user's custom difficulty thresholds throughout the app.
 * Used by recipe cards to calculate difficulty based on user preferences.
 * Fetches thresholds once on mount and caches them for all consumers.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { DifficultyThresholds } from "@/types/settings";
import { DEFAULT_DIFFICULTY_THRESHOLDS } from "@/types/settings";
import { getDifficultyThresholds } from "@/app/actions/settings";

interface DifficultyThresholdsContextValue {
  thresholds: DifficultyThresholds;
  isLoading: boolean;
  /** Refresh thresholds from server (call after settings change) */
  refresh: () => Promise<void>;
}

const DifficultyThresholdsContext = createContext<DifficultyThresholdsContextValue | null>(null);

export function DifficultyThresholdsProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholds] = useState<DifficultyThresholds>(DEFAULT_DIFFICULTY_THRESHOLDS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchThresholds = useCallback(async () => {
    setIsLoading(true);
    const result = await getDifficultyThresholds();
    if (result.data) {
      setThresholds(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  const refresh = useCallback(async () => {
    await fetchThresholds();
  }, [fetchThresholds]);

  return (
    <DifficultyThresholdsContext.Provider value={{ thresholds, isLoading, refresh }}>
      {children}
    </DifficultyThresholdsContext.Provider>
  );
}

export function useDifficultyThresholds(): DifficultyThresholdsContextValue {
  const context = useContext(DifficultyThresholdsContext);
  if (!context) {
    // If used outside provider, return defaults (graceful fallback)
    return {
      thresholds: DEFAULT_DIFFICULTY_THRESHOLDS,
      isLoading: false,
      refresh: async () => {},
    };
  }
  return context;
}
