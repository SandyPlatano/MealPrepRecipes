"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";
import type { Review } from "@/types/social";

interface ReviewFormProps {
  recipeId: string;
  onSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

export function ReviewForm({ recipeId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const result = await createReview(recipeId, {
      rating,
      title: title || undefined,
      content: content || undefined,
    });
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.data) {
      toast.success("Review submitted!");
      setRating(0);
      setTitle("");
      setContent("");
      onSuccess?.(result.data);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="review-title">
          Title <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      {/* Content (optional) */}
      <div className="space-y-2">
        <Label htmlFor="review-content">
          Review <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience making this recipe..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/1000
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
}
