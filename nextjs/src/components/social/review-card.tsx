"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  markReviewHelpful,
  unmarkReviewHelpful,
  respondToReview,
  deleteReview,
  deleteReviewResponse,
} from "@/app/actions/reviews";
import { cn } from "@/lib/utils";
import type { Review } from "@/types/social";

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean; // Is current user the recipe owner
  isReviewAuthor?: boolean; // Is current user the review author
  isAuthenticated?: boolean;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  isOwner = false,
  isReviewAuthor = false,
  isAuthenticated = false,
  onDelete,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(review.is_helpful ?? false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState(
    review.response?.content || ""
  );
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleHelpfulToggle = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to mark reviews as helpful");
      return;
    }

    const newIsHelpful = !isHelpful;
    setIsHelpful(newIsHelpful);
    setHelpfulCount((prev) => prev + (newIsHelpful ? 1 : -1));

    startTransition(async () => {
      const result = newIsHelpful
        ? await markReviewHelpful(review.id)
        : await unmarkReviewHelpful(review.id);

      if (result.error) {
        setIsHelpful(!newIsHelpful);
        setHelpfulCount((prev) => prev + (newIsHelpful ? -1 : 1));
        toast.error(result.error);
      }
    });
  };

  const handleSubmitResponse = () => {
    if (!responseContent.trim()) {
      toast.error("Response cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await respondToReview(review.id, responseContent);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Response posted!");
        setShowResponseForm(false);
      }
    });
  };

  const handleDeleteResponse = () => {
    startTransition(async () => {
      const result = await deleteReviewResponse(review.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Response deleted");
        setResponseContent("");
      }
    });
  };

  const handleDeleteReview = async () => {
    setIsDeleting(true);
    const result = await deleteReview(review.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Review deleted");
      onDelete?.();
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${review.author.username}`}>
            <Avatar>
              <AvatarImage src={review.author.avatar_url || undefined} />
              <AvatarFallback>
                {review.author.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/u/${review.author.username}`}
              className="font-medium hover:underline"
            >
              @{review.author.username}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* Stars */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5",
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions dropdown */}
        {(isReviewAuthor || isOwner) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && !review.response && (
                <DropdownMenuItem onClick={() => setShowResponseForm(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Respond
                </DropdownMenuItem>
              )}
              {isReviewAuthor && (
                <DropdownMenuItem
                  onClick={handleDeleteReview}
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Review content */}
      {review.title && (
        <h4 className="font-semibold">{review.title}</h4>
      )}

      {review.content && (
        <p className="text-sm text-muted-foreground">{review.content}</p>
      )}

      {/* Photo */}
      {review.photo_url && (
        <div className="relative w-full max-w-xs h-48 rounded-lg overflow-hidden">
          <Image
            src={review.photo_url}
            alt="Review photo"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Helpful button */}
      <div className="flex items-center gap-4 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpfulToggle}
          disabled={isPending || isReviewAuthor}
          className={cn(
            "gap-1.5",
            isHelpful && "text-primary"
          )}
        >
          <ThumbsUp
            className={cn("h-4 w-4", isHelpful && "fill-current")}
          />
          <span>Helpful</span>
          {helpfulCount > 0 && (
            <span className="text-muted-foreground">({helpfulCount})</span>
          )}
        </Button>
      </div>

      {/* Owner Response */}
      {review.response && (
        <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">Owner Response</p>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteResponse}
                disabled={isPending}
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
              >
                Delete
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {review.response.content}
          </p>
        </div>
      )}

      {/* Response Form */}
      {showResponseForm && !review.response && (
        <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-3">
          <p className="text-sm font-medium">Your Response</p>
          <Textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Thank the reviewer or address their feedback..."
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResponseForm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitResponse}
              disabled={isPending || !responseContent.trim()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post Response"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
