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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { Loader2, Star } from "lucide-react";
import { rateRecipeWithNotes } from "@/app/actions/cooking-history";
import { toast } from "sonner";

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
  const [rating, setRating] = useState<number | null>(currentRating);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync rating when dialog opens with a new currentRating
  useEffect(() => {
    if (open) {
      setRating(currentRating);
    }
  }, [open, currentRating]);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const result = await rateRecipeWithNotes(
      recipeId,
      rating,
      notes || undefined
    );
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to save rating", {
        description: result.error,
      });
      return;
    }

    toast.success(`Rated ${rating} star${rating !== 1 ? "s" : ""}!`);

    // Reset form
    setNotes("");
    onOpenChange(false);

    // Notify parent to update UI
    onRated?.(rating);
  };

  const handleClose = () => {
    setRating(currentRating);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Rate This Recipe
          </DialogTitle>
          <DialogDescription>
            How would you rate <span className="font-medium">{recipeTitle}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any thoughts? e.g., too salty, kids loved it, needs more garlic..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !rating}>
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
