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
      className="h-full bg-white rounded-sm border-[1.5px] border-[#1A1A1A] shadow-none flex flex-col overflow-hidden animate-slide-up-fade"
      style={
        animationIndex !== undefined
          ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: "backwards" }
          : undefined
      }
    >
      {/* Image placeholder - editorial dark */}
      <div className="relative w-full h-44 overflow-hidden">
        <Skeleton className="w-full h-full bg-[#1A1A1A]" />
        {/* Floating info pill skeleton - dark rectangle */}
        <div className="absolute bottom-3 left-3 z-10">
          <Skeleton className="h-6 w-20 bg-[#2A2A2A]" />
        </div>
      </div>

      {/* Title section - with RECIPE label placeholder */}
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-3 w-12 bg-gray-100 mb-2" />
        <Skeleton className="h-6 w-4/5 bg-gray-100" />
      </div>

      {/* Type Badge + Metadata - editorial style */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <Skeleton className="h-6 w-16 bg-gray-100" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-14 bg-gray-100" />
          <Skeleton className="h-3 w-14 bg-gray-100" />
          <Skeleton className="h-3 w-10 bg-gray-100" />
        </div>
      </div>

      <CardContent className="flex flex-col flex-1 pt-0 px-4">
        {/* Key Ingredients - hidden on mobile */}
        <Skeleton className="h-3 w-full bg-gray-100 hidden md:block mb-3" />

        {/* Separator */}
        <Separator className="my-0" />

        {/* Footer buttons - sharp corners */}
        <div className="pt-3 mt-auto flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-sm bg-[#D9F99D]/30" />
          <Skeleton className="h-10 w-10 rounded-sm bg-gray-100" />
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
