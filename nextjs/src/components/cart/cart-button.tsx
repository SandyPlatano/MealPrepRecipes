"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { CartSheet } from "./cart-sheet";

export function CartButton() {
  const { getCartCount, isOpen, setIsOpen } = useCart();
  const count = getCartCount();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {count}
          </span>
        )}
      </Button>
      <CartSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
