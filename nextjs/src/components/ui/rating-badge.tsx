"use client";

import { forwardRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number | null;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
}

export const RatingBadge = forwardRef<HTMLButtonElement, RatingBadgeProps>(
  function RatingBadge({ rating, onClick, size = "sm", className, ...props }, ref) {
    // Don't render anything if no rating
    if (rating === null || rating === undefined) {
      return null;
    }

    const sizeClasses = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
    };

    const textClasses = {
      sm: "text-xs",
      md: "text-sm",
    };

    const paddingClasses = {
      sm: "px-1.5 py-0.5",
      md: "px-2 py-1",
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-md transition-colors",
          "bg-yellow-50 dark:bg-yellow-950/50",
          "hover:bg-yellow-100 dark:hover:bg-yellow-900/50",
          "border border-yellow-200 dark:border-yellow-800",
          paddingClasses[size],
          "cursor-pointer",
          className
        )}
        {...props}
      >
        <Star
          className={cn(
            sizeClasses[size],
            "fill-yellow-400 text-yellow-400"
          )}
        />
        <span className={cn(textClasses[size], "font-medium text-yellow-700 dark:text-yellow-300")}>
          {rating}
        </span>
      </button>
    );
  }
);
