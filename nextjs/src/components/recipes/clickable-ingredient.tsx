"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addSingleIngredientFromRecipe } from "@/app/actions/shopping-list";
import { toast } from "sonner";

interface ClickableIngredientProps {
  ingredient: string;
  recipeId: string;
  recipeTitle: string;
  children: React.ReactNode;
}

export function ClickableIngredient({
  ingredient,
  recipeId,
  recipeTitle,
  children,
}: ClickableIngredientProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || isAdded) return;

    setIsAdding(true);
    try {
      const result = await addSingleIngredientFromRecipe(
        ingredient,
        recipeId,
        recipeTitle
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsAdded(true);
        toast.success("Added to cart", {
          description: ingredient,
        });

        // Reset after a few seconds
        setTimeout(() => setIsAdded(false), 3000);
      }
    } catch {
      toast.error("Failed to add item");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex-1">{children}</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        disabled={isAdding}
        className={cn(
          "h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
          "focus:opacity-100",
          isAdded && "opacity-100 text-green-600 hover:text-green-600"
        )}
        aria-label={isAdded ? "Added to cart" : "Add to cart"}
      >
        {isAdding ? (
          <Loader2 className="size-3 animate-spin" />
        ) : isAdded ? (
          <Check className="size-3" />
        ) : (
          <Plus className="size-3" />
        )}
      </Button>
    </div>
  );
}
