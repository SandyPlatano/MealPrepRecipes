import Link from "next/link";
import { ChefHat, Plus } from "lucide-react";
import { getPrepSessions } from "@/app/actions/meal-prep";
import { PrepSessionList } from "@/components/meal-prep";
import { Button } from "@/components/ui/button";

export default async function PrepPage() {
  const prepSessionsResult = await getPrepSessions();
  const allSessions = prepSessionsResult.data || [];

  // Group sessions by status
  const inProgressSessions = allSessions.filter((s) => s.status === "in_progress");
  const upcomingSessions = allSessions.filter((s) => s.status === "planned");
  const completedSessions = allSessions.filter((s) => s.status === "completed");

  const hasAnySessions = allSessions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-muted-foreground" />
            <h1 className="text-3xl font-mono font-bold">Meal Prep</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Plan and track your batch cooking sessions.
          </p>
        </div>
        <Link href="/app/prep/new">
          <Button size="default" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Prep Session
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {!hasAnySessions && (
        <div className="border border-dashed border-muted-foreground/20 rounded-lg p-12 text-center">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No prep sessions yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first meal prep session to batch cook multiple recipes and
            stay organized throughout the week.
          </p>
          <Link href="/app/prep/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Session
            </Button>
          </Link>
        </div>
      )}

      {/* In Progress Sessions */}
      {inProgressSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressSessions.map((session) => (
              <PrepSessionCard
                key={session.id}
                session={session}
                recipeCount={0}
                completedRecipeCount={0}
                onView={(id) => {
                  // Client-side navigation handled by PrepSessionCard
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session) => (
              <PrepSessionCard
                key={session.id}
                session={session}
                recipeCount={0}
                completedRecipeCount={0}
                onView={(id) => {
                  // Client-side navigation handled by PrepSessionCard
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSessions.map((session) => (
              <PrepSessionCard
                key={session.id}
                session={session}
                recipeCount={0}
                completedRecipeCount={0}
                onView={(id) => {
                  // Client-side navigation handled by PrepSessionCard
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
