import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RecipeNutrition } from "@/types/nutrition";

interface UseRecipeNutritionProps {
  initialNutrition: RecipeNutrition | null;
  recipeId: string;
  recipeTitle: string;
  ingredients: string[];
  baseServings: number | null;
}

export interface RecipeNutritionState {
  localNutrition: RecipeNutrition | null;
  isExtractingNutrition: boolean;
  handleExtractNutrition: () => Promise<void>;
}

export function useRecipeNutrition({
  initialNutrition,
  recipeId,
  recipeTitle,
  ingredients,
  baseServings,
}: UseRecipeNutritionProps): RecipeNutritionState {
  const router = useRouter();
  const [localNutrition, setLocalNutrition] = useState<RecipeNutrition | null>(initialNutrition);
  const [isExtractingNutrition, setIsExtractingNutrition] = useState(false);

  const handleExtractNutrition = async () => {
    setIsExtractingNutrition(true);
    try {
      const response = await fetch("/api/ai/extract-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify({
          recipe_id: recipeId,
          title: recipeTitle,
          ingredients: ingredients,
          servings: baseServings || 4,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to extract nutrition");
        return;
      }

      // Update local nutrition state with extracted data
      setLocalNutrition(result.nutrition);
      toast.success("Nutrition extracted successfully!");

      // Refresh the page to update all data
      router.refresh();
    } catch (error) {
      console.error("Error extracting nutrition:", error);
      toast.error("Failed to extract nutrition");
    } finally {
      setIsExtractingNutrition(false);
    }
  };

  return {
    localNutrition,
    isExtractingNutrition,
    handleExtractNutrition,
  };
}
