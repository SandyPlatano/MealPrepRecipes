"use client";

import { Star } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  allowHalfStars?: boolean;
}

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const gapClasses = {
  xs: "gap-0",
  sm: "gap-0.5",
  md: "gap-0.5",
  lg: "gap-1",
};

const paddingClasses = {
  xs: "p-0",
  sm: "p-0.5",
  md: "p-0.5",
  lg: "p-0.5",
};

type FillState = "empty" | "half" | "full";

function getStarFillState(starIndex: number, displayValue: number): FillState {
  if (displayValue >= starIndex) {
    return "full";
  } else if (displayValue >= starIndex - 0.5) {
    return "half";
  }
  return "empty";
}

function getClipPath(fillState: FillState): string {
  switch (fillState) {
    case "full":
      return "none";
    case "half":
      return "inset(0 50% 0 0)";
    case "empty":
      return "inset(0 100% 0 0)";
  }
}

export function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "md",
  showLabel = false,
  allowHalfStars = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const displayRating = hoverRating !== null ? hoverRating : (rating || 0);

  const handleClick = (e: React.MouseEvent, starIndex: number) => {
    if (readonly || !onChange) return;

    if (allowHalfStars) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;
      const value = isLeftHalf ? starIndex - 0.5 : starIndex;
      onChange(value);
    } else {
      onChange(starIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
    if (readonly) return;

    if (allowHalfStars) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;
      const value = isLeftHalf ? starIndex - 0.5 : starIndex;
      setHoverRating(value);
    } else {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className={cn("flex", gapClasses[size])}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillState = getStarFillState(starIndex, displayRating);

          return (
            <button
              key={starIndex}
              ref={(el) => { starRefs.current[starIndex - 1] = el; }}
              type="button"
              onClick={(e) => handleClick(e, starIndex)}
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                paddingClasses[size],
                "transition-transform relative",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default"
              )}
            >
              {/* Background: empty star outline */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-none text-muted-foreground/40"
                )}
              />
              {/* Foreground: filled star with clip-path */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 fill-yellow-400 text-yellow-400 transition-all",
                  size === "xs" && "inset-0",
                  size === "sm" && "inset-0.5",
                  size === "md" && "inset-0.5",
                  size === "lg" && "inset-0.5"
                )}
                style={{ clipPath: getClipPath(fillState) }}
              />
            </button>
          );
        })}
      </div>
      {showLabel && rating !== null && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
