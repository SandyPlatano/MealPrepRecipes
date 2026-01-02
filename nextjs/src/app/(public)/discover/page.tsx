import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicRecipes, getTrendingRecipes } from "@/app/actions/community";
import { CommunityRecipeGrid } from "@/components/social/community-recipe-grid";
import { TrendingCarousel } from "@/components/social/trending-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
  const [recipesResult, trendingResult] = await Promise.all([
    getPublicRecipes({ limit: 20 }),
    getTrendingRecipes(10),
  ]);

  return (
    <div className="min-h-screen bg-[#FFFCF6]">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-[#FFFCF6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFCF6]/60 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center">
              <span className="text-[#1A1A1A] font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl text-[#1A1A1A]">
              babewfd<span className="text-[#D9F99D]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-[#1A1A1A]">
              <Sparkles className="h-10 w-10 text-[#D9F99D]" />
              Discover Community Recipes
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Explore delicious recipes shared by home cooks around the world.
              Sign up to save your favorites and share your own creations.
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D9F99D] rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-[#1A1A1A]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1A1A]">Ready to start cooking?</h2>
                <p className="text-sm text-gray-500">
                  Join for free to save recipes and plan your meals.
                </p>
              </div>
            </div>
            <Button className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full" asChild>
              <Link href="/signup" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trending Section */}
          {trendingResult.data && trendingResult.data.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-[#1A1A1A]">
                <TrendingUp className="h-5 w-5 text-green-600" />
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
            <h2 className="text-xl font-semibold mb-4 text-[#1A1A1A]">Browse All Recipes</h2>
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
      <footer className="border-t border-gray-200 mt-16 py-8 bg-[#1E293B]">
        <div className="container mx-auto px-4 text-center text-sm text-[#94A3B8]">
          <p>
            &copy; {new Date().getFullYear()} Babe, What&apos;s for Dinner? All rights
            reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
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
        <Skeleton key={i} className="w-64 h-48 rounded-xl shrink-0" />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
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
