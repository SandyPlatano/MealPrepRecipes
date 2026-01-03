"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle2,
  Star,
  LayoutGrid,
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
import { deleteCookingHistoryEntry } from "@/app/actions/cooking-history";
import { updateRecipeLayoutPreferencesAuto } from "@/app/actions/user-preferences";
import { RatingBadge } from "@/components/ui/rating-badge";

// Lazy load dialog components - only loaded when user opens them
const MarkCookedDialog = dynamic(
  () => import("@/components/recipes/mark-cooked-dialog").then((mod) => mod.MarkCookedDialog),
  { ssr: false }
);
const EditCookingHistoryDialog = dynamic(
  () => import("@/components/recipes/edit-cooking-history-dialog").then((mod) => mod.EditCookingHistoryDialog),
  { ssr: false }
);
const RecipeExportOnlyDialog = dynamic(
  () => import("@/components/recipes/export/recipe-export-only-dialog").then((mod) => mod.RecipeExportOnlyDialog),
  { ssr: false }
);
const RecipeShareDialog = dynamic(
  () => import("@/components/recipes/export/recipe-share-dialog").then((mod) => mod.RecipeShareDialog),
  { ssr: false }
);
const RecipeLayoutCustomizer = dynamic(
  () => import("@/components/recipes/recipe-layout-customizer").then((mod) => mod.RecipeLayoutCustomizer),
  { ssr: false }
);
import { getMostRecentCookingEntry } from "@/app/actions/cooking-history";
import type { Recipe, RecipeType } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import { formatDistanceToNow } from "date-fns";
import { scaleIngredients, convertIngredientsToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
import { UnitSystemToggle } from "@/components/recipes/unit-system-toggle";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { detectAllergens, mergeAllergens, getAllergenDisplayName, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";
import { Substitution } from "@/lib/substitutions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { AlertTriangle, RefreshCw, ChevronDown, Leaf, AlertCircle, ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RecipeLayoutPreferences, RecipeSectionId } from "@/types/recipe-layout";
import { DEFAULT_RECIPE_LAYOUT_PREFERENCES } from "@/types/recipe-layout";
import { AddIngredientsDialog } from "@/components/recipes/add-ingredients-dialog";
import { ClickableIngredient } from "@/components/recipes/clickable-ingredient";
import { useQuickCartContext } from "@/components/quick-cart";
import { ShoppingCart } from "lucide-react";

interface CookingHistoryEntry {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url: string | null;
  cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
}

// Get icon based on recipe type
function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="size-5" />;
    case "Breakfast":
      return <Coffee className="size-5" />;
    case "Dessert":
      return <IceCream className="size-5" />;
    case "Snack":
      return <Croissant className="size-5" />;
    case "Side Dish":
      return <Salad className="size-5" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="size-5" />;
  }
}

// Filter tags to remove duplicates that appear in recipe_type, category, or protein_type
function getDisplayTags(recipe: Recipe): string[] {
  const excludedValues = new Set<string>();

  // Exclude recipe_type (e.g., "Side Dish" badge)
  if (recipe.recipe_type) {
    excludedValues.add(recipe.recipe_type.toLowerCase());
  }

  // Exclude category if it exists (e.g., "Vegan" badge)
  if (recipe.category) {
    excludedValues.add(recipe.category.toLowerCase());
  }

  // Exclude protein_type if it exists (e.g., "vegan" subtitle)
  if (recipe.protein_type) {
    excludedValues.add(recipe.protein_type.toLowerCase());
  }

  // Filter tags to remove duplicates
  return recipe.tags.filter(
    (tag) => !excludedValues.has(tag.toLowerCase())
  );
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
  userUnitSystem?: UnitSystem;
  layoutPrefs?: RecipeLayoutPreferences;
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
  userUnitSystem = "imperial",
  layoutPrefs = DEFAULT_RECIPE_LAYOUT_PREFERENCES,
}: RecipeDetailProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [currentRating, setCurrentRating] = useState<number | null>(recipe.rating);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExtractingNutrition, setIsExtractingNutrition] = useState(false);
  const [localNutrition, setLocalNutrition] = useState<RecipeNutrition | null>(nutrition);
  const [localHistory, setLocalHistory] = useState(history);
  const [localLayoutPrefs, setLocalLayoutPrefs] = useState(layoutPrefs);
  const [editingHistoryEntry, setEditingHistoryEntry] = useState<CookingHistoryEntry | null>(null);
  const [deleteHistoryEntryId, setDeleteHistoryEntryId] = useState<string | null>(null);
  const [isDeletingHistoryEntry, setIsDeletingHistoryEntry] = useState(false);

  // Quick cart integration
  const [showAddIngredientsDialog, setShowAddIngredientsDialog] = useState(false);
  const [isAddingIngredients, setIsAddingIngredients] = useState(false);
  const quickCart = useQuickCartContext();
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

  const handleEditHistorySuccess = (updatedEntry: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
  }) => {
    // Optimistically update the entry in local history
    setLocalHistory((prev) =>
      prev.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      )
    );
    router.refresh();
  };

  const handleDeleteHistoryEntry = async () => {
    if (!deleteHistoryEntryId) return;

    setIsDeletingHistoryEntry(true);
    const result = await deleteCookingHistoryEntry(deleteHistoryEntryId);
    setIsDeletingHistoryEntry(false);

    if (result.error) {
      toast.error("Failed to delete", { description: result.error });
      return;
    }

    // Optimistically remove from local history
    setLocalHistory((prev) => prev.filter((entry) => entry.id !== deleteHistoryEntryId));
    setDeleteHistoryEntryId(null);
    toast.success("Entry deleted");
    router.refresh();
  };

  // Serving size scaling
  const [currentServings, setCurrentServings] = useState(
    recipe.base_servings || 1
  );
  const [servingsInputValue, setServingsInputValue] = useState(
    String(recipe.base_servings || 1)
  );
  const canScale = recipe.base_servings !== null && recipe.base_servings > 0;
  const scaledIngredients = canScale
    ? scaleIngredients(recipe.ingredients, recipe.base_servings!, currentServings)
    : recipe.ingredients;

  // Unit system (local override for per-recipe toggle)
  const [localUnitSystem, setLocalUnitSystem] = useState<UnitSystem | null>(null);
  const effectiveUnitSystem = localUnitSystem ?? userUnitSystem;
  const displayIngredients = convertIngredientsToSystem(scaledIngredients, effectiveUnitSystem);

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

  const handleLayoutUpdate = async (newPrefs: RecipeLayoutPreferences) => {
    // Optimistic update
    setLocalLayoutPrefs(newPrefs);

    // Save to server
    const result = await updateRecipeLayoutPreferencesAuto(newPrefs);
    if (result.error) {
      toast.error("Failed to save layout");
      // Revert on error
      setLocalLayoutPrefs(layoutPrefs);
    }
  };

  // Handle rating click - check if cooking history exists
  const handleRatingClick = async () => {
    // Check if user has cooking history for this recipe
    const result = await getMostRecentCookingEntry(recipe.id);

    if (result.data) {
      // Has cooking history - open edit dialog
      setEditingHistoryEntry(result.data);
    } else {
      // No cooking history - open mark as cooked dialog
      setShowCookedDialog(true);
    }
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

  const MAX_SERVINGS = 99;

  const setServingsPreset = (multiplier: number) => {
    if (recipe.base_servings) {
      const newServings = Math.min(MAX_SERVINGS, Math.round(recipe.base_servings * multiplier));
      setCurrentServings(newServings);
      setServingsInputValue(String(newServings));
    }
  };

  const handleServingsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for typing
    if (value === "") {
      setServingsInputValue("");
      return;
    }

    // Only allow digits
    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    // Block values over 99
    if (numValue > MAX_SERVINGS) {
      setServingsInputValue(String(MAX_SERVINGS));
      setCurrentServings(MAX_SERVINGS);
      return;
    }

    // Block zero - minimum is 1
    if (numValue === 0) {
      setServingsInputValue("0"); // Allow typing but don't update scaling
      return;
    }

    setServingsInputValue(value);
    setCurrentServings(numValue);
  };

  const handleServingsInputBlur = () => {
    const numValue = parseInt(servingsInputValue, 10);

    // If empty or invalid, revert to base_servings
    if (servingsInputValue === "" || isNaN(numValue) || numValue < 1) {
      const fallback = recipe.base_servings || 1;
      setServingsInputValue(String(fallback));
      setCurrentServings(fallback);
      return;
    }

    // Clamp to valid range
    const clampedValue = Math.min(MAX_SERVINGS, Math.max(1, numValue));
    setServingsInputValue(String(clampedValue));
    setCurrentServings(clampedValue);
  };

  // Handle adding all ingredients to shopping cart
  const handleAddAllIngredients = async () => {
    setIsAddingIngredients(true);
    try {
      const result = await quickCart.addItemsFromRecipe(
        recipe.ingredients,
        recipe.id,
        recipe.title
      );

      setShowAddIngredientsDialog(false);

      if (result.error) {
        toast.error(result.error);
      } else if (result.added > 0) {
        toast.success(`Added ${result.added} items to cart`, {
          description: result.skipped > 0 ? `${result.skipped} already in list` : undefined,
        });
      } else {
        toast.info("All ingredients already in cart");
      }
    } catch {
      toast.error("Failed to add ingredients");
    } finally {
      setIsAddingIngredients(false);
    }
  };

  const lastCooked = localHistory.length > 0 ? localHistory[0].cooked_at : null;

  // ============================================================================
  // Section Render Helpers
  // ============================================================================

  const renderIngredientsSection = () => (
    <div className="flex flex-col gap-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">Ingredients</h3>
          <Badge variant="secondary" className="text-xs">
            {recipe.ingredients.length} items
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddIngredientsDialog(true)}
          className="gap-2"
        >
          <ShoppingCart className="size-4" />
          Add All
        </Button>
      </div>

      {/* Unit toggle for non-scalable recipes */}
      {!canScale && (
        <UnitSystemToggle
          defaultSystem={effectiveUnitSystem}
          onSystemChange={setLocalUnitSystem}
        />
      )}

      {/* Serving Controls Row */}
      {canScale && (
        <div className="flex flex-col gap-3">
          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap items-center">
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
            <UnitSystemToggle
              defaultSystem={effectiveUnitSystem}
              onSystemChange={setLocalUnitSystem}
            />
          </div>
          {/* Serving size input */}
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-fit">
            <Users className="size-4 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              max={99}
              value={servingsInputValue}
              onChange={handleServingsInputChange}
              onBlur={handleServingsInputBlur}
              className="h-8 w-16 text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-muted-foreground">servings</span>
          </div>
        </div>
      )}

      {canScale && currentServings !== recipe.base_servings && (
        <p className="text-xs text-muted-foreground italic">
          Scaled from {recipe.base_servings} serving
          {recipe.base_servings !== 1 ? "s" : ""}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {displayIngredients.map((ingredient, index) => {
          const ingredientSubs = substitutions.get(recipe.ingredients[index] || ingredient);
          const hasSubstitutes = ingredientSubs && ingredientSubs.length > 0;

          return (
            <li key={index} className="flex items-start gap-2 group">
              <span className="text-muted-foreground">•</span>
              <div className="flex-1 flex items-center gap-2">
                {hasSubstitutes ? (
                  <HoverCard openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        <ClickableIngredient
                          ingredient={recipe.ingredients[index] || ingredient}
                          recipeId={recipe.id}
                          recipeTitle={recipe.title}
                        >
                          <span className="border-b border-dashed border-muted-foreground/40 hover:border-primary transition-colors">
                            {ingredient}
                          </span>
                        </ClickableIngredient>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72" align="start" side="right">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-[#D9F99D]/30 flex items-center justify-center">
                            <Leaf className="size-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Substitutions Available</p>
                            <p className="text-xs text-muted-foreground">{ingredientSubs.length} option{ingredientSubs.length > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {ingredientSubs.slice(0, 2).map((sub, subIndex) => (
                            <div key={subIndex} className="flex items-start gap-2 text-sm">
                              <RefreshCw className="size-3 mt-1 text-muted-foreground flex-shrink-0" />
                              <div>
                                <span className="font-medium">{sub.substitute_ingredient}</span>
                                {sub.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{sub.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {ingredientSubs.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-5">
                              +{ingredientSubs.length - 2} more options
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground italic border-t pt-2">
                          Click &quot;Swap&quot; for details
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <ClickableIngredient
                    ingredient={recipe.ingredients[index] || ingredient}
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                  >
                    <span>{ingredient}</span>
                  </ClickableIngredient>
                )}
                {hasSubstitutes && (
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
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Substitutions for {recipe.ingredients[index]}:</p>
                        <ul className="flex flex-col gap-1.5">
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

      {/* Add All Ingredients Dialog */}
      <AddIngredientsDialog
        open={showAddIngredientsDialog}
        onOpenChange={setShowAddIngredientsDialog}
        ingredients={recipe.ingredients}
        recipeTitle={recipe.title}
        onConfirm={handleAddAllIngredients}
        isLoading={isAddingIngredients}
      />
    </div>
  );

  const renderInstructionsSection = () => (
    <div className="flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">Instructions</h3>
        <p className="text-sm text-muted-foreground">
          {recipe.instructions.length} steps
        </p>
      </div>
      <ol className="flex flex-col gap-5">
        {recipe.instructions.map((instruction, index) => (
          <li key={index} className="flex gap-4 pb-5 border-b border-border/50 last:border-0 last:pb-0">
            <span className="flex-shrink-0 size-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
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
  );

  const renderNutritionSection = () => {
    if (!nutritionEnabled) return null;
    return (
      <div className="flex flex-col">
        {localNutrition ? (
          <NutritionFactsCard
            nutrition={localNutrition}
            recipeId={recipe.id}
            servings={recipe.base_servings || 4}
            editable
          />
        ) : (
          <div className="flex flex-col">
            <div className="flex text-center py-8 flex-col">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="size-8 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
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
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Extract Nutrition with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotesSection = () => {
    if (!recipe.notes) return null;
    return (
      <Collapsible defaultOpen={false} className="flex flex-col">
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">Notes</h3>
          <ChevronDown className="size-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground pt-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {recipe.notes}
            </ReactMarkdown>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderCookingHistorySection = () => {
    if (localHistory.length === 0) return null;

    const renderHistoryEntry = (entry: CookingHistoryEntry) => (
      <li
        key={entry.id}
        className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50 group"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
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
            {(entry.cooked_by_profile?.first_name || entry.cooked_by_profile?.last_name) && (
              <span className="text-xs text-muted-foreground">
                by {[entry.cooked_by_profile.first_name, entry.cooked_by_profile.last_name].filter(Boolean).join(" ")}
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
        <div className="flex items-center gap-2">
          {entry.rating && (
            <StarRating rating={entry.rating} readonly size="sm" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingHistoryEntry(entry)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteHistoryEntryId(entry.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>
    );

    const firstEntry = localHistory[0];
    const remainingEntries = localHistory.slice(1, 5);

    return (
      <div className="flex flex-col">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">Cooking History</h3>
          <p className="text-sm text-muted-foreground">
            Made {localHistory.length} time
            {localHistory.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {/* Always show the most recent entry */}
          {renderHistoryEntry(firstEntry)}

          {/* Collapsible section for older entries */}
          {remainingEntries.length > 0 && (
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full justify-center py-1">
                <span>Show {remainingEntries.length} more</span>
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="flex flex-col gap-2 pt-2">
                  {remainingEntries.map(renderHistoryEntry)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </ul>
      </div>
    );
  };

  // Map section IDs to render functions (reviews removed - consolidated into cooking history)
  const sectionRenderers: Record<RecipeSectionId, () => React.ReactNode> = {
    ingredients: renderIngredientsSection,
    instructions: renderInstructionsSection,
    nutrition: renderNutritionSection,
    notes: renderNotesSection,
    "cooking-history": renderCookingHistorySection,
    reviews: () => null, // Reviews removed - ratings are now part of cooking history
  };

  // Check if section should be rendered (uses localLayoutPrefs for optimistic updates)
  const shouldRenderSection = (sectionId: RecipeSectionId): boolean => {
    // Reviews section removed - consolidated into cooking history
    if (sectionId === "reviews") return false;

    const config = localLayoutPrefs.sections[sectionId];
    // Defensive check for missing section config (schema migration edge case)
    if (!config || !config.visible) return false;

    // Additional conditional checks based on data availability
    switch (sectionId) {
      case "nutrition":
        return nutritionEnabled;
      case "notes":
        return !!recipe.notes;
      case "cooking-history":
        return localHistory.length > 0;
      default:
        return true;
    }
  };

  // Render all customizable sections based on layout preferences (uses localLayoutPrefs for optimistic updates)
  const renderDynamicSections = () => {
    const sections: React.ReactNode[] = [];
    let i = 0;

    while (i < localLayoutPrefs.sectionOrder.length) {
      const sectionId = localLayoutPrefs.sectionOrder[i];
      const config = localLayoutPrefs.sections[sectionId];

      // Skip if section config is missing or shouldn't render
      if (!config || !shouldRenderSection(sectionId)) {
        i++;
        continue;
      }

      // Check if this and next section are both half-width and visible
      const nextSectionId = localLayoutPrefs.sectionOrder[i + 1];
      const nextConfig = nextSectionId ? localLayoutPrefs.sections[nextSectionId] : null;
      const nextShouldRender = nextSectionId ? shouldRenderSection(nextSectionId) : false;

      const isHalf = config.width === "half";
      const nextIsHalf = nextConfig?.width === "half";

      if (isHalf && nextIsHalf && nextShouldRender) {
        // Render two half-width sections side-by-side
        sections.push(
          <div key={`${sectionId}-${nextSectionId}`}>
            <div className="border-t border-gray-300 dark:border-gray-600" />
            <div className="grid gap-8 md:grid-cols-2 pt-6">
              <div>{sectionRenderers[sectionId]()}</div>
              <div>{sectionRenderers[nextSectionId]()}</div>
            </div>
          </div>
        );
        i += 2;
      } else {
        // Render single full-width section
        sections.push(
          <div key={sectionId}>
            <div className="border-t border-gray-300 dark:border-gray-600" />
            <div className="pt-6">{sectionRenderers[sectionId]()}</div>
          </div>
        );
        i++;
      }
    }

    return sections;
  };

  return (
    <>
      {/* Single Card with All Recipe Info */}
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-gray-700 overflow-hidden">
        {/* Recipe Image Carousel */}
        {recipe.image_url && (
          <div className="relative">
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {/* Main Recipe Image */}
                <CarouselItem>
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                      priority
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Recipe info overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="flex gap-2">
                        {recipe.prep_time && (
                          <Badge className="bg-white/90 text-[#1A1A1A] backdrop-blur-sm">
                            <Clock className="size-3 mr-1" />
                            Prep: {recipe.prep_time}
                          </Badge>
                        )}
                        {recipe.cook_time && (
                          <Badge className="bg-white/90 text-[#1A1A1A] backdrop-blur-sm">
                            <ChefHat className="size-3 mr-1" />
                            Cook: {recipe.cook_time}
                          </Badge>
                        )}
                      </div>
                      {(recipe.servings || recipe.base_servings) && (
                        <Badge className="bg-[#D9F99D] text-[#1A1A1A]">
                          <Users className="size-3 mr-1" />
                          {recipe.servings || recipe.base_servings} servings
                        </Badge>
                      )}
                    </div>
                  </div>
                </CarouselItem>
                {/* Quick Stats Slide */}
                <CarouselItem>
                  <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#F5F5F5] via-[#EEEEEE] to-[#E8E8E8] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 flex items-center justify-center p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                      <div className="flex flex-col items-center gap-2 p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl backdrop-blur-sm">
                        <Clock className="size-8 text-[#D9F99D]" />
                        <span className="text-sm text-muted-foreground">Prep Time</span>
                        <span className="font-semibold">{recipe.prep_time || "N/A"}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl backdrop-blur-sm">
                        <ChefHat className="size-8 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Cook Time</span>
                        <span className="font-semibold">{recipe.cook_time || "N/A"}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl backdrop-blur-sm">
                        <Users className="size-8 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Servings</span>
                        <span className="font-semibold">{recipe.servings || recipe.base_servings || "N/A"}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl backdrop-blur-sm">
                        <UtensilsCrossed className="size-8 text-rose-500" />
                        <span className="text-sm text-muted-foreground">Ingredients</span>
                        <span className="font-semibold">{recipe.ingredients.length} items</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-white/80 backdrop-blur-sm hover:bg-white" />
              <CarouselNext className="right-4 bg-white/80 backdrop-blur-sm hover:bg-white" />
            </Carousel>
            {/* Carousel Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className="size-2 rounded-full bg-white/80" />
              <div className="size-2 rounded-full bg-white/40" />
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {getRecipeIcon(recipe.recipe_type)}
                <Badge variant="secondary">{recipe.recipe_type}</Badge>
                {recipe.category && (
                  <Badge variant="outline">{recipe.category}</Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-semibold text-[#1A1A1A] dark:text-white">
                {recipe.title}
              </CardTitle>
              {recipe.protein_type && (
                <CardDescription className="text-base">
                  {recipe.protein_type}
                </CardDescription>
              )}
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                {/* Rating Badge - Opens cooking history for rating */}
                {currentRating ? (
                  <RatingBadge
                    rating={currentRating}
                    size="md"
                    onClick={handleRatingClick}
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground/50 hover:text-yellow-500"
                        onClick={handleRatingClick}
                      >
                        <Star className="size-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rate this recipe</TooltipContent>
                  </Tooltip>
                )}

                {/* Favorite Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFavorite}
                      className={isFavorite ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`size-6 ${isFavorite ? "fill-current" : ""}`}
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
                          <MoreVertical className="size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/app/recipes/${recipe.id}/edit`)}>
                      <Edit className="size-4 mr-2" />
                      Edit Recipe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowLayoutCustomizer(true)}>
                      <LayoutGrid className="size-4 mr-2" />
                      Customize Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                      <Download className="size-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    {recipe.source_url && (
                      <DropdownMenuItem asChild>
                        <a
                          href={recipe.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          View Source
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Recipe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {recipe.prep_time && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>Prep: {recipe.prep_time}</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-1">
                <ChefHat className="size-4" />
                <span>Cook: {recipe.cook_time}</span>
              </div>
            )}
            {(recipe.servings || recipe.base_servings) && (
              <div className="flex items-center gap-1">
                <Users className="size-4" />
                <span>
                  Serves: {recipe.servings || recipe.base_servings}
                </span>
              </div>
            )}
            {lastCooked && (
              <div className="flex items-center gap-1">
                <History className="size-4" />
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
                <Globe className="size-4" />
                <span>Public</span>
              </div>
            )}
            {recipe.share_token && !recipe.is_public && (
              <div className="flex items-center gap-1 text-blue-600">
                <Link2 className="size-4" />
                <span>Link shared</span>
              </div>
            )}
            {(recipe.view_count || 0) > 0 && (recipe.is_public || recipe.share_token) && (
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                <span>{recipe.view_count} views</span>
              </div>
            )}
          </div>

          {/* User Allergen & Dietary Restriction Warning - Prominent */}
          {hasAnyWarnings && (
            <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-500">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription>
                <div className="flex flex-col">
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

          {/* Tags (filtered to remove duplicates from category/protein_type) */}
          {(() => {
            const displayTags = getDisplayTags(recipe);
            return displayTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  <Badge key={tag} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 dark:bg-gray-700 dark:text-gray-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null;
          })()}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {cookedToday ? (
              <Button
                variant="secondary"
                onClick={() => setShowCookedDialog(true)}
                className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
              >
                <CheckCircle2 className="mr-2 size-4" />
                Cooked Today
              </Button>
            ) : (
              <Button onClick={() => setShowCookedDialog(true)} className="bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]">
                <ChefHat className="mr-2 size-4" />
                I Made This!
              </Button>
            )}
            <Button variant="default" asChild className="bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]">
              <Link href={`/app/recipes/${recipe.id}/cook`}>
                <Play className="mr-2 size-4" />
                Start Cooking Mode
              </Link>
            </Button>
            <Button variant="default" onClick={() => setShowShareDialog(true)} className="bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]">
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>

          {/* Dynamic Sections based on layout preferences */}
          {renderDynamicSections()}
        </CardContent>
      </Card>

      {/* Mark as Cooked Dialog */}
      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={showCookedDialog}
        onOpenChange={setShowCookedDialog}
        onSuccess={handleCookedSuccess}
      />

      {/* Edit Cooking History Dialog */}
      {editingHistoryEntry && (
        <EditCookingHistoryDialog
          entry={editingHistoryEntry}
          open={!!editingHistoryEntry}
          onOpenChange={(open) => !open && setEditingHistoryEntry(null)}
          onSuccess={handleEditHistorySuccess}
        />
      )}

      {/* Delete Cooking History Confirmation Dialog */}
      <AlertDialog
        open={!!deleteHistoryEntryId}
        onOpenChange={(open) => !open && setDeleteHistoryEntryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cooking Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this cooking history entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHistoryEntry}
              disabled={isDeletingHistoryEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingHistoryEntry ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <RecipeExportOnlyDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        recipe={{ ...recipe, nutrition: localNutrition }}
      />

      {/* Share Dialog */}
      <RecipeShareDialog
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

      {/* Layout Customizer Dialog */}
      <RecipeLayoutCustomizer
        open={showLayoutCustomizer}
        onOpenChange={setShowLayoutCustomizer}
        layoutPrefs={localLayoutPrefs}
        onUpdate={handleLayoutUpdate}
      />
    </>
  );
}
