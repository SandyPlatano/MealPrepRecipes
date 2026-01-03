"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, ShoppingCart, Leaf, RefreshCw } from "lucide-react";
import { UnitSystemToggle } from "@/components/recipes/unit-system-toggle";
import { AddIngredientsDialog } from "@/components/recipes/add-ingredients-dialog";
import { ClickableIngredient } from "@/components/recipes/clickable-ingredient";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import type { Substitution } from "@/lib/substitutions";

interface RecipeDetailIngredientsProps {
  recipeId: string;
  recipeTitle: string;
  ingredients: string[];
  displayIngredients: string[];
  baseServings: number | null;
  currentServings: number;
  servingsInputValue: string;
  canScale: boolean;
  effectiveUnitSystem: UnitSystem;
  checkedIngredients: Set<number>;
  substitutions: Map<string, Substitution[]>;
  showAddIngredientsDialog: boolean;
  isAddingIngredients: boolean;
  onToggleIngredientCheck: (index: number) => void;
  onSetServingsPreset: (multiplier: number) => void;
  onServingsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onServingsInputBlur: () => void;
  onSetLocalUnitSystem: (system: UnitSystem | null) => void;
  onShowAddIngredientsDialog: (show: boolean) => void;
  onAddAllIngredients: () => Promise<void>;
}

export function RecipeDetailIngredients({
  recipeId,
  recipeTitle,
  ingredients,
  displayIngredients,
  baseServings,
  currentServings,
  servingsInputValue,
  canScale,
  effectiveUnitSystem,
  checkedIngredients,
  substitutions,
  showAddIngredientsDialog,
  isAddingIngredients,
  onToggleIngredientCheck,
  onSetServingsPreset,
  onServingsInputChange,
  onServingsInputBlur,
  onSetLocalUnitSystem,
  onShowAddIngredientsDialog,
  onAddAllIngredients,
}: RecipeDetailIngredientsProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Title Row with visual hierarchy */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white whitespace-nowrap">Ingredients</h3>
          <Badge className="bg-[#D9F99D]/20 text-[#1A1A1A] dark:text-white border-0 text-xs">
            {ingredients.length} items
          </Badge>
          <Separator className="flex-1 hidden sm:block" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowAddIngredientsDialog(true)}
          className="gap-2 rounded-full"
        >
          <ShoppingCart className="size-4" />
          Add All
        </Button>
      </div>

      {/* Unit toggle for non-scalable recipes */}
      {!canScale && (
        <UnitSystemToggle
          defaultSystem={effectiveUnitSystem}
          onSystemChange={onSetLocalUnitSystem}
        />
      )}

      {/* Serving Controls Row */}
      {canScale && (
        <div className="bg-[#F5F5F0] dark:bg-slate-700/50 rounded-2xl p-4 space-y-4">
          {/* Quick presets - pill buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetServingsPreset(0.5)}
              className={`rounded-full px-4 transition-all ${
                currentServings === Math.round((baseServings || 1) * 0.5)
                  ? "bg-[#D9F99D] text-[#1A1A1A] border-[#D9F99D] hover:bg-[#D9F99D]/90"
                  : "bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500"
              }`}
            >
              Half
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetServingsPreset(1)}
              className={`rounded-full px-4 transition-all ${
                currentServings === baseServings
                  ? "bg-[#D9F99D] text-[#1A1A1A] border-[#D9F99D] hover:bg-[#D9F99D]/90"
                  : "bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500"
              }`}
            >
              Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetServingsPreset(2)}
              className={`rounded-full px-4 transition-all ${
                currentServings === Math.round((baseServings || 1) * 2)
                  ? "bg-[#D9F99D] text-[#1A1A1A] border-[#D9F99D] hover:bg-[#D9F99D]/90"
                  : "bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500"
              }`}
            >
              Double
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetServingsPreset(4)}
              className={`rounded-full px-4 transition-all ${
                currentServings === Math.round((baseServings || 1) * 4)
                  ? "bg-[#D9F99D] text-[#1A1A1A] border-[#D9F99D] hover:bg-[#D9F99D]/90"
                  : "bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500"
              }`}
            >
              Family (4x)
            </Button>
          </div>
          {/* Serving size input row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-600 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-500 shadow-sm">
              <Users className="size-4 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                max={99}
                value={servingsInputValue}
                onChange={onServingsInputChange}
                onBlur={onServingsInputBlur}
                className="h-7 w-14 text-center font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-muted-foreground">servings</span>
            </div>
            <UnitSystemToggle
              defaultSystem={effectiveUnitSystem}
              onSystemChange={onSetLocalUnitSystem}
            />
          </div>
        </div>
      )}

      {canScale && currentServings !== baseServings && (
        <p className="text-xs text-muted-foreground italic">
          Scaled from {baseServings} serving
          {baseServings !== 1 ? "s" : ""}
        </p>
      )}

      {/* Ingredient Progress */}
      {checkedIngredients.size > 0 && (
        <div className="flex items-center gap-3 bg-[#D9F99D]/10 rounded-lg px-3 py-2">
          <Progress
            value={(checkedIngredients.size / displayIngredients.length) * 100}
            className="h-2 flex-1"
          />
          <span className="text-sm font-medium text-[#1A1A1A] dark:text-white whitespace-nowrap">
            {checkedIngredients.size}/{displayIngredients.length} gathered
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {displayIngredients.map((ingredient, index) => {
          const ingredientSubs = substitutions.get(ingredients[index] || ingredient);
          const hasSubstitutes = ingredientSubs && ingredientSubs.length > 0;
          const isChecked = checkedIngredients.has(index);

          return (
            <li
              key={index}
              className={`flex items-start gap-3 group text-base transition-all ${
                isChecked ? "opacity-60" : ""
              }`}
            >
              <Checkbox
                id={`ingredient-${index}`}
                checked={isChecked}
                onCheckedChange={() => onToggleIngredientCheck(index)}
                className="mt-1 size-5 rounded border-2 border-[#D9F99D] data-[state=checked]:bg-[#D9F99D] data-[state=checked]:text-[#1A1A1A]"
              />
              <div className={`flex-1 flex items-center gap-2 ${isChecked ? "line-through decoration-[#D9F99D]/50" : ""}`}>
                {hasSubstitutes ? (
                  <HoverCard openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        <ClickableIngredient
                          ingredient={ingredients[index] || ingredient}
                          recipeId={recipeId}
                          recipeTitle={recipeTitle}
                        >
                          <span className="border-b border-dashed border-muted-foreground/40 hover:border-primary transition-colors">
                            {ingredient}
                          </span>
                        </ClickableIngredient>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72" align="start" side="right">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-[#D9F99D]/30 flex items-center justify-center">
                            <Leaf className="size-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Substitutions Available</p>
                            <p className="text-xs text-muted-foreground">{ingredientSubs.length} option{ingredientSubs.length > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {ingredientSubs.slice(0, 2).map((sub, subIndex) => (
                            <div key={subIndex} className="flex items-start gap-2 text-sm">
                              <RefreshCw className="size-3 mt-1 text-muted-foreground flex-shrink-0" />
                              <div>
                                <span className="font-medium">{sub.substitute_ingredient}</span>
                                {sub.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{sub.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {ingredientSubs.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-5">
                              +{ingredientSubs.length - 2} more options
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground italic border-t pt-2">
                          Click &quot;Swap&quot; for details
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <ClickableIngredient
                    ingredient={ingredients[index] || ingredient}
                    recipeId={recipeId}
                    recipeTitle={recipeTitle}
                  >
                    <span>{ingredient}</span>
                  </ClickableIngredient>
                )}
                {hasSubstitutes && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Swap
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Substitutions for {ingredients[index]}:</p>
                        <ul className="flex flex-col gap-1.5">
                          {ingredientSubs.map((sub, subIndex) => (
                            <li key={subIndex} className="text-sm">
                              <div className="font-medium">{sub.substitute_ingredient}</div>
                              {sub.notes && (
                                <div className="text-xs text-muted-foreground">{sub.notes}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Add All Ingredients Dialog */}
      <AddIngredientsDialog
        open={showAddIngredientsDialog}
        onOpenChange={onShowAddIngredientsDialog}
        ingredients={ingredients}
        recipeTitle={recipeTitle}
        onConfirm={onAddAllIngredients}
        isLoading={isAddingIngredients}
      />
    </div>
  );
}
