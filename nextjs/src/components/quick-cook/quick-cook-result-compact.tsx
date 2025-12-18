'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Users,
  RefreshCw,
  Bookmark,
  Sparkles,
  UtensilsCrossed,
  ListOrdered,
} from 'lucide-react';
import type { QuickCookSuggestion } from '@/types/quick-cook';

interface QuickCookResultCompactProps {
  suggestion: QuickCookSuggestion;
  remainingUses: number | null;
  onRegenerate: () => void;
  onSaveRecipe: (suggestion: QuickCookSuggestion) => void;
  onClose: () => void;
  isRegenerating?: boolean;
}

const DIFFICULTY_CONFIG = {
  'brain-dead-simple': {
    label: 'Simple',
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

export function QuickCookResultCompact({
  suggestion,
  remainingUses,
  onRegenerate,
  onSaveRecipe,
  onClose,
  isRegenerating = false,
}: QuickCookResultCompactProps) {
  const difficultyConfig = DIFFICULTY_CONFIG[suggestion.difficulty];
  const isNewRecipe = suggestion.recipe_id === null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* AI Reasoning - Compact */}
      <div className="bg-gradient-to-r from-coral-50 to-orange-50 dark:from-coral-950/30 dark:to-orange-950/30 rounded-lg p-3 border border-coral-200 dark:border-coral-800">
        <p className="text-sm italic text-foreground/80 line-clamp-2">
          &ldquo;{suggestion.reason}&rdquo;
        </p>
      </div>

      {/* Recipe Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold leading-tight line-clamp-2">
            {suggestion.title}
          </h2>
          {isNewRecipe && (
            <Badge variant="outline" className="shrink-0 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>

        {/* Badges row */}
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

      {/* Quick Stats - Compact grid */}
      <div className="grid grid-cols-4 gap-2 py-3 border-y border-border">
        <div className="flex flex-col items-center text-center">
          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-sm font-semibold">{suggestion.total_time}</span>
          <span className="text-[10px] text-muted-foreground">min</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-sm font-semibold">{suggestion.ingredients.length}</span>
          <span className="text-[10px] text-muted-foreground">items</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <ListOrdered className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-sm font-semibold">{suggestion.instructions.length}</span>
          <span className="text-[10px] text-muted-foreground">steps</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Users className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-sm font-semibold">{suggestion.servings}</span>
          <span className="text-[10px] text-muted-foreground">servings</span>
        </div>
      </div>

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
            {isRegenerating ? 'Finding...' : 'Try another'}
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
            {remainingUses <= 1 && ' \u2022 Resets at midnight'}
          </p>
        )}
      </div>
    </div>
  );
}
