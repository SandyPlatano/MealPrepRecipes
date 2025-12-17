"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type EnergyLevel,
  type EnergyModePreferences,
  type DailyEnergyCheckIn,
  DEFAULT_ENERGY_MODE_PREFERENCES,
  getEnergyCheckInKey,
  getMaxComplexity,
  isLowEnergy,
  ENERGY_LEVEL_LABELS,
  ENERGY_LEVEL_DESCRIPTIONS,
} from "@/types/energy-mode";

// ============================================================================
// Types
// ============================================================================

interface EnergyModeContextValue {
  // Current state
  todayEnergy: EnergyLevel;
  maxComplexity: number;
  isLowEnergyDay: boolean;

  // Labels for UI
  energyLabel: string;
  energyDescription: string;

  // Preferences (from parent settings context)
  preferences: EnergyModePreferences;

  // Actions
  setTodayEnergy: (level: EnergyLevel) => void;
  clearTodayEnergy: () => void;

  // State checks
  hasCheckedInToday: boolean;
  isEnabled: boolean;
}

// ============================================================================
// Context
// ============================================================================

const EnergyModeContext = createContext<EnergyModeContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface EnergyModeProviderProps {
  children: ReactNode;
  preferences?: EnergyModePreferences;
}

export function EnergyModeProvider({
  children,
  preferences = DEFAULT_ENERGY_MODE_PREFERENCES,
}: EnergyModeProviderProps) {
  const [todayEnergy, setTodayEnergyState] = useState<EnergyLevel>(
    preferences.defaultEnergyLevel
  );
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Load today's check-in from localStorage on mount
  useEffect(() => {
    const key = getEnergyCheckInKey();
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const checkIn: DailyEnergyCheckIn = JSON.parse(stored);
        setTodayEnergyState(checkIn.energyLevel);
        setHasCheckedInToday(true);
      } catch {
        // Invalid data, use default
        setTodayEnergyState(preferences.defaultEnergyLevel);
        setHasCheckedInToday(false);
      }
    } else {
      // No check-in today, use default
      setTodayEnergyState(preferences.defaultEnergyLevel);
      setHasCheckedInToday(false);
    }
  }, [preferences.defaultEnergyLevel]);

  // Set today's energy level
  const setTodayEnergy = useCallback((level: EnergyLevel) => {
    const key = getEnergyCheckInKey();
    const checkIn: DailyEnergyCheckIn = {
      date: new Date().toISOString().split("T")[0],
      energyLevel: level,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(checkIn));
    setTodayEnergyState(level);
    setHasCheckedInToday(true);
  }, []);

  // Clear today's check-in
  const clearTodayEnergy = useCallback(() => {
    const key = getEnergyCheckInKey();
    localStorage.removeItem(key);
    setTodayEnergyState(preferences.defaultEnergyLevel);
    setHasCheckedInToday(false);
  }, [preferences.defaultEnergyLevel]);

  // Computed values
  const maxComplexity = getMaxComplexity(todayEnergy);
  const isLowEnergyDay = isLowEnergy(todayEnergy);
  const energyLabel = ENERGY_LEVEL_LABELS[todayEnergy];
  const energyDescription = ENERGY_LEVEL_DESCRIPTIONS[todayEnergy];
  const isEnabled = preferences.enabled;

  const value: EnergyModeContextValue = {
    todayEnergy,
    maxComplexity,
    isLowEnergyDay,
    energyLabel,
    energyDescription,
    preferences,
    setTodayEnergy,
    clearTodayEnergy,
    hasCheckedInToday,
    isEnabled,
  };

  return (
    <EnergyModeContext.Provider value={value}>
      {children}
    </EnergyModeContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useEnergyMode(): EnergyModeContextValue {
  const context = useContext(EnergyModeContext);

  if (!context) {
    throw new Error("useEnergyMode must be used within an EnergyModeProvider");
  }

  return context;
}

// ============================================================================
// Optional Hook (returns null if not in provider)
// ============================================================================

export function useEnergyModeOptional(): EnergyModeContextValue | null {
  return useContext(EnergyModeContext);
}
