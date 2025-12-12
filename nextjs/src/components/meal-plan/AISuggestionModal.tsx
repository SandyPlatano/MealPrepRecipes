'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { AISuggestionCard } from './AISuggestionCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateAIMealSuggestions, acceptAllSuggestions, swapSingleSuggestion } from '@/app/actions/ai-meal-suggestions';
import type { AISuggestionRecipe } from '@/types/ai-suggestion';
import { toast } from 'sonner';

interface AISuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  existingMealDays?: string[]; // Days that already have meals assigned
}

export function AISuggestionModal({
  open,
  onOpenChange,
  weekStart,
  existingMealDays = [],
}: AISuggestionModalProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionRecipe[]>([]);
  const [lockedDays, setLockedDays] = useState<Set<string>>(new Set(existingMealDays));
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [remainingRegens, setRemainingRegens] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate initial suggestions when modal opens
  useEffect(() => {
    if (open && suggestions.length === 0) {
      handleGenerate();
    }
  }, [open]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAIMealSuggestions(
        weekStart,
        Array.from(lockedDays)
      );

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setSuggestions(result.data.suggestions);
        setRemainingRegens(result.data.remaining_regenerations);
      }
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (day: string) => {
    setSwapping(day);

    try {
      const result = await swapSingleSuggestion(day, weekStart, suggestions);

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        // Replace the suggestion for this day
        setSuggestions((prev) =>
          prev.map((s) => (s.day === day ? result.data! : s))
        );
        toast.success(`Swapped ${day}'s meal!`);
      }
    } catch (err) {
      toast.error('Failed to swap meal');
    } finally {
      setSwapping(null);
    }
  };

  const handleLockToggle = (day: string) => {
    setLockedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleRegenerate = async () => {
    await handleGenerate();
    toast.success('Generated new suggestions!');
  };

  const handleAcceptAll = async () => {
    setAccepting(true);

    try {
      const result = await acceptAllSuggestions(suggestions, weekStart);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Added all meals to your plan!');
        onOpenChange(false);
      }
    } catch (err) {
      toast.error('Failed to add meals to plan');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-coral-500" />
            Your Personalized Week
          </DialogTitle>
          <DialogDescription>
            Claude has planned {suggestions.length} delicious meals based on your preferences and history.
            {remainingRegens !== null && (
              <span className="block mt-1 text-sm">
                {remainingRegens > 0
                  ? `${remainingRegens} regenerations remaining this week`
                  : 'No regenerations remaining (resets Monday)'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Sparkles className="h-12 w-12 text-coral-500 animate-pulse" />
            <p className="text-lg font-medium">Claude is planning your week...</p>
            <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
          </div>
        ) : (
          <>
            {/* Suggestions Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {suggestions.map((suggestion) => (
                <AISuggestionCard
                  key={suggestion.day}
                  suggestion={suggestion}
                  locked={lockedDays.has(suggestion.day)}
                  onLockToggle={() => handleLockToggle(suggestion.day)}
                  onSwap={() => handleSwap(suggestion.day)}
                  loading={swapping === suggestion.day}
                />
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={loading || accepting || (remainingRegens !== null && remainingRegens <= 0)}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={accepting}
                >
                  Dismiss
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  disabled={accepting || loading || suggestions.length === 0}
                >
                  {accepting ? 'Adding...' : 'Add All to Plan'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
