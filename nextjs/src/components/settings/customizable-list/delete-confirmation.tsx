"use client";

/**
 * DeleteConfirmation - Reusable delete confirmation dialog
 *
 * Standard AlertDialog pattern for confirming destructive actions.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Whether a delete operation is in progress */
  isSaving: boolean;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
  title,
  description,
}: DeleteConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSaving}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSaving ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
