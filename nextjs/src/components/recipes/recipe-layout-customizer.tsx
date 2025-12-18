"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecipeSectionsManager } from "@/components/settings/recipe-layout/recipe-sections-manager";
import type { RecipeLayoutPreferences } from "@/types/recipe-layout";

interface RecipeLayoutCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutPrefs: RecipeLayoutPreferences;
  onUpdate: (prefs: RecipeLayoutPreferences) => void;
}

export function RecipeLayoutCustomizer({
  open,
  onOpenChange,
  layoutPrefs,
  onUpdate,
}: RecipeLayoutCustomizerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Recipe Layout</DialogTitle>
          <DialogDescription>
            Drag to reorder sections, toggle visibility, and adjust widths. Changes apply to all recipes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RecipeSectionsManager
            layoutPrefs={layoutPrefs}
            onUpdate={onUpdate}
            hideReset
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/settings/recipe-layout">
              <Settings className="h-4 w-4 mr-2" />
              More Options
            </Link>
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
