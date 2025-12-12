"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BatchResult {
  message: string;
  processed: number;
  failed: number;
  skipped: number;
  total: number;
  errors?: string[];
  recipeIds?: string[];
  processedRecipes?: Array<{ id: string; title: string }>;
}

export default function BatchExtractPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [limit, setLimit] = useState(10);
  const [checkResult, setCheckResult] = useState<BatchResult | null>(null);
  const [processResult, setProcessResult] = useState<BatchResult | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const response = await fetch(`/api/admin/extract-nutrition-batch?dryRun=true&limit=${limit}`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent with the request
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to check recipes");
        return;
      }

      setCheckResult(result);
      toast.success(result.message);
    } catch (error) {
      console.error("Check failed:", error);
      toast.error("Failed to check recipes");
    } finally {
      setIsChecking(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessResult(null);
    try {
      const response = await fetch(`/api/admin/extract-nutrition-batch?limit=${limit}`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent with the request
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to process recipes");
        return;
      }

      setProcessResult(result);

      if (result.failed === 0) {
        toast.success(`Successfully processed ${result.processed} recipes!`);
      } else {
        toast.warning(`Processed ${result.processed} recipes, ${result.failed} failed`);
      }
    } catch (error) {
      console.error("Processing failed:", error);
      toast.error("Failed to process recipes");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/nutrition">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-mono font-bold">Batch Nutrition Extraction</h1>
          <p className="text-muted-foreground mt-1">
            Extract nutrition data for existing recipes in bulk
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          This tool helps you extract nutrition data for recipes that don&apos;t have it yet.
          New recipes are automatically processed, but you can use this for older recipes.
        </AlertDescription>
      </Alert>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Choose how many recipes to process at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Batch Size (max recipes per run)</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: 20 recipes per batch to avoid rate limits
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheck}
              disabled={isChecking || isProcessing}
              variant="outline"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Check Recipes
                </>
              )}
            </Button>

            <Button
              onClick={handleProcess}
              disabled={isProcessing || isChecking || (checkResult !== null && checkResult.total === 0)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extract Nutrition
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Check Results */}
      {checkResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Check Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Recipes Without Nutrition</p>
                <p className="text-2xl font-bold">{checkResult.total}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Will Process</p>
                <p className="text-2xl font-bold">{Math.min(checkResult.total, limit)}</p>
              </div>
            </div>
            {checkResult.total > 0 && (
              <p className="text-sm text-muted-foreground">
                {checkResult.total > limit
                  ? `You have ${checkResult.total} recipes without nutrition data. This run will process ${limit} of them.`
                  : `All ${checkResult.total} recipes without nutrition data will be processed.`}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Results */}
      {processResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {processResult.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-600" />
              )}
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-green-600">{processResult.processed}</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{processResult.failed}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{processResult.total}</p>
              </div>
            </div>

            {processResult.processedRecipes && processResult.processedRecipes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">Successfully Processed Recipes:</p>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {processResult.processedRecipes.map((recipe) => (
                    <div key={recipe.id} className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-900/30">
                      <p className="font-medium text-green-700 dark:text-green-400">{recipe.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{recipe.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processResult.errors && processResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Errors:</p>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {processResult.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 font-mono bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
