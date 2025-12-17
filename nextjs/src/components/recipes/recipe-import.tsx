"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RecipeForm } from "./recipe-form";
import type { RecipeFormData } from "@/types/recipe";
import { getNetworkErrorMessage, cn } from "@/lib/utils";

type ImportMode = "manual" | "paste" | "url";

const MAX_URLS = 5;

interface ParsedRecipe {
  title: string;
  recipe_type: string;
  category: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  base_servings?: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  notes: string;
  source_url?: string;
}

interface UrlImportStatus {
  url: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
  recipe?: RecipeFormData;
}

interface ImportStats {
  remaining: number;
  limit: number;
}

export function RecipeImport() {
  const [mode, setMode] = useState<ImportMode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<RecipeFormData | null>(null);
  const [parsedRecipes, setParsedRecipes] = useState<RecipeFormData[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [nutritionEnabled, setNutritionEnabled] = useState(false);
  const [importStatuses, setImportStatuses] = useState<UrlImportStatus[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Check if nutrition tracking is enabled and fetch import stats
  useEffect(() => {
    async function checkNutritionTracking() {
      try {
        const response = await fetch("/api/nutrition/tracking-status");
        if (response.ok) {
          const data = await response.json();
          setNutritionEnabled(data.enabled || false);
        }
      } catch (error) {
        console.error("Failed to check nutrition tracking status:", error);
      }
    }

    async function fetchImportStats() {
      try {
        const response = await fetch("/api/import-stats");
        if (response.ok) {
          const data = await response.json();
          setImportStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch import stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    checkNutritionTracking();
    fetchImportStats();
  }, []);

  // URL input management
  const addUrlInput = () => {
    if (urlInputs.length < MAX_URLS) {
      setUrlInputs([...urlInputs, ""]);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  };

  const updateUrlInput = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = value;
    setUrlInputs(newInputs);
  };

  const validUrls = urlInputs.filter((url) => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      toast.error("You gotta paste something first");
      return;
    }

    setIsParsing(true);
    try {
      const response = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });

      if (!response.ok) {
        // Handle network errors
        if (!response.body) {
          throw new Error("Network error. Please check your connection.");
        }
        const error = await response.json().catch(() => ({
          error: "Failed to parse recipe",
        }));
        throw new Error(error.error || "Failed to parse recipe");
      }

      const parsed: ParsedRecipe = await response.json();
      setParsedRecipe({
        title: parsed.title,
        recipe_type: parsed.recipe_type as RecipeFormData["recipe_type"],
        category: parsed.category,
        prep_time: parsed.prep_time,
        cook_time: parsed.cook_time,
        servings: parsed.servings,
        base_servings: parsed.base_servings,
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        tags: parsed.tags,
        notes: parsed.notes,
        source_url: parsed.source_url,
        is_shared_with_household: true,
      });
      toast.success("Got it! Review and save when ready.");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error(getNetworkErrorMessage(error));
    } finally {
      setIsParsing(false);
    }
  };

  const importSingleUrl = async (
    url: string
  ): Promise<{ success: boolean; recipe?: RecipeFormData; error?: string }> => {
    try {
      // First scrape the URL
      const scrapeResponse = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        if (!scrapeResponse.body) {
          throw new Error("Network error");
        }
        const error = await scrapeResponse.json().catch(() => ({
          error: "Failed to fetch recipe page",
        }));
        throw new Error(error.error || "Failed to fetch recipe page");
      }

      const { html } = await scrapeResponse.json();

      // Then parse the HTML
      const parseResponse = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: html, sourceUrl: url }),
      });

      if (!parseResponse.ok) {
        if (!parseResponse.body) {
          throw new Error("Network error");
        }
        const error = await parseResponse.json().catch(() => ({
          error: "Failed to parse recipe",
        }));
        throw new Error(error.error || "Failed to parse recipe");
      }

      const parsed: ParsedRecipe = await parseResponse.json();
      return {
        success: true,
        recipe: {
          title: parsed.title,
          recipe_type: parsed.recipe_type as RecipeFormData["recipe_type"],
          category: parsed.category,
          prep_time: parsed.prep_time,
          cook_time: parsed.cook_time,
          servings: parsed.servings,
          base_servings: parsed.base_servings,
          ingredients: parsed.ingredients,
          instructions: parsed.instructions,
          tags: parsed.tags,
          notes: parsed.notes,
          source_url: parsed.source_url || url,
          is_shared_with_household: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to import recipe",
      };
    }
  };

  const handleUrlSubmit = async () => {
    if (validUrls.length === 0) {
      toast.error("Enter at least one valid URL");
      return;
    }

    // Check daily limit
    if (importStats && validUrls.length > importStats.remaining) {
      toast.error(
        `You can only import ${importStats.remaining} more recipe${importStats.remaining === 1 ? "" : "s"} today`
      );
      return;
    }

    setIsParsing(true);

    // Initialize statuses
    const initialStatuses: UrlImportStatus[] = validUrls.map((url) => ({
      url,
      status: "pending",
    }));
    setImportStatuses(initialStatuses);

    const successfulRecipes: RecipeFormData[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process URLs sequentially
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];

      // Update status to processing
      setImportStatuses((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "processing" } : s
        )
      );

      const result = await importSingleUrl(url);

      if (result.success && result.recipe) {
        successfulRecipes.push(result.recipe);
        successCount++;
        setImportStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "success", recipe: result.recipe } : s
          )
        );
      } else {
        errorCount++;
        setImportStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "error", error: result.error } : s
          )
        );
      }
    }

    // Update import stats after batch
    if (successCount > 0 && importStats) {
      setImportStats({
        ...importStats,
        remaining: importStats.remaining - successCount,
      });
    }

    setIsParsing(false);

    // Show result summary
    if (successCount > 0 && errorCount === 0) {
      toast.success(
        `Successfully imported ${successCount} recipe${successCount === 1 ? "" : "s"}!`
      );
      setParsedRecipes(successfulRecipes);
      setCurrentReviewIndex(0);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(
        `Imported ${successCount} recipe${successCount === 1 ? "" : "s"}, ${errorCount} failed`
      );
      setParsedRecipes(successfulRecipes);
      setCurrentReviewIndex(0);
    } else {
      toast.error("All imports failed. Try pasting the recipe text instead.");
    }
  };

  const handleClearParsed = () => {
    setParsedRecipe(null);
    setParsedRecipes([]);
    setCurrentReviewIndex(0);
    setPasteText("");
    setUrlInputs([""]);
    setImportStatuses([]);
  };

  const handleNextRecipe = () => {
    if (currentReviewIndex < parsedRecipes.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }
  };

  const handlePrevRecipe = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    }
  };

  const handleRecipeSaved = () => {
    // Remove the saved recipe from the list
    const newRecipes = parsedRecipes.filter((_, i) => i !== currentReviewIndex);
    setParsedRecipes(newRecipes);

    // Adjust index if needed
    if (currentReviewIndex >= newRecipes.length && newRecipes.length > 0) {
      setCurrentReviewIndex(newRecipes.length - 1);
    } else if (newRecipes.length === 0) {
      handleClearParsed();
      toast.success("All recipes saved!");
    }
  };

  // If we have parsed recipes from batch import, show the multi-recipe review flow
  if (parsedRecipes.length > 0) {
    const currentRecipe = parsedRecipes[currentReviewIndex];
    return (
      <div className="space-y-6">
        {/* Multi-Recipe Review Header */}
        <div className="bg-accent/50 border border-accent rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Review Recipe {currentReviewIndex + 1} of {parsedRecipes.length}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentRecipe.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {parsedRecipes.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevRecipe}
                    disabled={currentReviewIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextRecipe}
                    disabled={currentReviewIndex === parsedRecipes.length - 1}
                  >
                    Next
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleClearParsed}>
                Start Over
              </Button>
            </div>
          </div>
          {/* Recipe Progress Pills */}
          {parsedRecipes.length > 1 && (
            <div className="flex gap-2 mt-4">
              {parsedRecipes.map((recipe, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentReviewIndex(idx)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    idx === currentReviewIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {recipe.title?.substring(0, 20) || `Recipe ${idx + 1}`}
                  {(recipe.title?.length || 0) > 20 && "..."}
                </button>
              ))}
            </div>
          )}
        </div>
        <RecipeForm
          key={currentReviewIndex}
          initialData={currentRecipe}
          nutritionEnabled={nutritionEnabled}
          onSaveSuccess={handleRecipeSaved}
        />
      </div>
    );
  }

  // If we have a single parsed recipe (from paste), show the form for editing
  if (parsedRecipe) {
    return (
      <div className="space-y-6">
        {/* Review Header - Make it obvious we're in review mode */}
        <div className="bg-accent/50 border border-accent rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Review Your Recipe</h2>
                <p className="text-sm text-muted-foreground">
                  AI parsed your recipe. Double-check and save when ready.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleClearParsed}>
              Start Over
            </Button>
          </div>
        </div>
        <RecipeForm initialData={parsedRecipe} nutritionEnabled={nutritionEnabled} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
        <Button
          variant={mode === "paste" ? "default" : "outline"}
          onClick={() => setMode("paste")}
          className="flex-1"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Paste Text
        </Button>
        <Button
          variant={mode === "url" ? "default" : "outline"}
          onClick={() => setMode("url")}
          className="flex-1"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          From URL
        </Button>
      </div>

      {/* Manual Entry */}
      {mode === "manual" && <RecipeForm nutritionEnabled={nutritionEnabled} />}

      {/* Paste Text */}
      {mode === "paste" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Paste Recipe Text
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste any recipe text - from a website, an email, your notes,
              wherever. Our AI will turn it into a clean, organized recipe.
            </p>
            <Textarea
              placeholder="Paste your recipe here...

Example:
Grandma's Chicken Soup
Prep: 15 min | Cook: 1 hour

Ingredients:
- 2 lbs chicken thighs
- 4 cups chicken broth
- 2 carrots, diced
..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <Button
              onClick={handlePasteSubmit}
              disabled={isParsing || !pasteText.trim()}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parse Recipe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* From URL */}
      {mode === "url" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Import from URL
              </span>
              {/* Import Stats Badge */}
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
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add up to {MAX_URLS} recipe URLs and we&apos;ll fetch and parse them for you.
              Works with most recipe websites.
            </p>

            {/* URL Inputs */}
            <div className="space-y-2">
              {urlInputs.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://www.allrecipes.com/recipe/..."
                    value={url}
                    onChange={(e) => updateUrlInput(index, e.target.value)}
                    disabled={isParsing}
                  />
                  {urlInputs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUrlInput(index)}
                      disabled={isParsing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add URL Button */}
            {urlInputs.length < MAX_URLS && !isParsing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addUrlInput}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another URL ({urlInputs.length}/{MAX_URLS})
              </Button>
            )}

            {/* Import Progress */}
            {isParsing && importStatuses.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Importing recipes...</span>
                  <span className="text-muted-foreground">
                    {importStatuses.filter((s) => s.status === "success").length} /{" "}
                    {importStatuses.length} complete
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" />
                  Please keep this page open while importing
                </p>
                <Progress
                  value={
                    (importStatuses.filter(
                      (s) => s.status === "success" || s.status === "error"
                    ).length /
                      importStatuses.length) *
                    100
                  }
                />
                <div className="space-y-2">
                  {importStatuses.map((status, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm"
                    >
                      {status.status === "pending" && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {status.status === "processing" && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {status.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {status.status === "error" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          "truncate flex-1",
                          status.status === "error" && "text-red-500"
                        )}
                      >
                        {new URL(status.url).hostname}
                      </span>
                      {status.error && (
                        <span className="text-xs text-red-500 truncate max-w-[150px]">
                          {status.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Button */}
            <Button
              onClick={handleUrlSubmit}
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
      )}
    </div>
  );
}
