"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCartBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  itemCount: number;
}

export function QuickCartBubble({
  isOpen,
  onClick,
  itemCount,
}: QuickCartBubbleProps) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className={cn(
            // Position: bottom-right, above Pepper bubble
            "fixed bottom-24 right-6 z-50",
            "size-14 rounded-full",
            "bg-[#D9F99D] text-[#1A1A1A]",
            "shadow-lg hover:shadow-xl",
            "transition-all duration-200",
            "flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            // Hide on mobile (header icon is used instead)
            "hidden md:flex"
          )}
          aria-label={`Open quick cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
        >
          <ShoppingCart className="size-6" />

          {/* Item count badge */}
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -top-1 -right-1",
                "min-w-[20px] h-5 px-1.5 rounded-full",
                "bg-[#1A1A1A] text-white",
                "text-xs font-bold",
                "flex items-center justify-center"
              )}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </motion.span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
