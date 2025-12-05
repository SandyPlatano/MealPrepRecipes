"use client";

import { useEffect } from "react";

/**
 * Restores scroll position for the Plan page when returning from recipe detail.
 */
export function PlanScrollRestorer() {
  useEffect(() => {
    const key = "planScrollY";
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
    if (stored) {
      const y = parseInt(stored, 10);
      if (!Number.isNaN(y)) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
      sessionStorage.removeItem(key);
    }
  }, []);

  return null;
}


