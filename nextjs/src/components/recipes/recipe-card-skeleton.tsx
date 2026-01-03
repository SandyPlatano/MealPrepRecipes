"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface RecipeCardSkeletonProps {
  /** Animation delay index for staggered animations */
  animationIndex?: number;
}

export function RecipeCardSkeleton({ animationIndex }: RecipeCardSkeletonProps) {
  return (
    <Card
      className="h-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-slide-up-fade"
      style={
        animationIndex !== undefined
          ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: "backwards" }
          : undefined
      }
    >
      {/* Image placeholder - taller with floating pill */}
      <div className="relative w-full h-44 rounded-t-2xl overflow-hidden">
        <Skeleton className="w-full h-full bg-gradient-to-br from-[#FEF7E8] to-[#F5EFE0]" />
        {/* Floating info pill skeleton */}
        <div className="absolute bottom-3 left-3 z-10">
          <Skeleton className="h-7 w-24 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Title section - no border, larger */}
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-6 w-4/5 bg-gray-100" />
      </div>

      {/* Type Badge + Metadata - stacked layout */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16 bg-gray-100" />
          <Skeleton className="h-4 w-16 bg-gray-100" />
          <Skeleton className="h-4 w-14 bg-gray-100" />
        </div>
      </div>

      <CardContent className="flex flex-col flex-1 pt-0 px-4">
        {/* Key Ingredients - hidden on mobile */}
        <Skeleton className="h-4 w-full bg-gray-100 hidden md:block mb-3" />

        {/* Separator */}
        <Separator className="my-0" />

        {/* Footer buttons - pill shaped */}
        <div className="pt-3 mt-auto flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-full bg-gray-100" />
          <Skeleton className="h-10 w-10 rounded-full bg-gray-100" />
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
