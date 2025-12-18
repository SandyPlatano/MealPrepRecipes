'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ChevronRight, X } from 'lucide-react';
import {
  type TimeAvailable,
  type EnergyLevel,
  type QuickCookRequest,
  TIME_OPTIONS,
  ENERGY_LEVEL_CONFIG,
} from '@/types/quick-cook';

interface QuickCookInputProps {
  onSubmit: (request: QuickCookRequest) => void;
  isLoading?: boolean;
  householdSize?: number;
}

type Step = 'time' | 'energy' | 'ingredients';

export function QuickCookInput({
  onSubmit,
  isLoading = false,
  householdSize = 2,
}: QuickCookInputProps) {
  const [step, setStep] = useState<Step>('time');
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleTimeSelect = (time: TimeAvailable) => {
    setTimeAvailable(time);
    setStep('energy');
  };

  const handleEnergySelect = (energy: EnergyLevel) => {
    setEnergyLevel(energy);
    setStep('ingredients');
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      // Split by comma if multiple
      const newIngredients = ingredientInput
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i && !ingredients.includes(i));
      setIngredients([...ingredients, ...newIngredients]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleSubmit = () => {
    if (!timeAvailable || !energyLevel) return;

    onSubmit({
      timeAvailable,
      energyLevel,
      ingredientsOnHand: ingredients.length > 0 ? ingredients : undefined,
      servings: householdSize,
    });
  };

  const handleSkipIngredients = () => {
    if (!timeAvailable || !energyLevel) return;

    onSubmit({
      timeAvailable,
      energyLevel,
      servings: householdSize,
    });
  };

  const goBack = () => {
    if (step === 'energy') setStep('time');
    if (step === 'ingredients') setStep('energy');
  };

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`h-2 w-8 rounded-full transition-colors ${
            step === 'time' ? 'bg-coral-500' : 'bg-coral-500'
          }`}
        />
        <div
          className={`h-2 w-8 rounded-full transition-colors ${
            step === 'energy' || step === 'ingredients'
              ? 'bg-coral-500'
              : 'bg-muted'
          }`}
        />
        <div
          className={`h-2 w-8 rounded-full transition-colors ${
            step === 'ingredients' ? 'bg-coral-500' : 'bg-muted'
          }`}
        />
      </div>

      {/* Step 1: Time */}
      {step === 'time' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-coral-500">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">
                Step 1 of 3
              </span>
            </div>
            <h2 className="text-2xl font-bold">How much time do you have?</h2>
            <p className="text-muted-foreground">
              Be honest. No judgment here.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
            {TIME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="lg"
                className={`h-auto py-3 sm:py-4 px-2 sm:px-4 flex flex-col items-center gap-1 ${
                  timeAvailable === option.value
                    ? 'border-coral-500 bg-coral-50 dark:bg-coral-950/20'
                    : ''
                }`}
                onClick={() => handleTimeSelect(option.value)}
              >
                <span className="text-xl sm:text-2xl font-bold">{option.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Energy Level */}
      {step === 'energy' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-coral-500">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">
                Step 2 of 3
              </span>
            </div>
            <h2 className="text-2xl font-bold">How are you feeling?</h2>
            <p className="text-muted-foreground">
              This helps me suggest something realistic.
            </p>
          </div>

          <div className="space-y-3 w-full">
            {(Object.entries(ENERGY_LEVEL_CONFIG) as [EnergyLevel, typeof ENERGY_LEVEL_CONFIG.zombie][]).map(
              ([level, config]) => (
                <Button
                  key={level}
                  variant="outline"
                  size="lg"
                  className={`w-full h-auto py-3 sm:py-4 px-3 sm:px-4 flex items-center gap-3 text-left ${
                    energyLevel === level
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-950/20'
                      : ''
                  }`}
                  onClick={() => handleEnergySelect(level)}
                >
                  <span className="text-2xl sm:text-3xl flex-shrink-0">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{config.label}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {config.description}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </Button>
              )
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="w-full"
          >
            Back
          </Button>
        </div>
      )}

      {/* Step 3: Ingredients (Optional) */}
      {step === 'ingredients' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center space-y-2">
            <span className="text-sm font-medium uppercase tracking-wide text-coral-500">
              Step 3 of 3 (Optional)
            </span>
            <h2 className="text-2xl font-bold">
              Anything you want to use up?
            </h2>
            <p className="text-muted-foreground">
              Skip this if you just want a good suggestion.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., chicken, rice, broccoli"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleAddIngredient}
                disabled={!ingredientInput.trim()}
              >
                Add
              </Button>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="text-sm py-1 px-3 flex items-center gap-1"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-coral-500 hover:bg-coral-600"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Finding something good...</span>
                </>
              ) : ingredients.length > 0 ? (
                'Find me a meal with these'
              ) : (
                'Surprise me!'
              )}
            </Button>

            {ingredients.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipIngredients}
                disabled={isLoading}
                className="w-full"
              >
                Skip this step
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={isLoading}
              className="w-full"
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
