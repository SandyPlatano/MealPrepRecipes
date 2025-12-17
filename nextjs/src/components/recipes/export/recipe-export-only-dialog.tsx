"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { ExportFormat } from "@/types/export";
import { RecipeExportPreview } from "./recipe-export-preview";
import { ExportFormatButtons } from "./export-format-buttons";
import { downloadRecipeAsMarkdown } from "@/lib/export/recipe-markdown";
import { downloadRecipeAsJson } from "@/lib/export/recipe-to-json";
import { exportRecipeToPdf } from "@/lib/export/recipe-to-pdf";
import { exportRecipeToImage } from "@/lib/export/recipe-to-image";
import { DEFAULT_RECIPE_EXPORT_PREFERENCES } from "@/lib/export";

interface RecipeExportOnlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null };
}

export function RecipeExportOnlyDialog({
  open,
  onOpenChange,
  recipe,
}: RecipeExportOnlyDialogProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const exportPreviewRef = useRef<HTMLDivElement>(null);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setExportingFormat(null);
    }
  }, [open]);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);

    try {
      switch (format) {
        case "png":
        case "jpeg":
          if (!exportPreviewRef.current) {
            throw new Error("Export preview not ready");
          }
          await exportRecipeToImage(
            exportPreviewRef.current,
            recipe.title,
            format
          );
          toast.success(`${format.toUpperCase()} downloaded!`);
          break;

        case "pdf":
          if (!exportPreviewRef.current) {
            throw new Error("Export preview not ready");
          }
          await exportRecipeToPdf(exportPreviewRef.current, recipe.title);
          toast.success("PDF downloaded!");
          break;

        case "markdown":
          downloadRecipeAsMarkdown({
            recipe,
            nutrition: recipe.nutrition,
            preferences: DEFAULT_RECIPE_EXPORT_PREFERENCES,
          });
          toast.success("Markdown downloaded!");
          break;

        case "json":
          downloadRecipeAsJson(recipe, recipe.nutrition);
          toast.success("JSON downloaded!");
          break;
      }
    } catch (error) {
      console.error(`${format} export failed:`, error);
      toast.error(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Recipe
            </DialogTitle>
            <DialogDescription>
              {recipe.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a format to download your recipe
            </p>

            <ExportFormatButtons
              onExport={handleExport}
              exportingFormat={exportingFormat}
            />

            <p className="text-xs text-muted-foreground text-center pt-2">
              Tip: Use JSON format to back up and restore recipes
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Export Preview (for capturing) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <RecipeExportPreview ref={exportPreviewRef} recipe={recipe} />
      </div>
    </>
  );
}
