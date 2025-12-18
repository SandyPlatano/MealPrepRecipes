"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import type { ProfileReview } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileReviewsProps {
  reviews: ProfileReview[];
  username: string;
}

export function ProfileReviews({ reviews, username }: ProfileReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recipe Reviews
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} written by @{username}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/app/recipes/${review.recipe_id}`}
              className="block group"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Recipe Thumbnail */}
                    {review.recipe_image_url && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={review.recipe_image_url}
                          alt={review.recipe_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Review Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Recipe Title */}
                      <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                        {review.recipe_title}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <p className="font-medium text-sm">{review.title}</p>
                      )}

                      {/* Review Content */}
                      {review.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.content}
                        </p>
                      )}

                      {/* Helpful Count */}
                      {review.helpful_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{review.helpful_count} found helpful</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
