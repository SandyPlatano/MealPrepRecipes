"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

interface UndoToastOptions {
  /** Duration in ms before toast auto-dismisses (default: 5000) */
  duration?: number;
  /** Haptic feedback type on undo (default: "light") */
  hapticOnUndo?: "light" | "medium" | "heavy" | "selection" | "success" | "error";
}

/**
 * Hook for showing undo toasts with consistent behavior
 *
 * @example
 * ```tsx
 * const { showUndoToast } = useUndoToast();
 *
 * // When deleting something
 * const deletedData = { ...item };
 * await deleteItem(item.id);
 *
 * showUndoToast("Item deleted", async () => {
 *   await restoreItem(deletedData);
 * });
 * ```
 */
export function useUndoToast(options: UndoToastOptions = {}) {
  const { duration = 5000, hapticOnUndo = "light" } = options;

  // Track pending undo to prevent double-actions
  const pendingUndoRef = useRef<boolean>(false);

  const showUndoToast = useCallback(
    (message: string, onUndo: () => Promise<void> | void) => {
      pendingUndoRef.current = false;

      toast(message, {
        duration,
        action: {
          label: "Undo",
          onClick: async () => {
            // Prevent double-clicking undo
            if (pendingUndoRef.current) return;
            pendingUndoRef.current = true;

            triggerHaptic(hapticOnUndo);

            try {
              await onUndo();
              toast.success("Restored");
            } catch (error) {
              console.error("Undo failed:", error);
              toast.error("Failed to undo");
            } finally {
              pendingUndoRef.current = false;
            }
          },
        },
      });
    },
    [duration, hapticOnUndo]
  );

  return { showUndoToast };
}
