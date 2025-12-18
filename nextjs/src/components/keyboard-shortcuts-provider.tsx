"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  type KeyboardPreferences,
} from "@/types/user-preferences-v2";

const DEFAULT_PREFS: KeyboardPreferences = {
  enabled: true,
  shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

/**
 * Provider component that activates global keyboard shortcuts.
 *
 * This is a standalone client component that fetches keyboard preferences
 * directly and doesn't require SettingsProvider.
 */
export function KeyboardShortcutsProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const [prefs, setPrefs] = useState<KeyboardPreferences>(DEFAULT_PREFS);
  const [darkMode, setDarkMode] = useState(false);

  // Track last toast time to prevent spam
  const lastToastRef = useRef<number>(0);

  // Fetch keyboard preferences on mount
  useEffect(() => {
    async function fetchPrefs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch preferences from user_settings.preferences_v2 column
        const { data: settingsData, error } = await supabase
          .from("user_settings")
          .select("preferences_v2, dark_mode")
          .eq("user_id", user.id)
          .single();

        if (!error && settingsData) {
          // Extract keyboard preferences from the JSONB column
          const prefsV2 = settingsData.preferences_v2 as { keyboard?: KeyboardPreferences } | null;
          if (prefsV2?.keyboard) {
            setPrefs({
              enabled: prefsV2.keyboard.enabled ?? true,
              shortcuts: { ...DEFAULT_KEYBOARD_SHORTCUTS, ...prefsV2.keyboard.shortcuts },
            });
          }
          setDarkMode(settingsData.dark_mode ?? false);
        }
      } catch (err) {
        // Silently fail - just use defaults
        console.error("Failed to fetch keyboard preferences:", err);
      }
    }

    fetchPrefs();
  }, []);

  // Show a brief toast for navigation shortcuts
  const showShortcutToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastToastRef.current > 500) {
      lastToastRef.current = now;
      toast.info(message, { duration: 1500 });
    }
  }, []);

  // Create a reverse mapping: key -> action
  const keyToAction = useCallback(() => {
    const mapping: Record<string, string> = {};
    for (const [action, key] of Object.entries(prefs.shortcuts)) {
      mapping[key.toLowerCase()] = action;
    }
    return mapping;
  }, [prefs.shortcuts]);

  // Toggle dark mode function
  const toggleDarkMode = useCallback(async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Update the theme immediately via ThemeProvider
    document.documentElement.classList.toggle("dark", newMode);

    // Save to database
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("user_settings")
          .update({ dark_mode: newMode })
          .eq("user_id", user.id);
      }
    } catch (err) {
      console.error("Failed to save dark mode:", err);
    }

    showShortcutToast(newMode ? "🌙 Dark Mode" : "☀️ Light Mode");
  }, [darkMode, showShortcutToast]);

  // Handle the keyboard action
  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "goToPlanner":
          if (pathname !== "/app") {
            router.push("/app");
            showShortcutToast("📅 Planner");
          }
          break;

        case "goToRecipes":
          if (!pathname.startsWith("/app/recipes")) {
            router.push("/app/recipes");
            showShortcutToast("📖 Recipes");
          }
          break;

        case "goToShopping":
          if (!pathname.startsWith("/app/shop")) {
            router.push("/app/shop");
            showShortcutToast("🛒 Shopping List");
          }
          break;

        case "openSettings":
          if (!pathname.startsWith("/app/settings")) {
            router.push("/app/settings");
            showShortcutToast("⚙️ Settings");
          }
          break;

        case "newRecipe":
          if (pathname !== "/app/recipes/new") {
            router.push("/app/recipes/new");
            showShortcutToast("✨ New Recipe");
          }
          break;

        case "search":
          const searchInput = document.querySelector<HTMLInputElement>(
            '[data-search-input="true"], input[placeholder*="Search"]'
          );
          if (searchInput) {
            searchInput.focus();
            showShortcutToast("🔍 Search");
          }
          break;

        case "toggleDarkMode":
          toggleDarkMode();
          break;

        case "nextWeek":
          window.dispatchEvent(new CustomEvent("keyboard:nextWeek"));
          break;

        case "prevWeek":
          window.dispatchEvent(new CustomEvent("keyboard:prevWeek"));
          break;

        default:
          break;
      }
    },
    [pathname, router, showShortcutToast, toggleDarkMode]
  );

  // Global keydown listener
  useEffect(() => {
    if (!prefs.enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable ||
        target.closest('[role="textbox"]');

      if (isEditable) return;

      // Ignore modifiers (except for arrow keys)
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      const isArrowKey = event.key.startsWith("Arrow");

      if (hasModifier && !isArrowKey) return;

      const key = event.key.toLowerCase();
      const mapping = keyToAction();
      const action = mapping[key];

      if (action) {
        event.preventDefault();
        handleAction(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prefs.enabled, keyToAction, handleAction]);

  return null;
}
