"use client";

import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingFilterProps {
  /** Current minimum rating (null = no filter) */
  value: number | null;
  /** Callback when rating changes */
  onChange: (rating: number | null) => void;
  /** Maximum number of stars */
  maxStars?: number;
  /** Size of stars */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const gapClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

/**
 * Interactive star rating filter.
 * Click a star to set minimum rating. Click the same star again to clear.
 * Shows "and above" text when a filter is active.
 */
export function StarRatingFilter({
  value,
  onChange,
  maxStars = 5,
  size = "md",
  label = "Rating",
}: StarRatingFilterProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = useCallback(
    (rating: number) => {
      // If clicking the current value, clear the filter
      if (value === rating) {
        onChange(null);
      } else {
        onChange(rating);
      }
    },
    [value, onChange]
  );

  const handleMouseEnter = useCallback((rating: number) => {
    setHoverRating(rating);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(null);
  }, []);

  // Determine which stars should be filled
  const getStarState = (starIndex: number) => {
    const displayValue = hoverRating ?? value;
    if (displayValue === null) return "empty";
    return starIndex <= displayValue ? "filled" : "empty";
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className={cn("flex items-center", gapClasses[size])}
          onMouseLeave={handleMouseLeave}
        >
          {Array.from({ length: maxStars }, (_, i) => {
            const rating = i + 1;
            const state = getStarState(rating);

            return (
              <button
                key={rating}
                type="button"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                className={cn(
                  "transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5",
                  state === "filled"
                    ? "text-yellow-400"
                    : "text-muted-foreground/40 hover:text-yellow-300"
                )}
                aria-label={`Set minimum rating to ${rating} stars`}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "transition-all",
                    state === "filled" && "fill-current"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Status text */}
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {value !== null ? (
            <>
              {value}+ stars
              <button
                type="button"
                onClick={() => onChange(null)}
                className="ml-1.5 text-muted-foreground hover:text-foreground underline"
              >
                clear
              </button>
            </>
          ) : (
            <span className="text-muted-foreground/60">any rating</span>
          )}
        </span>
      </div>
    </div>
  );
}
