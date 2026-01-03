import { notFound } from "next/navigation";
import { getRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";

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
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb currentTitle={result.data.title} />

      <div>
        <h1 className="text-3xl font-mono font-bold">Edit Recipe</h1>
        <p className="text-muted-foreground mt-1">
          Tweak &quot;{result.data.title}&quot; to perfection.
        </p>
      </div>

      <RecipeForm recipe={result.data} householdId={result.data.household_id} />
    </div>
  );
}
