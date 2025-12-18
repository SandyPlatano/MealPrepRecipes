"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";
import { rateRecipeWithNotes } from "@/app/actions/cooking-history";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PersonalRatingDialogProps {
  recipeId: string;
  recipeTitle: string;
  currentRating: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRated?: (rating: number) => void;
}

export function PersonalRatingDialog({
  recipeId,
  recipeTitle,
  currentRating,
  open,
  onOpenChange,
  onRated,
}: PersonalRatingDialogProps) {
  const [rating, setRating] = useState<number>(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync rating when dialog opens with a new currentRating
  useEffect(() => {
    if (open) {
      setRating(currentRating || 0);
    }
  }, [open, currentRating]);

  const displayRating = hoverRating || rating;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    // Combine title and review into notes
    const notes = [title, review].filter(Boolean).join("\n\n") || undefined;

    setIsSubmitting(true);
    const result = await rateRecipeWithNotes(recipeId, rating, notes);
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to save rating", {
        description: result.error,
      });
      return;
    }

    toast.success(`Rated ${rating} star${rating !== 1 ? "s" : ""}!`);

    // Reset form
    setTitle("");
    setReview("");
    onOpenChange(false);

    // Notify parent to update UI
    onRated?.(rating);
  };

  const handleClose = () => {
    setRating(currentRating || 0);
    setHoverRating(0);
    setTitle("");
    setReview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Rate This Recipe
          </DialogTitle>
          <DialogDescription>
            How would you rate <span className="font-medium">{recipeTitle}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Title (optional) */}
          <div className="space-y-2">
            <Label htmlFor="rating-title">
              Title <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="rating-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Review (optional) */}
          <div className="space-y-2">
            <Label htmlFor="rating-review">
              Review <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="rating-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts... too salty? Kids loved it? Tips for next time?"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
