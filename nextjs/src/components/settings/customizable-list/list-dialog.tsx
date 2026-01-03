"use client";

/**
 * ListDialog - Create/Edit dialog for list items
 *
 * Wrapper around shadcn Dialog that provides consistent styling
 * and save/cancel actions.
 */

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ListDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when save is clicked */
  onSave: () => void;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Dialog title */
  title: string;
  /** Form content */
  children: ReactNode;
  /** Preview content (optional, shown in right column) */
  preview?: ReactNode;
}

export function ListDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
  title,
  children,
  preview,
}: ListDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[500px]"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {preview && (
            <div className="flex justify-center pb-4 border-b">
              {preview}
            </div>
          )}
          {children}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
