"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trash2, Cookie, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  toggleShoppingListItem,
  removeShoppingListItem,
} from "@/app/actions/shopping-list";
import { addToPantry, removeFromPantry } from "@/app/actions/pantry";
import { convertIngredientToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
import { triggerHaptic } from "@/lib/haptics";
import { type ShoppingListItem } from "@/types/shopping-list";
import { SubstitutionButton } from "./substitution-button";
import { SwipeableShoppingItem } from "./swipeable-shopping-item";

export interface ShoppingItemRowProps {
  item: ShoppingListItem & { is_in_pantry?: boolean };
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  onSubstitute: (item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  }) => void;
  userUnitSystem: UnitSystem;
  showRecipeSources: boolean;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  storeMode: boolean;
}

export const ShoppingItemRow = memo(function ShoppingItemRow({
  item,
  onPantryToggle,
  onSubstitute,
  userUnitSystem,
  showRecipeSources,
  onRemoveRecipeItems,
  storeMode,
}: ShoppingItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingPantry, setIsTogglingPantry] = useState(false);

  const handleToggle = async () => {
    triggerHaptic("selection");
    const wasChecked = item.is_checked;
    await toggleShoppingListItem(item.id);

    // Show undo toast when checking off an item (not when unchecking)
    if (!wasChecked) {
      toast(`✓ ${item.ingredient} checked off`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            triggerHaptic("light");
            await toggleShoppingListItem(item.id);
          },
        },
      });
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeShoppingListItem(item.id);
  };

  const handlePantryToggle = async () => {
    triggerHaptic("light");
    setIsTogglingPantry(true);
    try {
      if (item.is_in_pantry) {
        await removeFromPantry(item.ingredient);
        onPantryToggle(item.ingredient, false);
        toast.success("Removed from pantry");
      } else {
        await addToPantry(item.ingredient, item.category || undefined);
        onPantryToggle(item.ingredient, true);
        toast.success("Added to pantry - won't show on future lists");
      }
    } catch {
      toast.error("Failed to update pantry");
    }
    setIsTogglingPantry(false);
  };

  // Build quantity display separately for visual prominence
  const quantityPart = [item.quantity, item.unit].filter(Boolean).join(" ");
  const convertedQuantity = quantityPart
    ? convertIngredientToSystem(quantityPart, userUnitSystem)
    : null;

  return (
    <SwipeableShoppingItem
      onSwipeComplete={handleToggle}
      disabled={item.is_checked}
      isChecked={item.is_checked}
    >
      <TooltipProvider>
        <li
          className={`flex items-center group cursor-pointer hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/30 ${
            storeMode
              ? "gap-4 px-4 py-4 min-h-[72px]" // Much larger for in-store shopping
              : "gap-3 px-3 py-2.5 min-h-[52px]"
          } ${item.is_in_pantry ? "opacity-50" : ""}`}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <Checkbox
            id={item.id}
            checked={item.is_checked}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
            className={`pointer-events-auto data-[state=checked]:bg-[#D9F99D] data-[state=checked]:border-[#D9F99D] border-2 border-gray-300 dark:border-gray-600 ${
              storeMode ? "h-8 w-8" : "h-6 w-6 sm:h-5 sm:w-5"
            }`}
          />
          <span
            className={`flex-1 flex items-center gap-2 flex-wrap ${
              storeMode ? "text-base" : "text-sm"
            } ${
              item.is_checked ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {/* Quantity - prominent display */}
            {convertedQuantity && (
              <span className={`min-w-[60px] tabular-nums font-semibold ${
                storeMode ? "text-lg" : ""
              } ${item.is_checked ? "" : "text-gray-900 dark:text-gray-100"}`}>
                {convertedQuantity}
              </span>
            )}
            {/* Ingredient name */}
            <span className={`font-medium ${item.is_checked ? "" : "text-gray-800 dark:text-gray-200"}`}>
              {item.ingredient}
            </span>

            {/* Recipe Source Badge - only when toggle is ON */}
            {showRecipeSources && item.recipe_title && item.recipe_id && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.recipe_title}
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="start">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-sm h-8"
                      asChild
                    >
                      <Link href={`/app/recipes/${item.recipe_id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Recipe
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-sm h-8"
                      onClick={() => onRemoveRecipeItems(item.recipe_id!, item.recipe_title!)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove all from recipe
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Fallback for manually added items with no recipe */}
            {showRecipeSources && !item.recipe_id && (
              <Badge variant="outline" className="text-xs">
                Manual
              </Badge>
            )}


            {item.is_in_pantry && (
              <span className="text-xs text-green-600 dark:text-green-400">(in pantry)</span>
            )}
            {item.substituted_from && (
              <span className="text-xs text-blue-600 dark:text-blue-400">(was: {item.substituted_from})</span>
            )}
          </span>
          <SubstitutionButton
            onClick={() =>
              onSubstitute({
                id: item.id,
                ingredient: item.ingredient,
                quantity: item.quantity,
                unit: item.unit,
                recipe_id: item.recipe_id,
                recipe_title: item.recipe_title,
              })
            }
            disabled={item.is_checked}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 transition-opacity ${
                  item.is_in_pantry
                    ? "opacity-100 text-green-600"
                    : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePantryToggle();
                }}
                disabled={isTogglingPantry}
              >
                <Cookie className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {item.is_in_pantry
                ? "Remove from pantry"
                : "Mark as pantry staple"}
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isRemoving}
          >
            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </li>
      </TooltipProvider>
    </SwipeableShoppingItem>
  );
});
