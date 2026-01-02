"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check, AlertCircle, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { checkExistingIngredients } from "@/app/actions/shopping-list";

interface AddIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: string[];
  recipeTitle: string;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function AddIngredientsDialog({
  open,
  onOpenChange,
  ingredients,
  recipeTitle,
  onConfirm,
  isLoading,
}: AddIngredientsDialogProps) {
  const [existingIngredients, setExistingIngredients] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  // Check for existing items when dialog opens
  useEffect(() => {
    if (open && ingredients.length > 0) {
      setChecking(true);
      checkExistingIngredients(ingredients)
        .then((result) => {
          setExistingIngredients(result.existing || []);
        })
        .catch(() => {
          setExistingIngredients([]);
        })
        .finally(() => {
          setChecking(false);
        });
    } else {
      setExistingIngredients([]);
    }
  }, [open, ingredients]);

  const newCount = ingredients.length - existingIngredients.length;
  const existingCount = existingIngredients.length;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Add to Shopping Cart?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Add ingredients from <strong>{recipeTitle}</strong> to your
                shopping cart?
              </p>

              {checking ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Checking existing items...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Check className="size-3" />
                    {newCount} new items
                  </Badge>
                  {existingCount > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="size-3" />
                      {existingCount} already in list
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || checking || newCount === 0}
            className="bg-[#D9F99D] text-[#1A1A1A] hover:bg-[#D9F99D]/80"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="size-4 mr-2" />
                {newCount === 0 ? "All Already Added" : `Add ${newCount} Items`}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
