"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { updateSettings, updatePlannerViewSettings } from "@/app/actions/settings";
import {
  updateDisplayPreferencesAuto as updateDisplayPreferences,
  updateSoundPreferencesAuto as updateSoundPreferences,
  updateKeyboardPreferencesAuto as updateKeyboardPreferences,
  updateAiPersonalityAuto as updateAiPersonality,
  updateServingSizePresetsAuto as updateServingSizePresets,
  updateEnergyModePreferencesAuto as updateEnergyModePreferences,
} from "@/app/actions/user-preferences";
import type { UserSettings, UserProfile, MealTypeCustomization, PlannerViewSettings } from "@/types/settings";
import type {
  UserPreferencesV2,
  DisplayPreferences,
  SoundPreferences,
  KeyboardPreferences,
  ServingSizePreset,
  AiPersonalityType,
  EnergyModePreferences,
} from "@/types/user-preferences-v2";
import { DEFAULT_USER_PREFERENCES_V2 } from "@/types/user-preferences-v2";

// ============================================================================
// Types
// ============================================================================

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface HouseholdData {
  household: {
    id: string;
    name: string;
    created_at: string;
    permission_mode?: string;
    household_settings?: Record<string, unknown>;
  } | null;
  role: string;
  members: Array<{
    user_id: string;
    role: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    } | null;
  }>;
}

export interface SettingsState {
  profile: UserProfile;
  settings: UserSettings;
  preferencesV2: UserPreferencesV2;
  household: HouseholdData | null;
  mealTypeSettings: MealTypeCustomization | null;
  plannerViewSettings: PlannerViewSettings | null;
}

export interface SettingsContextValue extends SettingsState {
  // Save status
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;

  // Core settings updates (auto-save)
  updateSettingsField: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => void;
  updateSettingsBatch: (partial: Partial<UserSettings>) => void;

  // Display preferences (auto-save)
  updateDisplayPrefs: (partial: Partial<DisplayPreferences>) => void;

  // Sound preferences (auto-save)
  updateSoundPrefs: (partial: Partial<SoundPreferences>) => void;

  // Keyboard preferences (auto-save)
  updateKeyboardPrefs: (partial: Partial<KeyboardPreferences>) => void;

  // AI personality (auto-save)
  updateAiPersonalitySettings: (
    personality: AiPersonalityType,
    customPrompt?: string | null
  ) => void;

  // Serving presets (auto-save)
  updateServingPresets: (presets: ServingSizePreset[]) => void;

  // Energy mode preferences (auto-save)
  updateEnergyModePrefs: (partial: Partial<EnergyModePreferences>) => void;

  // Planner view settings (auto-save)
  updatePlannerSettings: (partial: Partial<PlannerViewSettings>) => void;

  // Force immediate save
  saveNow: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_MS = 800;

// ============================================================================
// Context
// ============================================================================

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface SettingsProviderProps {
  children: ReactNode;
  initialData: SettingsState;
}

export function SettingsProvider({ children, initialData }: SettingsProviderProps) {
  // State
  const [state, setState] = useState<SettingsState>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Track pending changes for batching
  const pendingChanges = useRef<{
    settings?: Partial<UserSettings>;
    displayPrefs?: Partial<DisplayPreferences>;
    soundPrefs?: Partial<SoundPreferences>;
    keyboardPrefs?: Partial<KeyboardPreferences>;
    aiPersonality?: { personality: AiPersonalityType; customPrompt?: string | null };
    servingPresets?: ServingSizePreset[];
    energyModePrefs?: Partial<EnergyModePreferences>;
    plannerSettings?: Partial<PlannerViewSettings>;
  }>({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Save Logic
  // ──────────────────────────────────────────────────────────────────────────

  const executeSave = useCallback(async () => {
    const changes = { ...pendingChanges.current };
    pendingChanges.current = {};

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

      // Energy mode preferences
      if (changes.energyModePrefs && Object.keys(changes.energyModePrefs).length > 0) {
        savePromises.push(updateEnergyModePreferences(changes.energyModePrefs));
      }

      // Planner view settings
      if (changes.plannerSettings && Object.keys(changes.plannerSettings).length > 0) {
        savePromises.push(updatePlannerViewSettings(changes.plannerSettings));
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
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(executeSave, DEBOUNCE_MS);
  }, [executeSave]);

  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await executeSave();
  }, [executeSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Update Functions
  // ──────────────────────────────────────────────────────────────────────────

  const updateSettingsField = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, [key]: value },
      }));

      // Queue for save
      pendingChanges.current.settings = {
        ...pendingChanges.current.settings,
        [key]: value,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateSettingsBatch = useCallback(
    (partial: Partial<UserSettings>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }));

      // Queue for save
      pendingChanges.current.settings = {
        ...pendingChanges.current.settings,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateDisplayPrefs = useCallback(
    (partial: Partial<DisplayPreferences>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          display: { ...prev.preferencesV2.display, ...partial },
        },
      }));

      // Queue for save
      pendingChanges.current.displayPrefs = {
        ...pendingChanges.current.displayPrefs,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateSoundPrefs = useCallback(
    (partial: Partial<SoundPreferences>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          sounds: { ...prev.preferencesV2.sounds, ...partial },
        },
      }));

      // Queue for save
      pendingChanges.current.soundPrefs = {
        ...pendingChanges.current.soundPrefs,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateKeyboardPrefs = useCallback(
    (partial: Partial<KeyboardPreferences>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          keyboard: { ...prev.preferencesV2.keyboard, ...partial },
        },
      }));

      // Queue for save
      pendingChanges.current.keyboardPrefs = {
        ...pendingChanges.current.keyboardPrefs,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateAiPersonalitySettings = useCallback(
    (personality: AiPersonalityType, customPrompt?: string | null) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          aiPersonality: personality,
          customAiPrompt: customPrompt ?? prev.preferencesV2.customAiPrompt,
        },
      }));

      // Queue for save
      pendingChanges.current.aiPersonality = { personality, customPrompt };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateServingPresets = useCallback(
    (presets: ServingSizePreset[]) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          servingSizePresets: presets,
        },
      }));

      // Queue for save
      pendingChanges.current.servingPresets = presets;

      scheduleSave();
    },
    [scheduleSave]
  );

  const updateEnergyModePrefs = useCallback(
    (partial: Partial<EnergyModePreferences>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        preferencesV2: {
          ...prev.preferencesV2,
          energyMode: { ...prev.preferencesV2.energyMode, ...partial },
        },
      }));

      // Queue for save
      pendingChanges.current.energyModePrefs = {
        ...pendingChanges.current.energyModePrefs,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  const updatePlannerSettings = useCallback(
    (partial: Partial<PlannerViewSettings>) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        plannerViewSettings: prev.plannerViewSettings
          ? { ...prev.plannerViewSettings, ...partial }
          : { density: "comfortable", showMealTypeHeaders: true, showNutritionBadges: true, showPrepTime: true, ...partial },
      }));

      // Queue for save
      pendingChanges.current.plannerSettings = {
        ...pendingChanges.current.plannerSettings,
        ...partial,
      };

      scheduleSave();
    },
    [scheduleSave]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Context Value
  // ──────────────────────────────────────────────────────────────────────────

  const value: SettingsContextValue = {
    ...state,
    saveStatus,
    lastSavedAt,
    updateSettingsField,
    updateSettingsBatch,
    updateDisplayPrefs,
    updateSoundPrefs,
    updateKeyboardPrefs,
    updateAiPersonalitySettings,
    updateServingPresets,
    updateEnergyModePrefs,
    updatePlannerSettings,
    saveNow,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
}

// ============================================================================
// Utility Hook for Save Status
// ============================================================================

export function useSettingsSaveStatus() {
  const { saveStatus, lastSavedAt } = useSettings();
  return { saveStatus, lastSavedAt };
}

// ============================================================================
// Default State (for SSR/testing)
// ============================================================================

export function createDefaultSettingsState(): SettingsState {
  return {
    profile: {
      id: "",
      first_name: null,
      last_name: null,
      email: null,
      avatar_url: null,
      username: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    settings: {
      id: "",
      user_id: "",
      dark_mode: false,
      cook_names: ["Me"],
      cook_colors: {},
      email_notifications: true,
      allergen_alerts: [],
      custom_dietary_restrictions: [],
      category_order: null,
      calendar_event_time: null,
      calendar_event_duration_minutes: null,
      calendar_excluded_days: null,
      dismissed_hints: [],
      macro_goals: undefined,
      macro_tracking_enabled: false,
      macro_goal_preset: null,
      unit_system: "imperial",
      recipe_export_preferences: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    preferencesV2: DEFAULT_USER_PREFERENCES_V2,
    household: null,
    mealTypeSettings: null,
    plannerViewSettings: null,
  };
}
