'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { QuickCookInput } from './quick-cook-input';
import { QuickCookResult } from './quick-cook-result';
import type {
  QuickCookRequest,
  QuickCookSuggestion,
  QuickCookResponse,
} from '@/types/quick-cook';

interface QuickCookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdSize?: number;
  onSaveRecipe?: (suggestion: QuickCookSuggestion) => Promise<void>;
}

type ModalState = 'input' | 'loading' | 'result' | 'error';

export function QuickCookModal({
  open,
  onOpenChange,
  householdSize = 2,
  onSaveRecipe,
}: QuickCookModalProps) {
  const [state, setState] = useState<ModalState>('input');
  const [suggestion, setSuggestion] = useState<QuickCookSuggestion | null>(null);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [lastRequest, setLastRequest] = useState<QuickCookRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetModal = useCallback(() => {
    setState('input');
    setSuggestion(null);
    setError(null);
    setLastRequest(null);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset state when closing
        setTimeout(resetModal, 300); // After animation
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, resetModal]
  );

  const fetchSuggestion = async (request: QuickCookRequest) => {
    setState('loading');
    setLastRequest(request);
    setError(null);

    try {
      const response = await fetch('/api/ai/quick-cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestion');
      }

      const result: QuickCookResponse = data;
      setSuggestion(result.suggestion);
      setRemainingUses(result.remaining_uses);
      setState('result');
    } catch (err) {
      console.error('Quick cook error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
      toast.error(err instanceof Error ? err.message : 'Failed to get suggestion');
    }
  };

  const handleSubmit = (request: QuickCookRequest) => {
    fetchSuggestion(request);
  };

  const handleRegenerate = () => {
    if (lastRequest) {
      fetchSuggestion(lastRequest);
    }
  };

  const handleSaveRecipe = async (suggestionToSave: QuickCookSuggestion) => {
    if (onSaveRecipe) {
      try {
        await onSaveRecipe(suggestionToSave);
        toast.success('Recipe saved to your library!');
      } catch (err) {
        toast.error('Failed to save recipe');
      }
    } else {
      // Default behavior: just show success
      toast.success('Recipe saved! (Implement onSaveRecipe prop)');
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-coral-500" />
              What Should I Cook?
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2">
          {/* Input State */}
          {state === 'input' && (
            <QuickCookInput
              onSubmit={handleSubmit}
              householdSize={householdSize}
            />
          )}

          {/* Loading State */}
          {state === 'loading' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-coral-200 dark:border-coral-900" />
                <div className="absolute inset-0 rounded-full border-4 border-coral-500 border-t-transparent animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-coral-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Finding something perfect...</p>
                <p className="text-sm text-muted-foreground">
                  Matching your energy level and time
                </p>
              </div>
            </div>
          )}

          {/* Result State */}
          {state === 'result' && suggestion && (
            <QuickCookResult
              suggestion={suggestion}
              remainingUses={remainingUses}
              onRegenerate={handleRegenerate}
              onSaveRecipe={handleSaveRecipe}
              onClose={handleClose}
              isRegenerating={false}
            />
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={resetModal}>
                  Try Again
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Floating Action Button trigger for Quick Cook
 * Use this on the homepage for prominent access
 */
export function QuickCookFAB({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 h-14 px-6 rounded-full shadow-lg bg-coral-500 hover:bg-coral-600 z-50 animate-in fade-in slide-in-from-bottom-4"
    >
      <Sparkles className="h-5 w-5 mr-2" />
      What now?
    </Button>
  );
}

/**
 * Nav button trigger for Quick Cook
 * Use this in the navigation bar
 */
export function QuickCookNavButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">What now?</span>
    </Button>
  );
}
