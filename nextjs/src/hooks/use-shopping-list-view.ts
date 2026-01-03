/**
 * Shopping List View Hook
 *
 * Orchestrates all shopping list view state and logic:
 * - Barcode scanning
 * - Recipe sources display
 * - Cook assignments
 * - Modal/dialog states
 */

import { useState } from "react";
import type { ScannedProduct } from "@/components/shopping-list/scan-result-modal";
import type { SubstitutionItem } from "@/components/shopping-list/hooks";

export interface UseShoppingListViewOptions {
  initialShowRecipeSources?: boolean;
}

export interface UseShoppingListViewState {
  // Barcode scanning
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  scannedProduct: ScannedProduct | null;
  setScannedProduct: (product: ScannedProduct | null) => void;
  isLookingUp: boolean;
  setIsLookingUp: (loading: boolean) => void;
  isScanResultOpen: boolean;
  setIsScanResultOpen: (open: boolean) => void;

  // Substitution
  substitutionItem: SubstitutionItem | null;
  setSubstitutionItem: (item: SubstitutionItem | null) => void;

  // Recipe sources
  isRecipesOpen: boolean;
  setIsRecipesOpen: (open: boolean) => void;

  // Clear all dialog
  clearAllDialogOpen: boolean;
  setClearAllDialogOpen: (open: boolean) => void;

  // Confetti
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
}

export function useShoppingListView(
  options: UseShoppingListViewOptions = {}
): UseShoppingListViewState {
  const { initialShowRecipeSources = false } = options;

  // Barcode scanning state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isScanResultOpen, setIsScanResultOpen] = useState(false);

  // Substitution state
  const [substitutionItem, setSubstitutionItem] = useState<SubstitutionItem | null>(null);

  // Recipe sources accordion
  const [isRecipesOpen, setIsRecipesOpen] = useState(initialShowRecipeSources);

  // Clear all dialog
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // Confetti celebration
  const [showConfetti, setShowConfetti] = useState(false);

  return {
    isScannerOpen,
    setIsScannerOpen,
    scannedProduct,
    setScannedProduct,
    isLookingUp,
    setIsLookingUp,
    isScanResultOpen,
    setIsScanResultOpen,
    substitutionItem,
    setSubstitutionItem,
    isRecipesOpen,
    setIsRecipesOpen,
    clearAllDialogOpen,
    setClearAllDialogOpen,
    showConfetti,
    setShowConfetti,
  };
}
