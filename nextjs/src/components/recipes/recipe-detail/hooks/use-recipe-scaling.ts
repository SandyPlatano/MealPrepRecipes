import { useState } from "react";
import { scaleIngredients, convertIngredientsToSystem, type UnitSystem } from "@/lib/ingredient-scaler";

const MAX_SERVINGS = 99;

interface UseRecipeScalingProps {
  ingredients: string[];
  baseServings: number | null;
  userUnitSystem: UnitSystem;
}

export interface RecipeScalingState {
  currentServings: number;
  servingsInputValue: string;
  canScale: boolean;
  scaledIngredients: string[];
  localUnitSystem: UnitSystem | null;
  effectiveUnitSystem: UnitSystem;
  displayIngredients: string[];
  setServingsPreset: (multiplier: number) => void;
  handleServingsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleServingsInputBlur: () => void;
  setLocalUnitSystem: (system: UnitSystem | null) => void;
}

export function useRecipeScaling({
  ingredients,
  baseServings,
  userUnitSystem,
}: UseRecipeScalingProps): RecipeScalingState {
  const [currentServings, setCurrentServings] = useState(baseServings || 1);
  const [servingsInputValue, setServingsInputValue] = useState(String(baseServings || 1));
  const [localUnitSystem, setLocalUnitSystem] = useState<UnitSystem | null>(null);

  const canScale = baseServings !== null && baseServings > 0;
  const scaledIngredients = canScale
    ? scaleIngredients(ingredients, baseServings!, currentServings)
    : ingredients;

  const effectiveUnitSystem = localUnitSystem ?? userUnitSystem;
  const displayIngredients = convertIngredientsToSystem(scaledIngredients, effectiveUnitSystem);

  const setServingsPreset = (multiplier: number) => {
    if (baseServings) {
      const newServings = Math.min(MAX_SERVINGS, Math.round(baseServings * multiplier));
      setCurrentServings(newServings);
      setServingsInputValue(String(newServings));
    }
  };

  const handleServingsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for typing
    if (value === "") {
      setServingsInputValue("");
      return;
    }

    // Only allow digits
    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    // Block values over 99
    if (numValue > MAX_SERVINGS) {
      setServingsInputValue(String(MAX_SERVINGS));
      setCurrentServings(MAX_SERVINGS);
      return;
    }

    // Block zero - minimum is 1
    if (numValue === 0) {
      setServingsInputValue("0"); // Allow typing but don't update scaling
      return;
    }

    setServingsInputValue(value);
    setCurrentServings(numValue);
  };

  const handleServingsInputBlur = () => {
    const numValue = parseInt(servingsInputValue, 10);

    // If empty or invalid, revert to base_servings
    if (servingsInputValue === "" || isNaN(numValue) || numValue < 1) {
      const fallback = baseServings || 1;
      setServingsInputValue(String(fallback));
      setCurrentServings(fallback);
      return;
    }

    // Clamp to valid range
    const clampedValue = Math.min(MAX_SERVINGS, Math.max(1, numValue));
    setServingsInputValue(String(clampedValue));
    setCurrentServings(clampedValue);
  };

  return {
    currentServings,
    servingsInputValue,
    canScale,
    scaledIngredients,
    localUnitSystem,
    effectiveUnitSystem,
    displayIngredients,
    setServingsPreset,
    handleServingsInputChange,
    handleServingsInputBlur,
    setLocalUnitSystem,
  };
}
