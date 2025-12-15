"use client";

import { useState } from "react";
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
import { Loader2, ChefHat, CheckCircle2 } from "lucide-react";
import { markAsCooked } from "@/app/actions/recipes";
import { toast } from "sonner";

interface MarkCookedDialogProps {
  recipeId: string;
  recipeTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkCookedDialog({
  recipeId,
  recipeTitle,
  open,
  onOpenChange,
  onSuccess,
}: MarkCookedDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [modifications, setModifications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await markAsCooked(
      recipeId,
      rating || undefined,
      notes || undefined,
      modifications || undefined
    );
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to save", {
        description: result.error,
      });
      return;
    }

    // Success! Show confirmation toast
    toast.success("Logged as cooked! 🎉", {
      description: `${recipeTitle} has been added to your cooking history.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });

    // Reset form
    setRating(null);
    setNotes("");
    setModifications("");
    onOpenChange(false);

    // Notify parent to refresh data
    onSuccess?.();
  };

  const handleClose = () => {
    setRating(null);
    setNotes("");
    setModifications("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Nice work, chef!
          </DialogTitle>
          <DialogDescription>
            You made <span className="font-medium">{recipeTitle}</span>. How did
            it go?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rate this cook (optional)</Label>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modifications">What did you change? (optional)</Label>
            <Textarea
              id="modifications"
              placeholder="e.g., Added extra garlic, reduced salt, used coconut milk instead of cream..."
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did it taste? Any tips for next time?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
