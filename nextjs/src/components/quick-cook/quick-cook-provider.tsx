'use client';

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { QuickCookModal, QuickCookFAB, QuickCookNavButton } from './quick-cook-modal';
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
 * Renders:
 * - The modal (available app-wide)
 * - Navigation button (in the header, desktop only)
 * - FAB (on homepage only, mobile-first)
 */
export function QuickCookProvider({
  children,
  householdSize = 2,
}: QuickCookProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const openQuickCook = useCallback(() => setIsOpen(true), []);
  const closeQuickCook = useCallback(() => setIsOpen(false), []);

  const handleSaveRecipe = async (suggestion: QuickCookSuggestion) => {
    // TODO: Implement actual save to recipes functionality
    // This would call a server action to save the recipe
    console.log('Save recipe:', suggestion.title);
  };

  // Show FAB only on the main app page (meal planner)
  const showFAB = pathname === '/app' || pathname === '/app/plan';

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

      {/* FAB - only on homepage */}
      {showFAB && <QuickCookFAB onClick={openQuickCook} />}
    </QuickCookContext.Provider>
  );
}

/**
 * Navigation trigger button for the header.
 * Use this in the app layout header.
 */
export function QuickCookHeaderTrigger() {
  const { openQuickCook } = useQuickCook();
  return <QuickCookNavButton onClick={openQuickCook} />;
}
