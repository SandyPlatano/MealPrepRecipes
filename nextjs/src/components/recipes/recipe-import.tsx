"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link as LinkIcon, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RecipeForm } from "./recipe-form";
import type { RecipeFormData } from "@/types/recipe";
import { isNetworkError, getNetworkErrorMessage } from "@/lib/utils";

type ImportMode = "manual" | "paste" | "url";

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

export function RecipeImport() {
  const [mode, setMode] = useState<ImportMode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<RecipeFormData | null>(null);

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

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error("Enter a URL first");
      return;
    }

    // Validate URL
    try {
      new URL(urlInput);
    } catch {
      toast.error("That doesn't look like a valid URL");
      return;
    }

    setIsParsing(true);
    try {
      // First scrape the URL
      const scrapeResponse = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!scrapeResponse.ok) {
        // Handle network errors
        if (!scrapeResponse.body) {
          throw new Error("Network error. Please check your connection.");
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
        body: JSON.stringify({ htmlContent: html, sourceUrl: urlInput }),
      });

      if (!parseResponse.ok) {
        // Handle network errors
        if (!parseResponse.body) {
          throw new Error("Network error. Please check your connection.");
        }
        const error = await parseResponse.json().catch(() => ({
          error: "Failed to parse recipe",
        }));
        throw new Error(error.error || "Failed to parse recipe");
      }

      const parsed: ParsedRecipe = await parseResponse.json();
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
        source_url: parsed.source_url || urlInput,
        is_shared_with_household: true,
      });
      toast.success("Look at you go! Review and save.");
    } catch (error) {
      console.error("URL import error:", error);
      const errorMessage = isNetworkError(error)
        ? "Network error. Please check your internet connection and try again. You can also try pasting the recipe text instead."
        : error instanceof Error
        ? error.message
        : "Couldn't fetch that recipe. Try pasting the text instead.";
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleClearParsed = () => {
    setParsedRecipe(null);
    setPasteText("");
    setUrlInput("");
  };

  // If we have a parsed recipe, show the form for editing
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
        <RecipeForm initialData={parsedRecipe} />
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
      {mode === "manual" && <RecipeForm />}

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
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Import from URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste a recipe URL and we&apos;ll fetch and parse it for you.
              Works with most recipe websites.
            </p>
            <Input
              type="url"
              placeholder="https://www.allrecipes.com/recipe/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={isParsing || !urlInput.trim()}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching & Parsing...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Import Recipe
                </>
              )}
            </Button>
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
