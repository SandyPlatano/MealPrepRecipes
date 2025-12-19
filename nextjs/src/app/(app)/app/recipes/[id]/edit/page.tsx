import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const result = await getRecipe(id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/app/recipes/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-mono font-bold">Edit Recipe</h1>
          <p className="text-muted-foreground mt-1">
            Tweak &quot;{result.data.title}&quot; to perfection.
          </p>
        </div>
      </div>

      <RecipeForm recipe={result.data} householdId={result.data.household_id} />
    </div>
  );
}
