"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { getRecipeReviews } from "@/app/actions/reviews";
import type { Review } from "@/types/social";

interface ReviewListProps {
  recipeId: string;
  recipeOwnerId: string;
  currentUserId?: string;
  avgRating?: number | null;
  reviewCount?: number;
  isPublic?: boolean;
}

export function ReviewList({
  recipeId,
  recipeOwnerId,
  currentUserId,
  avgRating,
  reviewCount = 0,
  isPublic = false,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);

  const LIMIT = 10;

  const loadReviews = useCallback(
    async (reset = false) => {
      if (reset) {
        setIsLoading(true);
      }

      const result = await getRecipeReviews(recipeId, {
        limit: LIMIT,
        offset: reset ? 0 : offset,
      });

      if (result.data) {
        if (reset) {
          setReviews(result.data);
          setOffset(result.data.length);
          // Check if current user already has a review
          if (currentUserId) {
            setHasUserReview(result.data.some((r) => r.user_id === currentUserId));
          }
        } else {
          setReviews((prev) => [...prev, ...result.data!]);
          setOffset((prev) => prev + result.data!.length);
        }
        setHasMore(result.data.length === LIMIT);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    },
    [recipeId, offset, currentUserId]
  );

  useEffect(() => {
    loadReviews(true);
  }, [recipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadReviews(false);
  };

  const handleReviewSuccess = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    setHasUserReview(true);
    setShowReviewForm(false);
  };

  const handleReviewDelete = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (currentUserId && reviews.find((r) => r.id === reviewId)?.user_id === currentUserId) {
      setHasUserReview(false);
    }
  };

  const isOwner = currentUserId === recipeOwnerId;
  const canReview =
    isPublic &&
    currentUserId &&
    !isOwner &&
    !hasUserReview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </h3>
          {avgRating && reviewCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {canReview && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && canReview && (
        <div className="border rounded-lg p-4">
          <ReviewForm
            recipeId={recipeId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* No reviews state */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No reviews yet</p>
          {canReview && (
            <p className="text-sm mt-1">Be the first to share your experience!</p>
          )}
          {!isPublic && (
            <p className="text-sm mt-1">Reviews are available for public recipes only.</p>
          )}
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={isOwner}
              isReviewAuthor={review.user_id === currentUserId}
              isAuthenticated={!!currentUserId}
              onDelete={() => handleReviewDelete(review.id)}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && reviews.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Reviews"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
