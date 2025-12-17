/**
 * Macro Preset Type Definitions
 * Custom macro presets for quick nutrition logging
 */

// =====================================================
// CORE TYPES
// =====================================================

/**
 * Macro values for a preset (shared structure)
 */
export interface MacroValues {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

/**
 * Macro preset from database
 */
export interface MacroPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  is_system: boolean;
  is_pinned: boolean;
  is_hidden: boolean;
  sort_order: number;
  pin_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating/editing presets
 */
export interface MacroPresetFormData {
  name: string;
  emoji?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

/**
 * Quick add with customization (before adding to log)
 */
export interface CustomizedQuickAdd {
  presetId: string;
  presetName: string;
  values: MacroValues;
  note?: string;
}

/**
 * Result of preset operations
 */
export interface PresetActionResult {
  success: boolean;
  error: string | null;
  data?: MacroPreset | null;
}

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Available emojis for preset selection
 */
export const PRESET_EMOJIS = [
  // Food
  "🍪", "🥤", "☕", "🍎", "🥜", "🧀", "🥛", "🍌",
  "🥚", "🍞", "🥗", "🍗", "🥩", "🐟", "🥑", "🍇",
  "🥕", "🍫", "🧁", "🍩", "🥯", "🥣", "🍵", "🧃",
  // Supplements/Health
  "💊", "🧪", "⚡", "💪", "🏃", "🔥",
] as const;

/**
 * Default emojis for system presets
 */
export const DEFAULT_PRESET_EMOJIS: Record<string, string> = {
  "Snack": "🍪",
  "Protein Shake": "🥤",
  "Coffee": "☕",
};

/**
 * Helper to format macro summary for display
 * e.g., "150cal · 25g P"
 */
export function formatMacroSummary(preset: MacroPreset): string {
  const parts: string[] = [];

  if (preset.calories !== null) {
    parts.push(`${preset.calories}cal`);
  }
  if (preset.protein_g !== null) {
    parts.push(`${preset.protein_g}g P`);
  }
  if (preset.carbs_g !== null && parts.length < 2) {
    parts.push(`${preset.carbs_g}g C`);
  }
  if (preset.fat_g !== null && parts.length < 2) {
    parts.push(`${preset.fat_g}g F`);
  }

  return parts.join(" · ") || "No values";
}

/**
 * Helper to get display emoji (with fallback)
 */
export function getPresetEmoji(preset: MacroPreset): string {
  if (preset.emoji) return preset.emoji;
  return DEFAULT_PRESET_EMOJIS[preset.name] || "📝";
}

/**
 * Check if preset has any macro values
 */
export function hasAnyMacroValue(values: MacroValues): boolean {
  return (
    values.calories !== null ||
    values.protein_g !== null ||
    values.carbs_g !== null ||
    values.fat_g !== null
  );
}

/**
 * Extract macro values from a preset
 */
export function extractMacroValues(preset: MacroPreset): MacroValues {
  return {
    calories: preset.calories,
    protein_g: preset.protein_g,
    carbs_g: preset.carbs_g,
    fat_g: preset.fat_g,
  };
}
