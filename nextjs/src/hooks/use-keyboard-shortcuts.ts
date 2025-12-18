"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/settings-context";
import { toast } from "sonner";

/**
 * Global keyboard shortcuts hook
 *
 * Listens for keyboard events and triggers navigation/actions based on
 * user-configured shortcuts from settings.
 *
 * Ignores input when user is typing in form elements.
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { preferencesV2 } = useSettings();
  const shortcuts = preferencesV2.keyboard.shortcuts;
  const enabled = preferencesV2.keyboard.enabled;

  // Track last toast time to prevent spam
  const lastToastRef = useRef<number>(0);

  // Show a brief toast for navigation shortcuts
  const showShortcutToast = useCallback((message: string) => {
    const now = Date.now();
    // Only show toast if more than 500ms since last
    if (now - lastToastRef.current > 500) {
      lastToastRef.current = now;
      toast.info(message, { duration: 1500 });
    }
  }, []);

  // Create a reverse mapping: key -> action
  const keyToAction = useCallback(() => {
    const mapping: Record<string, string> = {};
    for (const [action, key] of Object.entries(shortcuts)) {
      mapping[key.toLowerCase()] = action;
    }
    return mapping;
  }, [shortcuts]);

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
          if (!pathname.startsWith("/app/shopping")) {
            router.push("/app/shopping");
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
          // Focus the search input if it exists
          const searchInput = document.querySelector<HTMLInputElement>(
            '[data-search-input="true"], input[placeholder*="Search"]'
          );
          if (searchInput) {
            searchInput.focus();
            showShortcutToast("🔍 Search");
          }
          break;

        case "toggleDarkMode":
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          showShortcutToast(newTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode");
          break;

        case "nextWeek":
          // Dispatch custom event for planner to handle
          window.dispatchEvent(new CustomEvent("keyboard:nextWeek"));
          break;

        case "prevWeek":
          // Dispatch custom event for planner to handle
          window.dispatchEvent(new CustomEvent("keyboard:prevWeek"));
          break;

        default:
          // Unknown action, ignore
          break;
      }
    },
    [pathname, router, theme, setTheme, showShortcutToast]
  );

  useEffect(() => {
    // Don't attach listener if shortcuts are disabled
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable ||
        target.closest('[role="textbox"]');

      if (isEditable) return;

      // Ignore if modifier keys are pressed (except for arrow keys)
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      const isArrowKey = event.key.startsWith("Arrow");

      if (hasModifier && !isArrowKey) return;

      // Get the pressed key
      const key = event.key.toLowerCase();
      const mapping = keyToAction();
      const action = mapping[key];

      if (action) {
        // Prevent default for all matched shortcuts
        event.preventDefault();
        handleAction(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, keyToAction, handleAction]);

  // Return nothing - this hook is purely for side effects
  return null;
}
