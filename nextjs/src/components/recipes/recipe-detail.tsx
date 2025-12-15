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
import { NutritionFactsCard } from "@/components/nutrition";
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
  Sparkles,
  Loader2,
  Share2,
  Globe,
  Link2,
  Eye,
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
import { ShareRecipeDialog } from "@/components/social/share-recipe-dialog";
import { ReviewList } from "@/components/social/review-list";
import type { Recipe, RecipeType } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import { formatDistanceToNow } from "date-fns";
import { scaleIngredients } from "@/lib/ingredient-scaler";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { detectAllergens, mergeAllergens, getAllergenDisplayName, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";
import { Substitution } from "@/lib/substitutions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CookingHistoryEntry {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url: string | null;
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

interface RecipeDetailProps {
  recipe: Recipe;
  isFavorite: boolean;
  history: CookingHistoryEntry[];
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  nutrition?: RecipeNutrition | null;
  nutritionEnabled?: boolean;
  substitutions?: Map<string, Substitution[]>;
  currentUserId?: string;
}

export function RecipeDetail({
  recipe,
  isFavorite: initialIsFavorite,
  history,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  nutrition = null,
  nutritionEnabled = false,
  substitutions = new Map(),
  currentUserId,
}: RecipeDetailProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExtractingNutrition, setIsExtractingNutrition] = useState(false);
  const [localNutrition, setLocalNutrition] = useState<RecipeNutrition | null>(nutrition);
  const [localHistory, setLocalHistory] = useState(history);
  const router = useRouter();

  // Check if recipe was cooked today
  const today = new Date().toDateString();
  const cookedToday = localHistory.some(
    (entry) => new Date(entry.cooked_at).toDateString() === today
  );

  const handleCookedSuccess = () => {
    // Optimistically add a new entry to local history
    const newEntry: CookingHistoryEntry = {
      id: `temp-${Date.now()}`,
      cooked_at: new Date().toISOString(),
      rating: null,
      notes: null,
      modifications: null,
      photo_url: null,
      cooked_by_profile: null,
    };
    setLocalHistory([newEntry, ...localHistory]);
    // Also refresh the page to get server data
    router.refresh();
  };
  
  // Serving size scaling
  const [currentServings, setCurrentServings] = useState(
    recipe.base_servings || 1
  );
  const canScale = recipe.base_servings !== null && recipe.base_servings > 0;
  const scaledIngredients = canScale
    ? scaleIngredients(recipe.ingredients, recipe.base_servings!, currentServings)
    : recipe.ingredients;

  // Allergen detection
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const allergens = mergeAllergens(detectedAllergens, recipe.allergen_tags || []);
  
  // Check if recipe contains user's allergens
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) => userAllergenAlerts.includes(allergen));
  
  // Check for custom dietary restrictions
  const matchingCustomRestrictions = hasCustomRestrictions(recipe.ingredients, customDietaryRestrictions);
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;

  // Substitutions are now passed as a prop from the server component

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(recipe.id);
    if (!result.error) {
      setIsFavorite(result.isFavorite);
      toast.success(
        result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
      );
    }
  };

  const handleExportPDF = () => {
    // Open dedicated print page
    window.open(`/app/recipes/${recipe.id}/print`, "_blank");
    toast.success("Opening print view...");
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

  const handleExtractNutrition = async () => {
    setIsExtractingNutrition(true);
    try {
      const response = await fetch("/api/ai/extract-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify({
          recipe_id: recipe.id, // Fixed: API expects recipe_id, not recipeId
          title: recipe.title,
          ingredients: recipe.ingredients,
          servings: recipe.base_servings || 4,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to extract nutrition");
        return;
      }

      // Update local nutrition state with extracted data
      setLocalNutrition(result.nutrition);
      toast.success("Nutrition extracted successfully!");

      // Refresh the page to update all data
      router.refresh();
    } catch (error) {
      console.error("Error extracting nutrition:", error);
      toast.error("Failed to extract nutrition");
    } finally {
      setIsExtractingNutrition(false);
    }
  };

  const incrementServings = () => {
    setCurrentServings((prev) => prev + 1);
  };

  const decrementServings = () => {
    setCurrentServings((prev) => Math.max(1, prev - 1));
  };

  const setServingsPreset = (multiplier: number) => {
    if (recipe.base_servings) {
      setCurrentServings(recipe.base_servings * multiplier);
    }
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
                    <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Recipe
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
            {recipe.is_public && (
              <div className="flex items-center gap-1 text-green-600">
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </div>
            )}
            {recipe.share_token && !recipe.is_public && (
              <div className="flex items-center gap-1 text-blue-600">
                <Link2 className="h-4 w-4" />
                <span>Link shared</span>
              </div>
            )}
            {(recipe.view_count || 0) > 0 && (recipe.is_public || recipe.share_token) && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{recipe.view_count} views</span>
              </div>
            )}
          </div>

          {/* User Allergen & Dietary Restriction Warning - Prominent */}
          {hasAnyWarnings && (
            <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-500">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    ⚠️ Contains items you&apos;ve flagged
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      This recipe contains:
                    </span>
                    {matchingAllergens.map((allergen) => (
                      <Badge
                        key={allergen}
                        className="bg-amber-600 dark:bg-amber-700 text-white"
                      >
                        {getAllergenDisplayName(allergen)}
                      </Badge>
                    ))}
                    {matchingCustomRestrictions.map((restriction) => (
                      <Badge
                        key={restriction}
                        className="bg-amber-600 dark:bg-amber-700 text-white"
                      >
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

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
            <div className="space-y-4">
              {/* Title Row */}
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <Badge variant="secondary" className="text-xs">
                  {recipe.ingredients.length} items
                </Badge>
              </div>

              {/* Serving Controls Row */}
              {canScale && (
                <div className="space-y-3">
                  {/* Quick presets */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsPreset(0.5)}
                      className="text-xs"
                    >
                      Half
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsPreset(1)}
                      className="text-xs"
                    >
                      Original
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsPreset(2)}
                      className="text-xs"
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsPreset(4)}
                      className="text-xs"
                    >
                      Family (4x)
                    </Button>
                  </div>
                  {/* Manual adjuster */}
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-fit">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={decrementServings}
                      disabled={currentServings <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 min-w-[80px] justify-center">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{currentServings}</span>
                      <span className="text-xs text-muted-foreground">servings</span>
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
                </div>
              )}

              {canScale && currentServings !== recipe.base_servings && (
                <p className="text-xs text-muted-foreground italic">
                  Scaled from {recipe.base_servings} serving
                  {recipe.base_servings !== 1 ? "s" : ""}
                </p>
              )}

              <ul className="space-y-2">
                {scaledIngredients.map((ingredient, index) => {
                  const ingredientSubs = substitutions.get(recipe.ingredients[index] || ingredient);
                  return (
                    <li key={index} className="flex items-start gap-2 group">
                      <span className="text-muted-foreground">•</span>
                      <div className="flex-1 flex items-center gap-2">
                        <span>{ingredient}</span>
                        {ingredientSubs && ingredientSubs.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Swap
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Substitutions for {recipe.ingredients[index]}:</p>
                                <ul className="space-y-2">
                                  {ingredientSubs.map((sub, subIndex) => (
                                    <li key={subIndex} className="text-sm">
                                      <div className="font-medium">{sub.substitute_ingredient}</div>
                                      {sub.notes && (
                                        <div className="text-xs text-muted-foreground">{sub.notes}</div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </li>
                  );
                })}
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
                    <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {instruction}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Nutrition Facts */}
          {nutritionEnabled && (
            <>
              <div className="border-t" />
              <div className="space-y-4">
                {localNutrition ? (
                  <NutritionFactsCard
                    nutrition={localNutrition}
                    recipeId={recipe.id}
                    servings={recipe.base_servings || 4}
                    editable
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-8 space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">No Nutrition Data</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Use AI to automatically extract nutrition information from the recipe ingredients.
                        </p>
                      </div>
                      <Button
                        onClick={handleExtractNutrition}
                        disabled={isExtractingNutrition}
                        className="mx-auto"
                      >
                        {isExtractingNutrition ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Extract Nutrition with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {recipe.notes && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Notes</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {recipe.notes}
                  </ReactMarkdown>
                </div>
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
                        {entry.modifications && (
                          <div className="text-xs">
                            <span className="font-medium text-primary">Tweaks: </span>
                            <span className="text-muted-foreground">{entry.modifications}</span>
                          </div>
                        )}
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

          {/* Community Reviews */}
          {recipe.is_public && (
            <>
              <div className="border-t" />
              <ReviewList
                recipeId={recipe.id}
                recipeOwnerId={recipe.user_id}
                currentUserId={currentUserId}
                avgRating={recipe.avg_rating}
                reviewCount={recipe.review_count || 0}
                isPublic={recipe.is_public}
              />
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

      {/* Share Recipe Dialog */}
      <ShareRecipeDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        isPublic={recipe.is_public || false}
        shareToken={recipe.share_token || null}
        viewCount={recipe.view_count || 0}
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
