"use client";

import Link from "next/link";
import { X, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QuickCartInput } from "./quick-cart-input";
import { QuickCartItem } from "./quick-cart-item";
import type { ShoppingListItem } from "@/types/shopping-list";
import { groupItemsByCategory, sortCategories } from "@/types/shopping-list";

interface QuickCartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  isLoading: boolean;
  onToggleItem: (id: string) => void;
  onAddItem: (text: string) => void;
  checkedCount: number;
}

export function QuickCartPanel({
  isOpen,
  onClose,
  items,
  isLoading,
  onToggleItem,
  onAddItem,
  checkedCount,
}: QuickCartPanelProps) {
  // Group by category
  const grouped = groupItemsByCategory(items);
  const sortedCategories = sortCategories(Object.keys(grouped));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        hideCloseButton
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b bg-[#D9F99D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-[#1A1A1A]" />
              <SheetTitle className="text-lg font-bold text-[#1A1A1A]">
                Shopping Cart
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 text-[#1A1A1A] hover:bg-black/10"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-sm text-[#1A1A1A]/70">
            {items.length} items ({checkedCount} checked)
          </p>
        </SheetHeader>

        {/* Add Item Input */}
        <div className="px-4 py-3 border-b">
          <QuickCartInput onAdd={onAddItem} disabled={isLoading} />
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="size-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items above or from recipes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {grouped[category].map((item) => (
                      <QuickCartItem
                        key={item.id}
                        item={item}
                        onToggle={() => onToggleItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/shop" onClick={onClose}>
              <ExternalLink className="size-4 mr-2" />
              View Full Shopping List
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
