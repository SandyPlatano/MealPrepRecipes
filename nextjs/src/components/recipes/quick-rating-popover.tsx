"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { quickRate } from "@/app/actions/cooking-history";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

interface QuickRatingPopoverProps {
  recipeId: string;
  currentRating: number | null;
  onRated?: (rating: number) => void;
  children: React.ReactNode;
}

export function QuickRatingPopover({
  recipeId,
  currentRating,
  onRated,
  children,
}: QuickRatingPopoverProps) {
  const [open, setOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayRating = hoverRating !== null ? hoverRating : (currentRating || 0);

  const handleRate = (rating: number) => {
    triggerHaptic("light");

    startTransition(async () => {
      const result = await quickRate(recipeId, rating);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Rated ${rating} star${rating !== 1 ? "s" : ""}`);
      onRated?.(rating);
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            {currentRating ? "Update rating" : "Rate this recipe"}
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(null)}
                disabled={isPending}
                className={cn(
                  "p-1 transition-all rounded",
                  "hover:scale-110",
                  isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    value <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-none text-muted-foreground/40 hover:text-yellow-300"
                  )}
                />
              </button>
            ))}
          </div>
          {currentRating && (
            <p className="text-xs text-muted-foreground">
              Current: {currentRating} star{currentRating !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
