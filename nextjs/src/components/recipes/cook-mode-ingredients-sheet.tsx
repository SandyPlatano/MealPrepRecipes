"use client";

/**
 * Cook Mode Ingredients Sheet
 * Mobile-first bottom sheet for accessing ingredients during cooking mode.
 * Designed for neurodivergent users with:
 * - Large touch targets
 * - Clear visual hierarchy
 * - Highlighted current step ingredients
 * - Generous spacing for easy scanning
 */

import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookModeIngredientsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: string[];
  checkedIngredients: boolean[];
  highlightedIndices: Set<number>;
  onToggleIngredient: (index: number) => void;
}

export function CookModeIngredientsSheet({
  isOpen,
  onClose,
  ingredients,
  checkedIngredients,
  highlightedIndices,
  onToggleIngredient,
}: CookModeIngredientsSheetProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const allChecked = checkedIngredients.every((checked) => checked);
  const highlightedCount = highlightedIndices.size;
  const checkedCount = checkedIngredients.filter((c) => c).length;

  // Separate highlighted (for this step) and other ingredients
  const highlightedIngredients = ingredients
    .map((ing, idx) => ({ ingredient: ing, index: idx }))
    .filter(({ index }) => highlightedIndices.has(index));

  const otherIngredients = ingredients
    .map((ing, idx) => ({ ingredient: ing, index: idx }))
    .filter(({ index }) => !highlightedIndices.has(index));

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "max-h-[80vh]",
          "bg-background rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "flex flex-col"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-3">
          <button
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            aria-label="Close ingredients"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-semibold block">Ingredients</span>
              <span className="text-sm text-muted-foreground">
                {checkedCount} of {ingredients.length} ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allChecked && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                All set!
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onClose}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {/* Highlighted ingredients for current step */}
          {highlightedCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  Needed for this step ({highlightedCount})
                </Badge>
              </div>
              <div className="space-y-4">
                {highlightedIngredients.map(({ ingredient, index }) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4 rounded-xl p-4 transition-colors",
                      !checkedIngredients[index]
                        ? "bg-primary/10 ring-2 ring-primary/30"
                        : "bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={`sheet-ingredient-${index}`}
                      checked={checkedIngredients[index]}
                      onCheckedChange={() => onToggleIngredient(index)}
                      className="mt-1 h-6 w-6"
                    />
                    <label
                      htmlFor={`sheet-ingredient-${index}`}
                      className={cn(
                        "text-base leading-relaxed cursor-pointer flex-1",
                        checkedIngredients[index]
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      )}
                    >
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other ingredients */}
          {otherIngredients.length > 0 && (
            <div>
              {highlightedCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Other ingredients
                  </span>
                </div>
              )}
              <div className="space-y-3">
                {otherIngredients.map(({ ingredient, index }) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      id={`sheet-ingredient-other-${index}`}
                      checked={checkedIngredients[index]}
                      onCheckedChange={() => onToggleIngredient(index)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <label
                      htmlFor={`sheet-ingredient-other-${index}`}
                      className={cn(
                        "text-base leading-relaxed cursor-pointer flex-1",
                        checkedIngredients[index] && "line-through text-muted-foreground"
                      )}
                    >
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
