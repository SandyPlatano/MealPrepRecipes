import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublicRecipes, getTrendingRecipes } from "@/app/actions/community";
import { CommunityRecipeGrid } from "@/components/social/community-recipe-grid";
import { TrendingCarousel } from "@/components/social/trending-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover Recipes | MealPrepRecipes",
  description: "Discover and save recipes from the community",
};

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch initial data in parallel
  const [recipesResult, trendingResult] = await Promise.all([
    getPublicRecipes({ limit: 20 }),
    getTrendingRecipes(10),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Discover Recipes
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore recipes shared by the community
        </p>
      </div>

      {/* Trending Section */}
      {trendingResult.data && trendingResult.data.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Now
          </h2>
          <Suspense fallback={<TrendingCarouselSkeleton />}>
            <TrendingCarousel
              recipes={trendingResult.data}
              isAuthenticated={!!user}
            />
          </Suspense>
        </section>
      )}

      {/* All Recipes Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse All Recipes</h2>
        <Suspense fallback={<GridSkeleton />}>
          <CommunityRecipeGrid
            initialRecipes={recipesResult.data || []}
            isAuthenticated={!!user}
          />
        </Suspense>
      </section>
    </div>
  );
}

function TrendingCarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="w-64 h-48 rounded-lg shrink-0" />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
