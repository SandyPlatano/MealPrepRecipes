'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Clock, Users, Sparkles } from 'lucide-react';
import type { AISuggestionRecipe } from '@/types/ai-suggestion';

interface AISuggestionCardProps {
  suggestion: AISuggestionRecipe;
  locked: boolean;
  onLockToggle: () => void;
  onSwap: () => void;
  loading?: boolean;
}

export function AISuggestionCard({
  suggestion,
  locked,
  onLockToggle,
  onSwap,
  loading = false,
}: AISuggestionCardProps) {
  const isNewRecipe = suggestion.recipe_id === null;

  return (
    <Card className={`${locked ? 'border-sage-500 bg-sage-50 dark:bg-sage-950/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Day and Lock */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{suggestion.day}</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={locked}
                onCheckedChange={onLockToggle}
                id={`lock-${suggestion.day}`}
              />
              <label
                htmlFor={`lock-${suggestion.day}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Lock
              </label>
            </div>
          </div>

          {/* Recipe Title */}
          <div>
            <h4 className="font-semibold text-base flex items-center gap-2">
              {suggestion.title}
              {isNewRecipe && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New Recipe!
                </Badge>
              )}
            </h4>
          </div>

          {/* Metadata */}
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
          </div>

          {/* Quick Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{suggestion.prep_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{suggestion.servings} servings</span>
            </div>
          </div>

          {/* AI Reasoning */}
          <p className="text-sm italic text-muted-foreground border-l-2 border-coral-500 pl-3">
            {suggestion.reason}
          </p>

          {/* Swap Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onSwap}
            disabled={locked || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Swapping...' : 'Swap This Meal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
