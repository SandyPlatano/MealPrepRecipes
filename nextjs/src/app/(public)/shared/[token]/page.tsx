import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  ChefHat,
  UtensilsCrossed,
  Cookie,
  Croissant,
  Coffee,
  IceCream,
  Salad,
  ExternalLink,
  User,
  Eye,
  BookmarkPlus,
  LogIn,
} from "lucide-react";
import { getRecipeByShareToken, trackRecipeView } from "@/app/actions/sharing";
import type { RecipeType } from "@/types/recipe";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SharedRecipePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: SharedRecipePageProps): Promise<Metadata> {
  const { token } = await params;
  const { data: recipe } = await getRecipeByShareToken(token);

  if (!recipe) {
    return {
      title: "Recipe Not Found",
    };
  }

  return {
    title: `${recipe.title} | MealPrepRecipes`,
    description: `${recipe.recipe_type} recipe - ${recipe.prep_time || ""} prep, ${recipe.cook_time || ""} cook. ${recipe.ingredients.length} ingredients.`,
    openGraph: {
      title: recipe.title,
      description: `Check out this ${recipe.recipe_type.toLowerCase()} recipe!`,
      images: recipe.image_url ? [recipe.image_url] : undefined,
    },
  };
}

function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="h-5 w-5" />;
    case "Breakfast":
      return <Coffee className="h-5 w-5" />;
    case "Dessert":
      return <IceCream className="h-5 w-5" />;
    case "Snack":
      return <Croissant className="h-5 w-5" />;
    case "Side Dish":
      return <Salad className="h-5 w-5" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="h-5 w-5" />;
  }
}

export default async function SharedRecipePage({
  params,
}: SharedRecipePageProps) {
  const { token } = await params;
  const { data: recipe, error } = await getRecipeByShareToken(token);

  if (error || !recipe) {
    notFound();
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const referrer = headersList.get("referer") || undefined;
  const userAgent = headersList.get("user-agent") || undefined;

  await trackRecipeView(recipe.id, ip, referrer, userAgent);

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full" size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {getRecipeIcon(recipe.recipe_type)}
                <Badge variant="secondary">{recipe.recipe_type}</Badge>
                {recipe.category && (
                  <Badge variant="outline">{recipe.category}</Badge>
                )}
              </div>

              <CardTitle className="text-3xl font-bold">
                {recipe.title}
              </CardTitle>

              {recipe.protein_type && (
                <CardDescription className="text-base">
                  {recipe.protein_type}
                </CardDescription>
              )}

              {recipe.author && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>
                    Shared by{" "}
                    <span className="font-medium text-[#1A1A1A]">@{recipe.author.username}</span>
                  </span>
                </div>
              )}

              {recipe.view_count > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{recipe.view_count} views</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {recipe.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Prep: {recipe.prep_time}</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>Cook: {recipe.cook_time}</span>
                </div>
              )}
              {(recipe.servings || recipe.base_servings) && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    Serves: {recipe.servings || recipe.base_servings}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTA for guests */}
            <div className="p-4 rounded-xl bg-[#E4F8C9] border border-[#D9F99D]/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-[#1A1A1A]">Want to save this recipe?</p>
                  <p className="text-sm text-gray-600">
                    Sign up free to save recipes to your collection
                  </p>
                </div>
                <Button className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full" asChild>
                  <Link href={`/signup?redirect=/shared/${token}`}>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save Recipe
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Ingredients & Instructions */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">Ingredients</h3>
                  <Badge variant="secondary" className="text-xs">
                    {recipe.ingredients.length} items
                  </Badge>
                </div>

                <ul className="flex flex-col gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-gray-400">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">Instructions</h3>
                  <p className="text-sm text-gray-500">
                    {recipe.instructions.length} steps
                  </p>
                </div>
                <ol className="flex flex-col gap-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div className="prose prose-sm max-w-none flex-1 text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {instruction}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Notes */}
            {recipe.notes && (
              <>
                <div className="border-t border-gray-200" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">Notes</h3>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {recipe.notes}
                    </ReactMarkdown>
                  </div>
                </div>
              </>
            )}

            {/* Source URL */}
            {recipe.source_url && (
              <>
                <div className="border-t border-gray-200" />
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <a
                    href={recipe.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1A1A1A] hover:underline"
                  >
                    View Original Source
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="text-gray-500">
            Discover more recipes and plan your meals with Babe, What&apos;s for Dinner?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8 bg-[#1E293B]">
        <div className="container mx-auto px-4 text-center text-sm text-[#94A3B8]">
          <p>
            &copy; {new Date().getFullYear()} Babe, What&apos;s for Dinner? All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
