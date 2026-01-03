import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle2, X } from "lucide-react";
import { RecipeForm } from "../recipe-form";
import type { RecipeFormData } from "@/types/recipe";
import { cn } from "@/lib/utils";

interface MultiRecipeReviewProps {
  recipes: RecipeFormData[];
  currentIndex: number;
  nutritionEnabled: boolean;
  householdId: string | null;
  isCreatingAll: boolean;
  createAllProgress: number;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
  onRecipeSaved: () => void;
  onRemoveFromQueue: (index: number) => void;
  onCreateAll: () => void;
  onIndexChange: (index: number) => void;
}

export function MultiRecipeReview({
  recipes,
  currentIndex,
  nutritionEnabled,
  householdId,
  isCreatingAll,
  createAllProgress,
  onNext,
  onPrev,
  onClear,
  onRecipeSaved,
  onRemoveFromQueue,
  onCreateAll,
  onIndexChange,
}: MultiRecipeReviewProps) {
  const currentRecipe = recipes[currentIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Multi-Recipe Review Header */}
      <div className="bg-accent/50 border border-accent rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Review Recipe {currentIndex + 1} of {recipes.length}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentRecipe.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {recipes.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  disabled={currentIndex === 0 || isCreatingAll}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={currentIndex === recipes.length - 1 || isCreatingAll}
                >
                  Next
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClear} disabled={isCreatingAll}>
              Start Over
            </Button>
          </div>
        </div>

        {/* Recipe Progress Pills with Remove buttons */}
        {recipes.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipes.map((recipe, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-xs font-medium transition-colors",
                  idx === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <button
                  type="button"
                  onClick={() => onIndexChange(idx)}
                  disabled={isCreatingAll}
                  className="truncate max-w-[150px]"
                >
                  {recipe.title?.substring(0, 20) || `Recipe ${idx + 1}`}
                  {(recipe.title?.length || 0) > 20 && "..."}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(idx);
                  }}
                  disabled={isCreatingAll}
                  className={cn(
                    "p-0.5 rounded-full transition-colors",
                    idx === currentIndex
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-muted-foreground/20"
                  )}
                  title="Remove from queue"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create All Button */}
        {recipes.length > 1 && (
          <div className="mt-4 pt-4 border-t border-accent">
            {isCreatingAll ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating all recipes...
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(createAllProgress)}%
                  </span>
                </div>
                <Progress value={createAllProgress} />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" />
                  Please keep this page open
                </p>
              </div>
            ) : (
              <Button
                onClick={onCreateAll}
                className="w-full"
                variant="secondary"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create All {recipes.length} Recipes
              </Button>
            )}
          </div>
        )}
      </div>

      <RecipeForm
        key={currentIndex}
        initialData={currentRecipe}
        nutritionEnabled={nutritionEnabled}
        householdId={householdId}
        onSaveSuccess={onRecipeSaved}
      />
    </div>
  );
}
