"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Download, FileText, Braces, Package } from "lucide-react";
import { toast } from "sonner";
import { RecipeSelectorList } from "./recipe-selector-list";
import { downloadBulkExport, formatBytes, estimateExportSize } from "@/lib/export/bulk-export";
import type { Recipe } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { BulkExportFormat } from "@/types/export";

interface BulkExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: Recipe[];
  nutritionMap?: Map<string, RecipeNutrition>;
}

export function BulkExportDialog({
  open,
  onOpenChange,
  recipes,
  nutritionMap,
}: BulkExportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<BulkExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setFormat("json");
    }
  }, [open]);

  const selectedRecipes = recipes.filter((r) => selectedIds.has(r.id));
  const estimatedSize = estimateExportSize(selectedRecipes, format);

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one recipe to export");
      return;
    }

    setIsExporting(true);

    try {
      const result = await downloadBulkExport({
        recipes: selectedRecipes,
        nutritionMap,
        format,
      });

      if (result.success) {
        toast.success(
          `Successfully exported ${selectedIds.size} recipe${selectedIds.size !== 1 ? "s" : ""}`
        );
        onOpenChange(false);
      } else {
        toast.error(result.error || "Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Export Recipes
          </DialogTitle>
          <DialogDescription>
            Select recipes to export as a ZIP file with individual files
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex-col">
          {/* Recipe Selector */}
          <RecipeSelectorList
            recipes={recipes}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            maxHeight="250px"
          />

          {/* Format Selection */}
          <div className="flex flex-col pt-2 border-t">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as BulkExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="relative">
                <RadioGroupItem
                  value="json"
                  id="format-json"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="format-json"
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    hover:bg-muted/50
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <Braces className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">
                      Recommended for backup & restore
                    </p>
                  </div>
                </Label>
              </div>

              <div className="relative">
                <RadioGroupItem
                  value="markdown"
                  id="format-markdown"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="format-markdown"
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    hover:bg-muted/50
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Markdown</p>
                    <p className="text-xs text-muted-foreground">
                      Human-readable text files
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Info */}
          {selectedIds.size > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {selectedIds.size} recipe{selectedIds.size !== 1 ? "s" : ""} selected
                </span>
                <span className="text-muted-foreground">
                  ~{formatBytes(estimatedSize)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedIds.size === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {selectedIds.size > 0 ? `${selectedIds.size} Recipe${selectedIds.size !== 1 ? "s" : ""}` : "Selected"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
