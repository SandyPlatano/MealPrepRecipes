import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link as LinkIcon, Plus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportStats } from "@/hooks/use-recipe-import";
import { ImportProgress } from "./import-progress";

interface UrlInputStepProps {
  urlInputs: string[];
  validUrls: string[];
  isParsing: boolean;
  importStats: ImportStats | null;
  isLoadingStats: boolean;
  importStatuses: Array<{
    url: string;
    status: "pending" | "processing" | "success" | "error";
    error?: string;
  }>;
  maxUrls: number;
  onAddUrl: () => void;
  onRemoveUrl: (index: number) => void;
  onUpdateUrl: (index: number, value: string) => void;
  onSubmit: () => void;
}

export function UrlInputStep({
  urlInputs,
  validUrls,
  isParsing,
  importStats,
  isLoadingStats,
  importStatuses,
  maxUrls,
  onAddUrl,
  onRemoveUrl,
  onUpdateUrl,
  onSubmit,
}: UrlInputStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Import from URL
          </span>
          {!isLoadingStats && importStats && (
            <span
              className={cn(
                "text-xs font-normal px-2 py-1 rounded-full",
                importStats.remaining > 5
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : importStats.remaining > 0
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {importStats.remaining} / {importStats.limit} imports left today
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Add up to {maxUrls} recipe URLs and we&apos;ll fetch and parse them for you.
          Works with most recipe websites.
        </p>

        {/* URL Inputs */}
        <div className="flex flex-col gap-2">
          {urlInputs.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.allrecipes.com/recipe/..."
                value={url}
                onChange={(e) => onUpdateUrl(index, e.target.value)}
                disabled={isParsing}
              />
              {urlInputs.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveUrl(index)}
                  disabled={isParsing}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add URL Button */}
        {urlInputs.length < maxUrls && !isParsing && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddUrl}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another URL ({urlInputs.length}/{maxUrls})
          </Button>
        )}

        {/* Import Progress */}
        {isParsing && importStatuses.length > 0 && (
          <ImportProgress statuses={importStatuses} />
        )}

        {/* Import Button */}
        <Button
          onClick={onSubmit}
          disabled={isParsing || validUrls.length === 0 || (importStats?.remaining === 0)}
          className="w-full"
        >
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing {validUrls.length} Recipe{validUrls.length !== 1 && "s"}...
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Import {validUrls.length > 0 ? validUrls.length : ""} Recipe
              {validUrls.length !== 1 && "s"}
            </>
          )}
        </Button>

        {/* Warnings */}
        {importStats?.remaining === 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              You&apos;ve reached your daily import limit. Try again tomorrow or paste the recipe text instead.
            </span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Note: Some websites may block automated access. If it doesn&apos;t
          work, try copying and pasting the recipe text instead.
        </p>
      </CardContent>
    </Card>
  );
}
