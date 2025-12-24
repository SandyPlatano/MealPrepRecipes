"use client";

import { X, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import type { HintId } from "@/lib/hints";
import { dismissHintLocally, isHintDismissedLocally } from "@/lib/hints";

interface ContextualHintProps {
  hintId: HintId;
  title: string;
  description: string;
}

export function ContextualHint({
  hintId,
  title,
  description,
}: ContextualHintProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isHydrated, setIsHydrated] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
    setIsDismissed(isHintDismissedLocally(hintId));
  }, [hintId]);

  const handleDismiss = () => {
    dismissHintLocally(hintId); // Persist to localStorage immediately
    setIsDismissed(true);
  };

  // Don't render until hydrated (prevents flash) or if dismissed
  if (!isHydrated || isDismissed) {
    return null;
  }

  return (
    <div className="animate-in fade-in-0 duration-300 rounded-lg border border-blue-200 bg-blue-50/50 p-4 mb-6 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          aria-label="Dismiss hint"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
