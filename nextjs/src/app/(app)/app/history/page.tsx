import { getCookingHistory } from "@/app/actions/cooking-history";
import { getSentMealPlans } from "@/app/actions/meal-plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Calendar, Heart } from "lucide-react";

export default async function HistoryPage() {
  const [historyResult, plansResult] = await Promise.all([
    getCookingHistory(),
    getSentMealPlans(),
  ]);
  
  const history = historyResult.data || [];
  const weeklyPlans = plansResult.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">The Vault</h1>
        <p className="text-muted-foreground mt-1">
          Your favorites and everything you&apos;ve actually made
        </p>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="weekly-plans">
            <Calendar className="h-4 w-4 mr-2" />
            Weekly Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {history.length === 0 ? (
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
                  description="Send a plan from the meal planner to save it here for reference."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {weeklyPlans.map((plan: Record<string, unknown>) => {
                const weekStart = plan.week_start as string;
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                return (
                  <Card key={plan.id as string} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>
                            Week of {format(new Date(weekStart), 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Saved on {format(new Date(plan.sent_at as string), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(plan.meal_assignments as Array<Record<string, unknown>>)?.map((assignment) => (
                          <div 
                            key={assignment.id as string} 
                            className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0"
                          >
                            <span className="font-medium">{(assignment.recipe as Record<string, unknown>)?.title as string}</span>
                            <div className="flex gap-2 text-muted-foreground">
                              {assignment.cook ? <Badge variant="outline">{String(assignment.cook)}</Badge> : null}
                              <Badge variant="outline">{String(assignment.day_of_week)}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
