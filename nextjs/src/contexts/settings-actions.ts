/**
 * Settings Context Actions
 *
 * All mutation functions extracted from settings-context.tsx
 * These handle optimistic updates and scheduling saves
 */

import type { MutableRefObject } from "react";
import { toast } from "sonner";
import {
  updateSettings,
  updatePlannerViewSettings,
  updateCalendarPreferences,
  addCustomDietaryRestriction,
  removeCustomDietaryRestriction,
} from "@/app/actions/settings";
import {
  updateDisplayPreferencesAuto as updateDisplayPreferences,
  updateSoundPreferencesAuto as updateSoundPreferences,
  updateKeyboardPreferencesAuto as updateKeyboardPreferences,
  updateAiPersonalityAuto as updateAiPersonality,
  updateServingSizePresetsAuto as updateServingSizePresets,
  updatePrivacyPreferencesAuto as updatePrivacyPreferences,
  updateRecipeLayoutPreferencesAuto as updateRecipeLayoutPreferences,
} from "@/app/actions/user-preferences";
import type { UserSettings, PlannerViewSettings, CalendarPreferences } from "@/types/settings";
import type {
  UserPreferencesV2,
  DisplayPreferences,
  SoundPreferences,
  KeyboardPreferences,
  ServingSizePreset,
  AiPersonalityType,
  PrivacyPreferences,
  RecipeLayoutPreferences,
} from "@/types/user-preferences-v2";
import type { SaveStatus } from "./settings-context";

// ============================================================================
// Types for Pending Changes
// ============================================================================

export interface PendingChanges {
  settings?: Partial<UserSettings>;
  displayPrefs?: Partial<DisplayPreferences>;
  soundPrefs?: Partial<SoundPreferences>;
  keyboardPrefs?: Partial<KeyboardPreferences>;
  aiPersonality?: { personality: AiPersonalityType; customPrompt?: string | null };
  servingPresets?: ServingSizePreset[];
  privacyPrefs?: Partial<PrivacyPreferences>;
  plannerSettings?: Partial<PlannerViewSettings>;
  recipeLayoutPrefs?: RecipeLayoutPreferences;
  calendarPrefs?: Partial<CalendarPreferences>;
}

// ============================================================================
// Save Execution
// ============================================================================

/**
 * Execute all pending changes and save to server
 */
export async function executeSave(
  pendingChangesRef: MutableRefObject<PendingChanges>,
  setSaveStatus: (status: SaveStatus) => void,
  setLastSavedAt: (date: Date) => void
): Promise<void> {
  const changes = { ...pendingChangesRef.current };
  pendingChangesRef.current = {};

  if (Object.keys(changes).length === 0) return;

  setSaveStatus("saving");

  try {
    const savePromises: Promise<{ error: string | null }>[] = [];

    // Settings
    if (changes.settings && Object.keys(changes.settings).length > 0) {
      savePromises.push(updateSettings(changes.settings));
    }

    // Display preferences
    if (changes.displayPrefs && Object.keys(changes.displayPrefs).length > 0) {
      savePromises.push(updateDisplayPreferences(changes.displayPrefs));
    }

    // Sound preferences
    if (changes.soundPrefs && Object.keys(changes.soundPrefs).length > 0) {
      savePromises.push(updateSoundPreferences(changes.soundPrefs));
    }

    // Keyboard preferences
    if (changes.keyboardPrefs && Object.keys(changes.keyboardPrefs).length > 0) {
      savePromises.push(updateKeyboardPreferences(changes.keyboardPrefs));
    }

    // AI personality
    if (changes.aiPersonality) {
      savePromises.push(
        updateAiPersonality(
          changes.aiPersonality.personality,
          changes.aiPersonality.customPrompt ?? null
        )
      );
    }

    // Serving presets
    if (changes.servingPresets) {
      savePromises.push(updateServingSizePresets(changes.servingPresets));
    }

    // Privacy preferences
    if (changes.privacyPrefs && Object.keys(changes.privacyPrefs).length > 0) {
      savePromises.push(updatePrivacyPreferences(changes.privacyPrefs));
    }

    // Planner view settings
    if (changes.plannerSettings && Object.keys(changes.plannerSettings).length > 0) {
      savePromises.push(updatePlannerViewSettings(changes.plannerSettings));
    }

    // Calendar preferences
    if (changes.calendarPrefs && Object.keys(changes.calendarPrefs).length > 0) {
      savePromises.push(updateCalendarPreferences(changes.calendarPrefs));
    }

    // Recipe layout preferences
    if (changes.recipeLayoutPrefs) {
      savePromises.push(updateRecipeLayoutPreferences(changes.recipeLayoutPrefs));
    }

    const results = await Promise.all(savePromises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      setSaveStatus("error");
      const errors = results.filter((r) => r.error).map((r) => r.error);
      toast.error(`Failed to save: ${errors.join(", ")}`);

      // Reset to error after brief display
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());

      // Reset to idle after showing "saved"
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  } catch (error) {
    console.error("Settings save error:", error);
    setSaveStatus("error");
    toast.error("Failed to save settings");

    setTimeout(() => setSaveStatus("idle"), 3000);
  }
}

// ============================================================================
// Dietary Restrictions Actions
// ============================================================================

export interface DietaryRestrictionActions {
  addDietaryRestriction: (restriction: string) => Promise<void>;
  removeDietaryRestriction: (restriction: string) => Promise<void>;
}

/**
 * Create dietary restriction action handlers
 */
export function createDietaryRestrictionActions<TState extends { settings: UserSettings }>(
  setState: React.Dispatch<React.SetStateAction<TState>>
): DietaryRestrictionActions {
  const addDietaryRestriction = async (restriction: string) => {
    const result = await addCustomDietaryRestriction(restriction);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Optimistic update
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        custom_dietary_restrictions: [
          ...(prev.settings.custom_dietary_restrictions || []),
          restriction,
        ],
      },
    }));

    toast.success("Dietary restriction added");
  };

  const removeDietaryRestriction = async (restriction: string) => {
    const result = await removeCustomDietaryRestriction(restriction);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Optimistic update
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        custom_dietary_restrictions: (
          prev.settings.custom_dietary_restrictions || []
        ).filter((r) => r !== restriction),
      },
    }));

    toast.success("Dietary restriction removed");
  };

  return {
    addDietaryRestriction,
    removeDietaryRestriction,
  };
}
