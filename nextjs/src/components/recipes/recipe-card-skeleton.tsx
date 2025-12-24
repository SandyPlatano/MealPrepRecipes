"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeCardSkeletonProps {
  /** Animation delay index for staggered animations */
  animationIndex?: number;
}

export function RecipeCardSkeleton({ animationIndex }: RecipeCardSkeletonProps) {
  return (
    <Card
      className="h-full flex flex-col overflow-hidden animate-slide-up-fade"
      style={
        animationIndex !== undefined
          ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: "backwards" }
          : undefined
      }
    >
      {/* Image placeholder */}
      <Skeleton className="w-full h-40 rounded-none" />

      {/* Title section */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>

      {/* Badge + Metadata Row */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <CardContent className="flex flex-col flex-1 pt-0">
        {/* Key Ingredients - hidden on mobile */}
        <div className="py-3 hidden md:block">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Footer buttons */}
        <div className="pt-3 mt-auto flex items-center gap-2 md:border-t md:border-border">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of skeleton cards for loading state
 */
export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} animationIndex={i} />
      ))}
    </div>
  );
}
