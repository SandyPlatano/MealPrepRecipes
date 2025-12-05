"use client";

import { useState } from "react";
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
import { StarRating } from "@/components/ui/star-rating";
import {
  Heart,
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
  History,
  Plus,
  Minus,
  Play,
  MoreVertical,
  Download,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleFavorite, deleteRecipe } from "@/app/actions/recipes";
import { MarkCookedDialog } from "@/components/recipes/mark-cooked-dialog";
import type { Recipe, RecipeType } from "@/types/recipe";
import { formatDistanceToNow } from "date-fns";
import { scaleIngredients } from "@/lib/ingredient-scaler";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CookingHistoryEntry {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  cooked_by_profile?: { name: string | null } | null;
}

// Get icon based on recipe type
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

// Export recipe as Markdown
function exportRecipeAsMarkdown(recipe: Recipe): string {
  return `# ${recipe.title}

**Type:** ${recipe.recipe_type}
**Category:** ${recipe.category || "N/A"}
**Prep Time:** ${recipe.prep_time || "N/A"}
**Cook Time:** ${recipe.cook_time || "N/A"}
**Servings:** ${recipe.servings || recipe.base_servings || "N/A"}

## Ingredients

${recipe.ingredients.map((ing) => `- ${ing}`).join("\n")}

## Instructions

${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}

${recipe.notes ? `## Notes\n\n${recipe.notes}` : ""}

${recipe.tags.length > 0 ? `**Tags:** ${recipe.tags.join(", ")}` : ""}
`;
}

// Download text as file
function downloadTextAsFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface RecipeDetailProps {
  recipe: Recipe;
  isFavorite: boolean;
  history: CookingHistoryEntry[];
}

export function RecipeDetail({
  recipe,
  isFavorite: initialIsFavorite,
  history,
}: RecipeDetailProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  
  // Serving size scaling
  const [currentServings, setCurrentServings] = useState(
    recipe.base_servings || 1
  );
  const canScale = recipe.base_servings !== null && recipe.base_servings > 0;
  const scaledIngredients = canScale
    ? scaleIngredients(recipe.ingredients, recipe.base_servings!, currentServings)
    : recipe.ingredients;

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(recipe.id);
    if (!result.error) {
      setIsFavorite(result.isFavorite);
      toast.success(
        result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
      );
    }
  };

  const handleExportMarkdown = () => {
    const markdown = exportRecipeAsMarkdown(recipe);
    downloadTextAsFile(
      markdown,
      `${recipe.title.replace(/[^a-z0-9]/gi, "_")}.md`,
      "text/markdown"
    );
    toast.success("Exported as Markdown");
  };

  const handleExportPDF = () => {
    // Open print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${recipe.title}</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { margin-bottom: 10px; }
              .meta { color: #666; margin-bottom: 20px; }
              h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
              ul, ol { line-height: 1.8; }
              .notes { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .tags { margin-top: 20px; }
              .tag { display: inline-block; background: #e0e0e0; padding: 4px 8px; border-radius: 4px; margin-right: 5px; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>${recipe.title}</h1>
            <p class="meta">
              ${recipe.recipe_type} • ${recipe.category || ""} •
              Prep: ${recipe.prep_time || "N/A"} • Cook: ${recipe.cook_time || "N/A"} •
              Serves: ${recipe.servings || recipe.base_servings || "N/A"}
            </p>
            <h2>Ingredients</h2>
            <ul>
              ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
            </ul>
            <h2>Instructions</h2>
            <ol>
              ${recipe.instructions.map((inst) => `<li>${inst}</li>`).join("")}
            </ol>
            ${recipe.notes ? `<div class="notes"><strong>Notes:</strong> ${recipe.notes}</div>` : ""}
            ${recipe.tags.length > 0 ? `<div class="tags">${recipe.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Opening PDF...");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteRecipe(recipe.id);
    if (result.error) {
      console.error("Failed to delete:", result.error);
      setIsDeleting(false);
    } else {
      toast.success("Recipe deleted");
      router.push("/app/recipes");
    }
    setDeleteDialogOpen(false);
  };

  const incrementServings = () => {
    setCurrentServings((prev) => prev + 1);
  };

  const decrementServings = () => {
    setCurrentServings((prev) => Math.max(1, prev - 1));
  };

  const lastCooked = history.length > 0 ? history[0].cooked_at : null;

  return (
    <>
      {/* Single Card with All Recipe Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getRecipeIcon(recipe.recipe_type)}
                <Badge variant="secondary">{recipe.recipe_type}</Badge>
                {recipe.category && (
                  <Badge variant="outline">{recipe.category}</Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-mono">
                {recipe.title}
              </CardTitle>
              {recipe.protein_type && (
                <CardDescription className="text-base">
                  {recipe.protein_type}
                </CardDescription>
              )}
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFavorite}
                      className={isFavorite ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-6 w-6" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/app/recipes/${recipe.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Recipe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Recipe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
            {lastCooked && (
              <div className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span>
                  Last made{" "}
                  {formatDistanceToNow(new Date(lastCooked), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowCookedDialog(true)}>
              I Made This!
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/app/recipes/${recipe.id}/cook`}>
                <Play className="mr-2 h-4 w-4" />
                Start Cooking Mode
              </Link>
            </Button>
            {recipe.source_url && (
              <Button variant="outline" asChild>
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Source
                </a>
              </Button>
            )}
          </div>

          <div className="border-t" />

          {/* Ingredients & Instructions */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <p className="text-sm text-muted-foreground">
                    {recipe.ingredients.length} items
                  </p>
                </div>
                {canScale && (
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={decrementServings}
                      disabled={currentServings <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 min-w-[60px] justify-center">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{currentServings}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={incrementServings}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {canScale && currentServings !== recipe.base_servings && (
                <p className="text-xs text-muted-foreground italic">
                  Scaled from {recipe.base_servings} serving
                  {recipe.base_servings !== 1 ? "s" : ""}
                </p>
              )}
              <ul className="space-y-2">
                {scaledIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Instructions</h3>
                <p className="text-sm text-muted-foreground">
                  {recipe.instructions.length} steps
                </p>
              </div>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {recipe.notes}
                </p>
              </div>
            </>
          )}

          {/* Cooking History */}
          {history.length > 0 && (
            <>
              <div className="border-t" />
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">Cooking History</h3>
                  <p className="text-sm text-muted-foreground">
                    Made {history.length} time
                    {history.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ul className="space-y-3">
                  {history.slice(0, 5).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {new Date(entry.cooked_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          {entry.cooked_by_profile?.name && (
                            <span className="text-xs text-muted-foreground">
                              by {entry.cooked_by_profile.name}
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <span className="text-muted-foreground text-xs">
                            {entry.notes}
                          </span>
                        )}
                      </div>
                      {entry.rating && (
                        <StarRating rating={entry.rating} readonly size="sm" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mark as Cooked Dialog */}
      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={showCookedDialog}
        onOpenChange={setShowCookedDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete This Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete &quot;{recipe.title}&quot; forever.
              Gone from your collection, favorites, and any meal plans. No
              take-backs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
