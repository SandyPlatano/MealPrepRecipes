import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicRecipes, getTrendingRecipes } from "@/app/actions/community";
import { CommunityRecipeGrid } from "@/components/social/community-recipe-grid";
import { TrendingCarousel } from "@/components/social/trending-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PixelBrandLogoCompact } from "@/components/landing/pixel-art";
import { Sparkles, TrendingUp, ChefHat, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover Recipes | MealPrepRecipes",
  description:
    "Explore delicious recipes shared by our community. Find trending dishes, save your favorites, and get inspired for your next meal.",
  openGraph: {
    title: "Discover Recipes | MealPrepRecipes",
    description:
      "Explore delicious recipes shared by our community. Find trending dishes, save your favorites, and get inspired for your next meal.",
    type: "website",
  },
};

export default async function PublicDiscoverPage() {
  // Fetch initial data in parallel
  const [recipesResult, trendingResult] = await Promise.all([
    getPublicRecipes({ limit: 20 }),
    getTrendingRecipes(10),
  ]);

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <header className="border-b border-[#222222] sticky top-0 bg-[#111111]/95 backdrop-blur supports-[backdrop-filter]:bg-[#111111]/60 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PixelBrandLogoCompact variant="inline" colorMode="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90 text-white" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-[#FDFBF7]">
              <Sparkles className="h-10 w-10 text-[#F97316]" />
              Discover Community Recipes
            </h1>
            <p className="text-[#888888] mt-2 max-w-2xl mx-auto">
              Explore delicious recipes shared by home cooks around the world.
              Sign up to save your favorites and share your own creations.
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-[#1a1a1a] border border-[#F97316]/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-[#F97316]" />
              <div>
                <h2 className="font-semibold text-[#FDFBF7]">Ready to start cooking?</h2>
                <p className="text-sm text-[#888888]">
                  Join for free to save recipes and plan your meals.
                </p>
              </div>
            </div>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90 text-white" asChild>
              <Link href="/signup" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trending Section */}
          {trendingResult.data && trendingResult.data.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-[#FDFBF7]">
                <TrendingUp className="h-5 w-5 text-[#F97316]" />
                Trending Now
              </h2>
              <Suspense fallback={<TrendingCarouselSkeleton />}>
                <TrendingCarousel
                  recipes={trendingResult.data}
                  isAuthenticated={false}
                />
              </Suspense>
            </section>
          )}

          {/* All Recipes Grid */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#FDFBF7]">Browse All Recipes</h2>
            <Suspense fallback={<GridSkeleton />}>
              <CommunityRecipeGrid
                initialRecipes={recipesResult.data || []}
                isAuthenticated={false}
              />
            </Suspense>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-[#888888]">
          <p>
            &copy; {new Date().getFullYear()} MealPrepRecipes. All rights
            reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
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
          <div className="p-4 flex flex-col gap-3">
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
