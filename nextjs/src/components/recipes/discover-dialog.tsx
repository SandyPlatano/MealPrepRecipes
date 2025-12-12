"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecipeDiscovery } from "./recipe-discovery";
import type { RecipeWithFavorite } from "@/types/recipe";

interface DiscoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: RecipeWithFavorite[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[];
}

export function DiscoverDialog({
  open,
  onOpenChange,
  recipes,
  recipeCookCounts,
  recentlyCookedIds,
}: DiscoverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[70vw] h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-mono font-bold">
            Discover Recipes
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <RecipeDiscovery
            recipes={recipes}
            recipeCookCounts={recipeCookCounts}
            recentlyCookedIds={recentlyCookedIds}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

