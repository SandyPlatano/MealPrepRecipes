"use client";

import { useEffect, useCallback } from "react";

const SCROLL_KEY = "planScrollY";

/**
 * Restores scroll position for the Plan page when returning from recipe detail.
 * Also saves scroll position when navigating away.
 */
export function PlanScrollRestorer() {
  // Save scroll position before navigating away
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    }
  }, []);

  useEffect(() => {
    // Restore scroll on mount
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(SCROLL_KEY) : null;
    if (stored) {
      const y = parseInt(stored, 10);
      if (!Number.isNaN(y)) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
      sessionStorage.removeItem(SCROLL_KEY);
    }

    // Save scroll position when navigating away
    const handleBeforeUnload = () => saveScrollPosition();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveScrollPosition();
      }
    };

    // Save on link clicks within the page (for SPA navigation)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href && !anchor.href.startsWith("#")) {
        saveScrollPosition();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleClick, true);
    };
  }, [saveScrollPosition]);

  return null;
}


