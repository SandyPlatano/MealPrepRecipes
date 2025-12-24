"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Star, Command, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HINT_IDS, isHintDismissedLocally, dismissHintLocally } from "@/lib/hints";

interface FirstRecipeHintProps {
  /** Total number of recipes the user has */
  recipeCount: number;
}

/**
 * Celebratory hint shown after creating the first recipe.
 * More prominent than regular contextual hints with action items.
 */
export function FirstRecipeHint({ recipeCount }: FirstRecipeHintProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setIsDismissed(isHintDismissedLocally(HINT_IDS.FIRST_RECIPE_SUCCESS));
  }, []);

  const handleDismiss = () => {
    dismissHintLocally(HINT_IDS.FIRST_RECIPE_SUCCESS);
    setIsDismissed(true);
  };

  // Only show for first recipe and if not dismissed
  if (!isHydrated || isDismissed || recipeCount !== 1) {
    return null;
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-500 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-5 mb-6 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-green-950/30 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
          <PartyPopper className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Your First Recipe!
          </h3>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Congratulations on adding your first recipe. Here&apos;s what you can do next:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Add to your meal plan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
              <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Rate after cooking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
              <Command className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Press Cmd+K to search</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          >
            Got it!
          </Button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          aria-label="Dismiss hint"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
