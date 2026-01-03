/**
 * Barcode Scanning Handlers
 *
 * Handles barcode scanning, product lookup, and adding items
 */

import { toast } from "sonner";
import type { ScannedProduct } from "../scan-result-modal";
import type { BarcodeLookupResponse } from "@/types/barcode";

export interface UseBarcodeHandlersOptions {
  onScannerClose: () => void;
  onResultOpen: () => void;
  onLookupStart: () => void;
  onLookupEnd: () => void;
  onProductScanned: (product: ScannedProduct | null) => void;
  onRefresh: () => void;
}

export function useBarcodeHandlers({
  onScannerClose,
  onResultOpen,
  onLookupStart,
  onLookupEnd,
  onProductScanned,
  onRefresh,
}: UseBarcodeHandlersOptions) {
  const handleBarcodeScanned = async (barcode: string) => {
    onScannerClose();
    onLookupStart();
    onResultOpen();

    try {
      const response = await fetch("/api/pantry/lookup-barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });

      const data: BarcodeLookupResponse = await response.json();

      if (data.found && data.product) {
        onProductScanned({
          barcode: data.product.barcode,
          name: data.product.name,
          brand: data.product.brand,
          category: data.product.category,
        });
      } else {
        // Product not found - let user enter manually
        onProductScanned({
          barcode,
          name: "",
          category: "Other",
        });
        toast.info("Product not found. Please enter the name manually.");
      }
    } catch {
      // Error during lookup - let user enter manually
      onProductScanned({
        barcode,
        name: "",
        category: "Other",
      });
      toast.error("Could not look up product. Please enter the name manually.");
    } finally {
      onLookupEnd();
    }
  };

  const handleAddScannedToList = async (name: string, category: string) => {
    try {
      const { addShoppingListItem } = await import("@/app/actions/shopping-list");
      await addShoppingListItem({
        ingredient: name,
        category,
      });
      toast.success(`Added "${name}" to shopping list`);
      onRefresh();
    } catch {
      toast.error("Failed to add item to list");
    }
  };

  const handleAddScannedToPantry = async (name: string, category: string) => {
    try {
      const { addToPantry } = await import("@/app/actions/pantry");
      await addToPantry(name, category, "barcode");
      toast.success(`Added "${name}" to pantry`);
      // Refresh to update pantry count
      onRefresh();
    } catch {
      toast.error("Failed to add item to pantry");
    }
  };

  return {
    handleBarcodeScanned,
    handleAddScannedToList,
    handleAddScannedToPantry,
  };
}
