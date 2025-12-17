"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import type { ImportValidationResult } from "@/types/export";

interface ImportPreviewTableProps {
  results: ImportValidationResult[];
  maxHeight?: string;
}

export function ImportPreviewTable({
  results,
  maxHeight = "300px",
}: ImportPreviewTableProps) {
  return (
    <ScrollArea style={{ height: maxHeight }}>
      <div className="space-y-1 pr-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30"
          >
            {/* Status Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0">
                    {!result.isValid ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : result.isDuplicate ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : result.warnings.length > 0 ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {!result.isValid ? (
                    <div className="space-y-1">
                      <p className="font-medium text-destructive">Invalid</p>
                      <ul className="text-xs list-disc pl-4">
                        {result.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ) : result.isDuplicate ? (
                    <p>Recipe already exists in your collection</p>
                  ) : result.warnings.length > 0 ? (
                    <div className="space-y-1">
                      <p className="font-medium">Warnings</p>
                      <ul className="text-xs list-disc pl-4">
                        {result.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Ready to import</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Recipe Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{result.title}</p>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {!result.isValid ? (
                <Badge variant="destructive" className="text-xs">
                  Invalid
                </Badge>
              ) : result.isDuplicate ? (
                <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Duplicate
                </Badge>
              ) : result.warnings.length > 0 ? (
                <Badge variant="secondary" className="text-xs">
                  Warning
                </Badge>
              ) : (
                <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  OK
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

/**
 * Summary stats component
 */
export function ImportSummary({
  totalCount,
  validCount,
  duplicateCount,
  invalidCount,
}: {
  totalCount: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="p-2 rounded-lg bg-muted/50">
        <p className="text-lg font-bold">{totalCount}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
        <p className="text-lg font-bold text-green-700 dark:text-green-300">
          {validCount - duplicateCount}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">Ready</p>
      </div>
      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
          {duplicateCount}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">Duplicates</p>
      </div>
      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
        <p className="text-lg font-bold text-red-700 dark:text-red-300">
          {invalidCount}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">Invalid</p>
      </div>
    </div>
  );
}
