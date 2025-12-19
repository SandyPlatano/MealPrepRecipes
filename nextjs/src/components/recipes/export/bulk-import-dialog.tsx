"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
  Loader2,
  Upload,
  FileUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ImportPreviewTable, ImportSummary } from "./import-preview-table";
import { parseImportFile } from "@/lib/export/import-validator";
import { importRecipes } from "@/app/actions/export";
import type { ImportParseResult, DuplicateHandling } from "@/types/export";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTitles: Set<string>;
  userId: string;
  onSuccess?: () => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  existingTitles,
  userId,
  onSuccess,
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>("skip");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setParseResult(null);
      setDuplicateHandling("skip");
      setIsParsing(false);
      setIsImporting(false);
    }
  }, [open]);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setIsParsing(true);
      setParseResult(null);

      try {
        const result = await parseImportFile(selectedFile, existingTitles, userId);
        setParseResult(result);

        if (!result.success) {
          toast.error(result.error || "Failed to parse file");
        }
      } catch (error) {
        console.error("Parse error:", error);
        toast.error("Failed to read file");
        setParseResult(null);
      } finally {
        setIsParsing(false);
      }
    },
    [existingTitles, userId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const handleImport = async () => {
    if (!parseResult || !parseResult.success) return;

    setIsImporting(true);

    try {
      const result = await importRecipes(parseResult.recipes, duplicateHandling);

      if (result.success) {
        const messages: string[] = [];
        if (result.imported > 0) {
          messages.push(`${result.imported} imported`);
        }
        if (result.replaced > 0) {
          messages.push(`${result.replaced} replaced`);
        }
        if (result.skipped > 0) {
          messages.push(`${result.skipped} skipped`);
        }

        toast.success(`Import complete: ${messages.join(", ")}`);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Import failed. Please try again.");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  const importableCount = parseResult
    ? parseResult.validCount -
      (duplicateHandling === "skip" ? parseResult.duplicateCount : 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Recipes
          </DialogTitle>
          <DialogDescription>
            Import recipes from JSON or Paprika export files
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex-col">
          {/* File Drop Zone */}
          {!parseResult && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isParsing ? (
                <div className="flex flex-col">
                  <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Parsing file...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop file here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports .json and .paprikarecipes files
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".json,.paprikarecipes"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  />
                  <Button variant="outline" className="relative">
                    <input
                      type="file"
                      accept=".json,.paprikarecipes"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Parse Results */}
          {parseResult && (
            <>
              {/* Summary */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {parseResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="font-medium">
                      {file?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParseResult(null);
                    }}
                  >
                    Change File
                  </Button>
                </div>

                <ImportSummary
                  totalCount={parseResult.totalCount}
                  validCount={parseResult.validCount}
                  duplicateCount={parseResult.duplicateCount}
                  invalidCount={parseResult.invalidCount}
                />
              </div>

              {/* Recipe List */}
              <div className="border rounded-lg">
                <ImportPreviewTable
                  results={parseResult.recipes}
                  maxHeight="200px"
                />
              </div>

              {/* Duplicate Handling */}
              {parseResult.duplicateCount > 0 && (
                <div className="flex flex-col pt-2 border-t">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Handle {parseResult.duplicateCount} duplicate{parseResult.duplicateCount !== 1 ? "s" : ""}
                  </Label>
                  <RadioGroup
                    value={duplicateHandling}
                    onValueChange={(value) =>
                      setDuplicateHandling(value as DuplicateHandling)
                    }
                    className="flex flex-col"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip" className="cursor-pointer">
                        Skip duplicates (keep existing)
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="cursor-pointer">
                        Replace existing recipes
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="keep_both" id="keep_both" />
                      <Label htmlFor="keep_both" className="cursor-pointer">
                        Keep both (rename new ones)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parseResult?.success || importableCount === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {importableCount > 0 ? `${importableCount} Recipe${importableCount !== 1 ? "s" : ""}` : "Recipes"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
