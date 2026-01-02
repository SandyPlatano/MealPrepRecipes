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
      className="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden animate-slide-up-fade dark:bg-slate-800 dark:border-gray-700"
      style={
        animationIndex !== undefined
          ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: "backwards" }
          : undefined
      }
    >
      {/* Image placeholder */}
      <Skeleton className="w-full h-40 rounded-t-xl" />

      {/* Title section */}
      <div className="px-4 py-4 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4 bg-gray-100 dark:bg-gray-700" />
          <Skeleton className="h-6 w-12 rounded-full bg-gray-100 dark:bg-gray-700" />
        </div>
      </div>

      {/* Badge + Metadata Row */}
      <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700" />
        <Skeleton className="h-4 w-32 bg-gray-100 dark:bg-gray-700" />
      </div>

      <CardContent className="flex flex-col flex-1 pt-0">
        {/* Key Ingredients - hidden on mobile */}
        <div className="py-3 hidden md:block">
          <Skeleton className="h-4 w-24 mb-2 bg-gray-100 dark:bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-100 dark:bg-gray-700" />
        </div>

        {/* Footer buttons */}
        <div className="pt-3 mt-auto flex items-center gap-2 md:border-t md:border-gray-200 md:dark:border-gray-700">
          <Skeleton className="h-10 flex-1 bg-gray-100 dark:bg-gray-700" />
          <Skeleton className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700" />
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
