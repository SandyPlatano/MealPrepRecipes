"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuickCartContext } from "./quick-cart-provider";

export function QuickCartHeaderIcon() {
  const { toggle, uncheckedCount } = useQuickCartContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 relative"
      aria-label={`Open quick cart${uncheckedCount > 0 ? `, ${uncheckedCount} items` : ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {uncheckedCount > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5",
            "min-w-[16px] h-4 px-1 rounded-full",
            "bg-[#D9F99D] text-[#1A1A1A]",
            "text-[10px] font-bold",
            "flex items-center justify-center"
          )}
        >
          {uncheckedCount > 99 ? "99+" : uncheckedCount}
        </span>
      )}
    </Button>
  );
}
