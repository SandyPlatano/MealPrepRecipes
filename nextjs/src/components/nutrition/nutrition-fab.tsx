"use client";

/**
 * Nutrition Floating Action Button (FAB)
 * Fixed position button for quick access to Quick Add Macros
 * Mobile-optimized with large touch target
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddMacrosSheet } from "./quick-add-macros-sheet";

interface NutritionFabProps {
  date?: string;
  className?: string;
}

export function NutritionFab({ date, className }: NutritionFabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <Button
        onClick={() => setIsSheetOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          // Large touch target (44x44 minimum, this is 56x56)
          "touch-manipulation",
          className
        )}
        size="icon"
        aria-label="Quick add macros"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Add Sheet */}
      <QuickAddMacrosSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        date={date}
      />
    </>
  );
}

/**
 * Compact inline version for embedding in cards
 */
export function QuickAddButton({
  date,
  variant = "outline",
  size = "sm",
  className,
}: {
  date?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsSheetOpen(true)}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
      >
        <Plus className="h-4 w-4" />
        Quick Add
      </Button>

      <QuickAddMacrosSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        date={date}
      />
    </>
  );
}
