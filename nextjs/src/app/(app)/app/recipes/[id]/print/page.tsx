"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { getRecipe } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { Clock, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Recipe } from "@/types/recipe";
import { convertIngredientsToSystem, type UnitSystem } from "@/lib/ingredient-scaler";

export default function PrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [loading, setLoading] = useState(true);

  // Compute date string once on client to avoid hydration mismatch
  const printDate = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new Date().toLocaleDateString("en-US", { timeZone: "UTC" });
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [recipeResult, settingsResult] = await Promise.all([
        getRecipe(id),
        getSettings(),
      ]);

      if (recipeResult.error || !recipeResult.data) {
        notFound();
      }

      setRecipe(recipeResult.data);
      setUnitSystem((settingsResult.data?.unit_system as UnitSystem) || "imperial");
      setLoading(false);

      // Trigger print dialog after recipe loads
      setTimeout(() => {
        window.print();
      }, 500);
    }

    fetchData();
  }, [id]);

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Convert ingredients to user's preferred unit system
  const displayIngredients = convertIngredientsToSystem(recipe.ingredients, unitSystem);

  return (
    <>

      <div className="print-container max-w-4xl mx-auto p-8">
        {/* Header */}
        <header className="mb-8 border-b-2 border-gray-300 pb-6">
          <h1 className="text-4xl font-bold font-mono mb-4">{recipe.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
            {(recipe.prep_time || recipe.cook_time) && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {recipe.prep_time && `Prep: ${recipe.prep_time}`}
                  {recipe.prep_time && recipe.cook_time && " • "}
                  {recipe.cook_time && `Cook: ${recipe.cook_time}`}
                </span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.recipe_type && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {recipe.recipe_type}
              </span>
            )}
            {recipe.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {recipe.category}
              </span>
            )}
            {recipe.protein_type && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {recipe.protein_type}
              </span>
            )}
          </div>

          {recipe.source_url && (
            <div className="mt-4 text-xs text-gray-500">
              Source: {recipe.source_url}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Ingredients */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {displayIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="prose prose-sm max-w-none pt-1 flex-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {instruction}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <section className="mt-8 pt-6 border-t border-gray-300">
            <h2 className="text-xl font-bold mb-3">Notes</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {recipe.notes}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Printed from Babe, What&apos;s for Dinner?{printDate && ` • ${printDate}`}</p>
        </footer>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }

          .print-container {
            max-width: 100%;
            padding: 0.5in;
          }

          /* Hide all non-recipe content */
          nav,
          header:not(.print-container header),
          footer:not(.print-container footer),
          button,
          .no-print {
            display: none !important;
          }

          /* Optimize for black & white printing */
          * {
            color: black !important;
            background: white !important;
          }

          /* Preserve borders */
          .border-b-2,
          .border-t {
            border-color: #333 !important;
          }

          .bg-gray-100,
          .bg-gray-200 {
            background: #f0f0f0 !important;
          }

          /* Page breaks */
          h1, h2 {
            page-break-after: avoid;
          }

          li {
            page-break-inside: avoid;
          }

          /* Ensure readable font sizes */
          body {
            font-size: 12pt;
          }

          h1 {
            font-size: 24pt;
          }

          h2 {
            font-size: 18pt;
          }
        }

        @media screen {
          .print-container {
            background: white;
            min-height: 100vh;
          }
        }
      `}</style>
    </>
  );
}
