import { notFound } from "next/navigation";
import { getRecipe } from "@/app/actions/recipes";
import { CookingMode } from "@/components/recipes/cooking-mode";

interface CookPageProps {
  params: Promise<{ id: string }>;
}

export default async function CookPage({ params }: CookPageProps) {
  const { id } = await params;
  const recipeResult = await getRecipe(id);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  const recipe = recipeResult.data;

  return <CookingMode recipe={recipe} />;
}

