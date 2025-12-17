// ============================================================================
// Energy Mode / Spoons Theory Types
// For neurodivergent-friendly meal planning based on daily energy levels
// ============================================================================

/**
 * Energy level using "spoons" metaphor (1-5 scale)
 * Based on Spoon Theory for chronic illness/disability
 */
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * User's energy mode preferences (stored in preferences_v2)
 */
export interface EnergyModePreferences {
  /** Whether energy mode is enabled */
  enabled: boolean;
  /** Default energy level for new days */
  defaultEnergyLevel: EnergyLevel;
  /** Visual display preference */
  displayMode: "spoons" | "simple";
  /** Whether to show the daily check-in prompt */
  showDailyPrompt: boolean;
}

/**
 * Daily energy check-in (stored in localStorage)
 */
export interface DailyEnergyCheckIn {
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Current energy level */
  energyLevel: EnergyLevel;
  /** When the check-in was recorded */
  timestamp: string;
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_ENERGY_MODE_PREFERENCES: EnergyModePreferences = {
  enabled: false,
  defaultEnergyLevel: 3,
  displayMode: "spoons",
  showDailyPrompt: true,
};

// ============================================================================
// Energy Level Configuration
// ============================================================================

/**
 * Human-readable labels for each energy level
 */
export const ENERGY_LEVEL_LABELS: Record<EnergyLevel, string> = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "Good",
  5: "Great",
};

/**
 * Descriptions for each energy level
 */
export const ENERGY_LEVEL_DESCRIPTIONS: Record<EnergyLevel, string> = {
  1: "Only very simple recipes today",
  2: "Keeping it simple",
  3: "Standard recipes work",
  4: "Feeling capable",
  5: "Ready for anything",
};

/**
 * Maximum recipe complexity score for each energy level
 * Used to filter recipes in the planner
 */
export const ENERGY_TO_MAX_COMPLEXITY: Record<EnergyLevel, number> = {
  1: 1.5, // Only very simple recipes (microwave, toast, assemble)
  2: 2.5, // Simple recipes (5 ingredients, minimal prep)
  3: 3.5, // Standard recipes
  4: 4.5, // Most recipes
  5: 5.0, // All recipes including complex ones
};

/**
 * Visual display configuration
 */
export const SPOON_DISPLAY = {
  filled: "🥄",
  empty: "⚪",
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an energy level is considered "low" (needs easy recipes)
 */
export function isLowEnergy(level: EnergyLevel): boolean {
  return level <= 2;
}

/**
 * Get the maximum recipe complexity for a given energy level
 */
export function getMaxComplexity(level: EnergyLevel): number {
  return ENERGY_TO_MAX_COMPLEXITY[level];
}

/**
 * Get the localStorage key for today's check-in
 */
export function getEnergyCheckInKey(date?: Date): string {
  const d = date || new Date();
  const dateStr = d.toISOString().split("T")[0];
  return `energy-checkin-${dateStr}`;
}

/**
 * Generate spoon display string (e.g., "🥄🥄🥄⚪⚪" for level 3)
 */
export function getSpoonsDisplay(level: EnergyLevel): string {
  const filled = SPOON_DISPLAY.filled.repeat(level);
  const empty = SPOON_DISPLAY.empty.repeat(5 - level);
  return filled + empty;
}
