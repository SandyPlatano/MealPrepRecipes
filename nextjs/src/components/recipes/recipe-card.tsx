"use client";

import { useState, memo, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Download,
  Trash2,
  UtensilsCrossed,
  Cookie,
  Croissant,
  Coffee,
  IceCream,
  Salad,
  Users,
  MoreVertical,
  ChefHat,
  Edit,
  Plus,
  Share2,
  AlertTriangle,
  FolderPlus,
  Star,
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
import { toggleFavorite, deleteRecipe } from "@/app/actions/recipes";
import { RatingBadge } from "@/components/ui/rating-badge";
import { PersonalRatingDialog } from "@/components/recipes/personal-rating-dialog";
import type { RecipeWithFavorite, RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";
import type { FolderWithChildren } from "@/types/folder";
import { useCart } from "@/components/cart";
import { AddToPlanSheet } from "./add-to-plan-sheet";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { MarkCookedDialog } from "./mark-cooked-dialog";
import { ShareExportSheet } from "./share-export-sheet";
import Image from "next/image";
import { detectAllergens, mergeAllergens, getAllergenDisplayName, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";
import { triggerHaptic } from "@/lib/haptics";
import { calculateCustomBadges, getBadgeColorClasses, type CustomBadge } from "@/lib/nutrition/badge-calculator";
import { cn } from "@/lib/utils";

// Get icon based on recipe type
function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="h-4 w-4" />;
    case "Breakfast":
      return <Coffee className="h-4 w-4" />;
    case "Dessert":
      return <IceCream className="h-4 w-4" />;
    case "Snack":
      return <Croissant className="h-4 w-4" />;
    case "Side Dish":
      return <Salad className="h-4 w-4" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="h-4 w-4" />;
  }
}


interface RecipeCardProps {
  recipe: RecipeWithFavoriteAndNutrition;
  lastMadeDate?: string | null;
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  /** Animation delay index for staggered animations (multiplied by 50ms) */
  animationIndex?: number;
  /** Available folders for "Add to Folder" feature */
  folders?: FolderWithChildren[];
  /** Callback when user clicks "Add to Folders" */
  onAddToFolder?: (recipeId: string) => void;
}

export const RecipeCard = memo(function RecipeCard({ recipe, lastMadeDate, userAllergenAlerts = [], customDietaryRestrictions = [], customBadges = [], animationIndex, folders = [], onAddToFolder }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [currentRating, setCurrentRating] = useState<number | null>(recipe.rating);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate which nutrition badges apply to this recipe
  const nutritionBadges = calculateCustomBadges(recipe.nutrition || null, customBadges);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [customInput, setCustomInput] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { addToCart, addToCartWithAssignment, removeByRecipeId, isInCart } = useCart();
  const inCart = isInCart(recipe.id);
  const [showAddToPlanSheet, setShowAddToPlanSheet] = useState(false);
  const canScale = recipe.base_servings !== null && recipe.base_servings > 0;
  const router = useRouter();

  // Detect allergens
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const allergens = mergeAllergens(detectedAllergens, recipe.allergen_tags || []);
  
  // Check if recipe contains user's allergens
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) => userAllergenAlerts.includes(allergen));
  
  // Check for custom dietary restrictions
  const matchingCustomRestrictions = hasCustomRestrictions(recipe.ingredients, customDietaryRestrictions);
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;
  const allWarnings = [...matchingAllergens.map(getAllergenDisplayName), ...matchingCustomRestrictions];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if already in cart first
    if (inCart) {
      toast.info("Already on there");
      return;
    }
    // Open the sheet to select day and cook
    setShowAddToPlanSheet(true);
  };

  const handleAddFromSheet = (day: DayOfWeek, cook: string | null, servingSize: number | null) => {
    const added = addToCartWithAssignment(recipe, day, cook, servingSize);
    if (added) {
      triggerHaptic("success");
      const servingsText = servingSize ? ` (${servingSize} servings)` : "";
      const message = cook
        ? `Added to ${day} for ${cook}${servingsText}`
        : `Added to ${day}${servingsText}`;
      toast.success(message);
    } else {
      toast.info("Already on there");
    }
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeByRecipeId(recipe.id);
    toast.success("Removed");
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    triggerHaptic("light");

    // Optimistic update for instant UI feedback
    const optimisticState = !isFavorite;
    setIsFavorite(optimisticState);

    startTransition(async () => {
      const result = await toggleFavorite(recipe.id);
      if (!result.error) {
        setIsFavorite(result.isFavorite);
        toast.success(
          result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
        );
      } else {
        // Revert on error
        setIsFavorite(!optimisticState);
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
              Serves: ${recipe.servings || "N/A"}
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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // Remove from cart if it's in cart
    if (inCart) {
      removeByRecipeId(recipe.id);
    }
    
    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);
      if (result.error) {
        console.error("Failed to delete:", result.error);
        toast.error("Failed to delete recipe");
        setIsDeleting(false);
      } else {
        toast.success("Recipe deleted");
      }
      setDeleteDialogOpen(false);
    });
  };

  const handleMultiplierChange = (multiplier: number) => {
    setServingMultiplier(multiplier);
    setShowCustomInput(false);
    setCustomInput("");
  };

  const handleCustomSubmit = () => {
    const value = parseFloat(customInput);
    if (value > 0) {
      setServingMultiplier(value);
      setShowCustomInput(false);
    } else {
      toast.error("Enter a valid number");
    }
  };

  return (
    <>
      <Link href={`/app/recipes/${recipe.id}`}>
        <Card
          className="hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col h-full cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary/20 animate-slide-up-fade"
          style={animationIndex !== undefined ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: 'backwards' } : undefined}
        >
          {/* Recipe Image - only show if image exists */}
          {recipe.image_url && (
            <div className="relative w-full h-48 overflow-hidden bg-muted">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMiMVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAAAAQIDEUH/2gAMAwEAAhEDEQA/ALTce5Nw6XfRWOnWtjJAkccjGaN2LFhnHDDjgce/dSX9x73/AGb/AHfz/Sla1FNRlpHD9J//2Q=="
              />
            </div>
          )}

          {/* Allergen & Dietary Restriction Warning Banner */}
          {hasAnyWarnings && (
            <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Contains items you&apos;ve flagged
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {allWarnings.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Nutrition Badges */}
          {nutritionBadges.length > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b">
              {nutritionBadges.map((badge) => {
                const colors = getBadgeColorClasses(badge.color);
                return (
                  <span
                    key={badge.key}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                    title={badge.description}
                  >
                    {badge.label}
                  </span>
                );
              })}
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{recipe.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    {getRecipeIcon(recipe.recipe_type)}
                    {recipe.recipe_type}
                  </span>
                  {recipe.category && (
                    <>
                      <span>•</span>
                      <span>{recipe.category}</span>
                    </>
                  )}
                  {recipe.prep_time && (
                    <>
                      <span>•</span>
                      <span>{recipe.prep_time} prep</span>
                    </>
                  )}
                  {lastMadeDate && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        Made{" "}
                        {formatDistanceToNow(new Date(lastMadeDate), {
                          addSuffix: true,
                        })}
                      </Badge>
                    </>
                  )}
                </CardDescription>
              </div>
              <div
                className="flex items-center gap-1 ml-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Rating Button */}
                {currentRating ? (
                  <RatingBadge
                    rating={currentRating}
                    size="sm"
                    onClick={() => setShowRatingDialog(true)}
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-yellow-500"
                        onClick={() => setShowRatingDialog(true)}
                      >
                        <Star className="h-4 w-4" />
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
                      disabled={isPending}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite ? "fill-current" : ""} ${isPending ? "opacity-50" : ""}`}
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
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    {!inCart && (
                      <DropdownMenuItem onClick={handleAddToCart}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add to This Week
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Recipe
                    </DropdownMenuItem>
                    {onAddToFolder && (
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddToFolder(recipe.id);
                      }}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Add to Folders
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCookedDialog(true);
                    }}>
                      <ChefHat className="h-4 w-4 mr-2" />
                      Mark as Cooked
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/app/recipes/${recipe.id}/edit`);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Recipe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Recipe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Key Ingredients:</p>
              <p className="text-sm text-muted-foreground">
                {recipe.ingredients.slice(0, 5).join(", ")}
                {recipe.ingredients.length > 5 && "..."}
              </p>
            </div>
            
            {/* Serving Size */}
            {(recipe.base_servings !== null && recipe.base_servings > 0) || recipe.servings ? (
              <div className="mt-3 mb-2" onClick={(e) => e.preventDefault()}>
                {canScale ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Serving size:</span>
                      </div>
                      <span className="text-xs font-medium">
                        {recipe.base_servings! * servingMultiplier}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((mult) => (
                        <Button
                          key={mult}
                          variant={servingMultiplier === mult ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMultiplierChange(mult);
                          }}
                        >
                          {mult}x
                        </Button>
                      ))}
                      {!showCustomInput ? (
                        <Button
                          variant={![1, 2, 3, 4].includes(servingMultiplier) ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowCustomInput(true);
                          }}
                        >
                          {![1, 2, 3, 4].includes(servingMultiplier)
                            ? `${servingMultiplier}x`
                            : "Custom"}
                        </Button>
                      ) : (
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="x"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCustomSubmit();
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowCustomInput(false);
                              setCustomInput("");
                            }
                          }}
                          onBlur={handleCustomSubmit}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="flex-1 h-7 text-xs px-2"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Serving size:</span>
                    <span className="font-medium">{recipe.servings || "N/A"}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 mb-2">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Serving size:</span>
                  <span className="font-medium text-muted-foreground">N/A</span>
                </div>
              </div>
            )}
            
            {inCart ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full mt-4 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                    onClick={handleRemoveFromCart}
                  >
                    Remove from Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove this recipe from your meal plan</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" className="w-full mt-4 hover:scale-105 transition-transform" onClick={handleAddToCart}>
                    Add to Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add this recipe to your weekly meal plan</TooltipContent>
              </Tooltip>
            )}
          </CardContent>
        </Card>
      </Link>

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

      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={showCookedDialog}
        onOpenChange={setShowCookedDialog}
      />

      <PersonalRatingDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        currentRating={currentRating}
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        onRated={setCurrentRating}
      />

      <ShareExportSheet
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        recipe={recipe}
        isPublic={recipe.is_public ?? false}
        shareToken={recipe.share_token ?? null}
        viewCount={recipe.view_count ?? 0}
      />

      <AddToPlanSheet
        recipe={recipe}
        isOpen={showAddToPlanSheet}
        onClose={() => setShowAddToPlanSheet(false)}
        onAdd={handleAddFromSheet}
      />
    </>
  );
});
