import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { RecipeForm } from "../recipe-form";
import type { RecipeFormData } from "@/types/recipe";

interface SingleRecipeReviewProps {
  recipe: RecipeFormData;
  nutritionEnabled: boolean;
  householdId: string | null;
  onClear: () => void;
}

export function SingleRecipeReview({
  recipe,
  nutritionEnabled,
  householdId,
  onClear,
}: SingleRecipeReviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Review Header */}
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
          <Button variant="outline" onClick={onClear}>
            Start Over
          </Button>
        </div>
      </div>
      <RecipeForm
        initialData={recipe}
        nutritionEnabled={nutritionEnabled}
        householdId={householdId}
      />
    </div>
  );
}
