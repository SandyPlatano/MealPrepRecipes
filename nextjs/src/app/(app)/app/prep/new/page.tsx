import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getRecipes } from "@/app/actions/recipes";
import { NewPrepSessionClient } from "@/components/meal-prep/new-prep-session-client";

export default async function NewPrepSessionPage() {
  const recipesResult = await getRecipes();
  const recipes = recipesResult.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/prep">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-mono font-bold">New Prep Session</h1>
          <p className="text-muted-foreground mt-1">
            Plan your batch cooking session and select recipes.
          </p>
        </div>
      </div>

      <NewPrepSessionClient recipes={recipes} />
    </div>
  );
}
