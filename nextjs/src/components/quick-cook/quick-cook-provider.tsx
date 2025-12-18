'use client';

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { QuickCookModal } from './quick-cook-modal';
import { saveQuickCookRecipe } from '@/app/actions/recipes';
import type { QuickCookSuggestion } from '@/types/quick-cook';

interface QuickCookContextValue {
  openQuickCook: () => void;
  closeQuickCook: () => void;
  isOpen: boolean;
}

const QuickCookContext = createContext<QuickCookContextValue | null>(null);

export function useQuickCook() {
  const context = useContext(QuickCookContext);
  if (!context) {
    throw new Error('useQuickCook must be used within QuickCookProvider');
  }
  return context;
}

interface QuickCookProviderProps {
  children: ReactNode;
  householdSize?: number;
}

/**
 * Provider component that manages Quick Cook modal state.
 * The modal is available app-wide and triggered from the Discovery page.
 */
export function QuickCookProvider({
  children,
  householdSize = 2,
}: QuickCookProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuickCook = useCallback(() => setIsOpen(true), []);
  const closeQuickCook = useCallback(() => setIsOpen(false), []);

  const handleSaveRecipe = async (suggestion: QuickCookSuggestion) => {
    const result = await saveQuickCookRecipe(suggestion);
    if (result.error) {
      throw new Error(result.error);
    }
    closeQuickCook();
  };

  return (
    <QuickCookContext.Provider value={{ openQuickCook, closeQuickCook, isOpen }}>
      {children}

      {/* Quick Cook Modal - rendered at provider level so it's always available */}
      <QuickCookModal
        open={isOpen}
        onOpenChange={setIsOpen}
        householdSize={householdSize}
        onSaveRecipe={handleSaveRecipe}
      />
    </QuickCookContext.Provider>
  );
}

