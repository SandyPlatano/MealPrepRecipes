import { getCookingHistory } from "@/app/actions/cooking-history";
import { getSentMealPlans } from "@/app/actions/meal-plans";
import { getFavoriteRecipes } from "@/app/actions/recipes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { WeeklyPlanCard } from "@/components/history/weekly-plan-card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Calendar, Heart, ChefHat } from "lucide-react";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [historyResult, plansResult, favoritesResult] = await Promise.all([
    getCookingHistory(),
    getSentMealPlans(),
    getFavoriteRecipes(),
  ]);

  const history = historyResult.data || [];
  const weeklyPlans = plansResult.data || [];
  const favorites = favoritesResult.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Favorites</h1>
        <p className="text-muted-foreground mt-1">
          Your favorite recipes and cooking history
        </p>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="cooked">
            <ChefHat className="h-4 w-4 mr-2" />
            Cooked
          </TabsTrigger>
          <TabsTrigger value="weekly-plans">
            <Calendar className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon="❤️"
                  title="No favorites yet"
                  description="Heart the recipes you love to find them easily when it's time to decide what to cook."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <Link
                          href={`/app/recipes/${recipe.id}`}
                          className="hover:underline"
                        >
                          <CardTitle className="text-xl">
                            {recipe.title}
                          </CardTitle>
                        </Link>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {recipe.recipe_type && (
                            <Badge variant="secondary">
                              {recipe.recipe_type}
                            </Badge>
                          )}
                          {recipe.protein_type && (
                            <Badge variant="outline">
                              {recipe.protein_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Favorited {formatDistanceToNow(new Date(recipe.favorited_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {recipe.prep_time && recipe.cook_time && (
                        <>
                          <span>•</span>
                          <span>{recipe.prep_time + recipe.cook_time} min total</span>
                        </>
                      )}
                      {recipe.servings && (
                        <>
                          <span>•</span>
                          <span>{recipe.servings} servings</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cooked" className="mt-6">
          {history.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon="🍳"
                  title="No cooking history yet"
                  description="Mark recipes as cooked to track what you've made and rate them."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <Link
                          href={`/app/recipes/${entry.recipe_id}`}
                          className="hover:underline"
                        >
                          <CardTitle className="text-xl">
                            {entry.recipe?.title || "Unknown Recipe"}
                          </CardTitle>
                        </Link>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {entry.recipe?.recipe_type && (
                            <Badge variant="secondary">
                              {entry.recipe.recipe_type}
                            </Badge>
                          )}
                          {entry.recipe?.protein_type && (
                            <Badge variant="outline">
                              {entry.recipe.protein_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {entry.rating && (
                        <StarRating rating={entry.rating} readonly size="sm" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(entry.cooked_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {entry.cooked_by_profile?.name && (
                        <>
                          <span>•</span>
                          <span>Cooked by {entry.cooked_by_profile.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(entry.cooked_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-3 italic">
                        &quot;{entry.notes}&quot;
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly-plans" className="mt-6">
          {weeklyPlans.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon="📅"
                  title="No weekly plans yet"
                  description="Finalize a plan from the meal planner to save it here for reference."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {weeklyPlans.map((plan) => (
                <WeeklyPlanCard
                  key={plan.id}
                  plan={plan as Parameters<typeof WeeklyPlanCard>[0]["plan"]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
