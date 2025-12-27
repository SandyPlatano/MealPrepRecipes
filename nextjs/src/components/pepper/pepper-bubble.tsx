"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PepperBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function PepperBubble({
  isOpen,
  onClick,
  unreadCount = 0,
}: PepperBubbleProps) {
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
            "fixed bottom-6 right-6 z-50",
            "size-14 rounded-full",
            "bg-primary text-primary-foreground",
            "border-2 border-black dark:border-white",
            "shadow-retro hover:shadow-retro-hover",
            "hover:translate-x-[2px] hover:translate-y-[2px]",
            "transition-all duration-200",
            "flex items-center justify-center",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          aria-label="Open Pepper chat assistant"
        >
          {/* Pepper emoji icon */}
          <span className="text-2xl" role="img" aria-hidden="true">
            🌶️
          </span>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -top-1 -right-1",
                "size-5 rounded-full",
                "bg-destructive text-destructive-foreground",
                "border-2 border-black dark:border-white",
                "text-xs font-bold",
                "flex items-center justify-center"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}

        </motion.button>
      )}
    </AnimatePresence>
  );
}
