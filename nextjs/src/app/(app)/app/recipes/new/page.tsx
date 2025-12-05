import Link from "next/link";
import { RecipeImport } from "@/components/recipes/recipe-import";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewRecipePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/recipes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-mono font-bold">Add Recipe</h1>
          <p className="text-muted-foreground mt-1">
            Paste it, link it, or type it. We&apos;ll handle the rest.
          </p>
        </div>
      </div>

      <RecipeImport />
    </div>
  );
}
