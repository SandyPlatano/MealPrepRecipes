'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Clock,
  Users,
  ChefHat,
  RefreshCw,
  Bookmark,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import type { QuickCookSuggestion } from '@/types/quick-cook';
import { QuickCookShopping } from './quick-cook-shopping';

interface QuickCookResultProps {
  suggestion: QuickCookSuggestion;
  remainingUses: number | null;
  onRegenerate: () => void;
  onSaveRecipe: (suggestion: QuickCookSuggestion) => void;
  onClose: () => void;
  isRegenerating?: boolean;
}

const DIFFICULTY_CONFIG = {
  'brain-dead-simple': {
    label: 'Brain-dead simple',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  doable: {
    label: 'Doable',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  ambitious: {
    label: 'Ambitious',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

export function QuickCookResult({
  suggestion,
  remainingUses,
  onRegenerate,
  onSaveRecipe,
  onClose,
  isRegenerating = false,
}: QuickCookResultProps) {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);

  const difficultyConfig = DIFFICULTY_CONFIG[suggestion.difficulty];
  const isNewRecipe = suggestion.recipe_id === null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* AI Reasoning - Prominent at top */}
      <div className="bg-gradient-to-r from-coral-50 to-orange-50 dark:from-coral-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-coral-200 dark:border-coral-800">
        <p className="text-sm italic text-foreground/80 leading-relaxed">
          &ldquo;{suggestion.reason}&rdquo;
        </p>
      </div>

      {/* Recipe Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Title and badges */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold leading-tight">
                {suggestion.title}
              </h2>
              {isNewRecipe && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Recipe
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestion.cuisine && (
                <Badge variant="secondary" className="text-xs">
                  {suggestion.cuisine}
                </Badge>
              )}
              {suggestion.protein_type && (
                <Badge variant="outline" className="text-xs">
                  {suggestion.protein_type}
                </Badge>
              )}
              <Badge className={`text-xs ${difficultyConfig.color}`}>
                {difficultyConfig.label}
              </Badge>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                <strong>{suggestion.total_time}</strong> min total
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4" />
              <span>
                <strong>{suggestion.active_time}</strong> min active
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>
                <strong>{suggestion.servings}</strong> servings
              </span>
            </div>
            {suggestion.estimated_cost && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>{suggestion.estimated_cost}</span>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Ingredients ({suggestion.ingredients.length})
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              {suggestion.ingredients.map((ing, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-coral-500 mt-1">•</span>
                  <span>
                    <strong>{ing.quantity}</strong> {ing.item}
                    {ing.notes && (
                      <span className="text-muted-foreground"> ({ing.notes})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions (Collapsible) */}
          <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm"
              >
                <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                  Instructions ({suggestion.instructions.length} steps)
                </span>
                {instructionsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <ol className="space-y-3 text-sm">
                {suggestion.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>

          {/* Shopping Section (Collapsible) */}
          <Collapsible open={shoppingOpen} onOpenChange={setShoppingOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Shop Ingredients
                </span>
                {shoppingOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <QuickCookShopping ingredients={suggestion.ingredients} />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRegenerate}
            disabled={isRegenerating || remainingUses === 0}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`}
            />
            {isRegenerating ? 'Finding another...' : 'Try another'}
          </Button>
          <Button
            className="flex-1 bg-coral-500 hover:bg-coral-600"
            onClick={() => onSaveRecipe(suggestion)}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </div>

        <Button variant="ghost" onClick={onClose} className="w-full">
          Done
        </Button>

        {/* Remaining uses indicator */}
        {remainingUses !== null && (
          <p className="text-xs text-center text-muted-foreground">
            {remainingUses} suggestions remaining today
            {remainingUses <= 1 && ' • Resets at midnight'}
          </p>
        )}
      </div>
    </div>
  );
}
