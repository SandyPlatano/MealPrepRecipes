"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecipeDetailState, type CookingHistoryEntry } from "@/hooks/use-recipe-detail-state";
import {
  RecipeDetailIngredients,
  RecipeDetailInstructions,
  RecipeDetailNutrition,
  RecipeDetailHistory,
  RecipeDetailNotes,
} from "./recipe-detail/index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Share2,
  Globe,
  Link2,
  Eye,
  CheckCircle2,
  Star,
  LayoutGrid,
  AlertTriangle,
  Apple,
  FileText,
  CalendarDays,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { RatingBadge } from "@/components/ui/rating-badge";
import { formatDistanceToNow } from "date-fns";
import { detectAllergens, mergeAllergens, getAllergenDisplayName, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";
import type { Recipe, RecipeType } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import type { Substitution } from "@/lib/substitutions";
import type { RecipeLayoutPreferences, RecipeSectionId } from "@/types/recipe-layout";
import { DEFAULT_RECIPE_LAYOUT_PREFERENCES } from "@/types/recipe-layout";

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

// ============================================================================
// Utility Functions
// ============================================================================

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

function getDisplayTags(recipe: Recipe): string[] {
  const excludedValues = new Set<string>();

  if (recipe.recipe_type) {
    excludedValues.add(recipe.recipe_type.toLowerCase());
  }
  if (recipe.category) {
    excludedValues.add(recipe.category.toLowerCase());
  }
  if (recipe.protein_type) {
    excludedValues.add(recipe.protein_type.toLowerCase());
  }

  return recipe.tags.filter(
    (tag) => !excludedValues.has(tag.toLowerCase())
  );
}

function getSectionDisplayName(sectionId: RecipeSectionId): string {
  switch (sectionId) {
    case "nutrition": return "Nutrition";
    case "notes": return "Notes";
    case "cooking-history": return "History";
    default: return sectionId;
  }
}

function getSectionIcon(sectionId: RecipeSectionId): React.ReactNode {
  switch (sectionId) {
    case "nutrition": return <Apple className="size-4" />;
    case "notes": return <FileText className="size-4" />;
    case "cooking-history": return <CalendarDays className="size-4" />;
    default: return null;
  }
}

// ============================================================================
// Component Props
// ============================================================================

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

// ============================================================================
// Main Component
// ============================================================================

export function RecipeDetail({
  recipe,
  isFavorite: initialIsFavorite,
  history,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  nutrition = null,
  nutritionEnabled = false,
  substitutions = new Map(),
  userUnitSystem = "imperial",
  layoutPrefs = DEFAULT_RECIPE_LAYOUT_PREFERENCES,
}: RecipeDetailProps) {
  const isMobile = useIsMobile();

  const { state, dialogs, actions, router } = useRecipeDetailState({
    recipe,
    initialIsFavorite,
    history,
    nutrition,
    layoutPrefs,
    userUnitSystem,
  });

  // Allergen detection
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const allergens = mergeAllergens(detectedAllergens, recipe.allergen_tags || []);
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) => userAllergenAlerts.includes(allergen));
  const matchingCustomRestrictions = hasCustomRestrictions(recipe.ingredients, customDietaryRestrictions);
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;

  // Section rendering configuration
  const primarySections: RecipeSectionId[] = ["ingredients", "instructions"];
  const secondarySections: RecipeSectionId[] = ["nutrition", "notes", "cooking-history"];

  const shouldRenderSection = (sectionId: RecipeSectionId): boolean => {
    if (sectionId === "reviews") return false;

    const config = state.localLayoutPrefs.sections[sectionId];
    if (!config || !config.visible) return false;

    switch (sectionId) {
      case "nutrition":
        return nutritionEnabled;
      case "notes":
        return !!recipe.notes;
      case "cooking-history":
        return state.localHistory.length > 0;
      default:
        return true;
    }
  };

  // Section renderers using sub-components
  const sectionRenderers: Record<RecipeSectionId, () => React.ReactNode> = {
    ingredients: () => (
      <RecipeDetailIngredients
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        ingredients={recipe.ingredients}
        displayIngredients={state.displayIngredients}
        baseServings={recipe.base_servings}
        currentServings={state.currentServings}
        servingsInputValue={state.servingsInputValue}
        canScale={state.canScale}
        effectiveUnitSystem={state.effectiveUnitSystem}
        checkedIngredients={state.checkedIngredients}
        substitutions={substitutions}
        showAddIngredientsDialog={dialogs.showAddIngredientsDialog}
        isAddingIngredients={state.isAddingIngredients}
        onToggleIngredientCheck={actions.toggleIngredientCheck}
        onSetServingsPreset={actions.setServingsPreset}
        onServingsInputChange={actions.handleServingsInputChange}
        onServingsInputBlur={actions.handleServingsInputBlur}
        onSetLocalUnitSystem={actions.setLocalUnitSystem}
        onShowAddIngredientsDialog={dialogs.setShowAddIngredientsDialog}
        onAddAllIngredients={actions.handleAddAllIngredients}
      />
    ),
    instructions: () => (
      <RecipeDetailInstructions
        instructions={recipe.instructions}
        completedSteps={state.completedSteps}
        onToggleStepCompletion={actions.toggleStepCompletion}
      />
    ),
    nutrition: () => (
      <RecipeDetailNutrition
        recipeId={recipe.id}
        nutrition={state.localNutrition}
        baseServings={recipe.base_servings}
        isExtractingNutrition={state.isExtractingNutrition}
        isMobile={isMobile}
        onExtractNutrition={actions.handleExtractNutrition}
      />
    ),
    notes: () => <RecipeDetailNotes notes={recipe.notes} />,
    "cooking-history": () => (
      <RecipeDetailHistory
        history={state.localHistory}
        onEditEntry={actions.setEditingHistoryEntry}
        onDeleteEntry={actions.setDeleteHistoryEntryId}
      />
    ),
    reviews: () => null,
  };

  // Render secondary sections as Tabs (desktop) or Accordion (mobile)
  const renderSecondaryContent = () => {
    const visibleSecondarySections = secondarySections.filter(shouldRenderSection);
    if (visibleSecondarySections.length === 0) return null;

    const defaultTab = visibleSecondarySections[0];

    if (isMobile) {
      return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-600 pt-8">
          <Accordion type="multiple" className="w-full space-y-2">
            {visibleSecondarySections.map((sectionId) => (
              <AccordionItem
                key={sectionId}
                value={sectionId}
                className="bg-[#F5F5F0] dark:bg-slate-700/50 rounded-xl border-0 px-4 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-white font-semibold">
                    {getSectionIcon(sectionId)}
                    {getSectionDisplayName(sectionId)}
                    {sectionId === "nutrition" && (
                      <Badge className="bg-[#D9F99D]/20 text-[#1A1A1A] dark:text-white border-0 text-xs ml-1">
                        Per Serving
                      </Badge>
                    )}
                    {sectionId === "cooking-history" && state.localHistory.length > 0 && (
                      <Badge className="bg-[#D9F99D]/20 text-[#1A1A1A] dark:text-white border-0 text-xs ml-1">
                        {state.localHistory.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {sectionRenderers[sectionId]()}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    return (
      <div className="mt-8 border-t border-gray-200 dark:border-gray-600 pt-8">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="bg-[#F5F5F0] dark:bg-slate-700/50 rounded-full p-1 h-auto w-fit">
            {visibleSecondarySections.map((sectionId) => (
              <TabsTrigger
                key={sectionId}
                value={sectionId}
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  {getSectionIcon(sectionId)}
                  {getSectionDisplayName(sectionId)}
                  {sectionId === "cooking-history" && state.localHistory.length > 0 && (
                    <Badge className="bg-[#D9F99D] text-[#1A1A1A] border-0 text-xs ml-1 rounded-full size-5 p-0 flex items-center justify-center">
                      {state.localHistory.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleSecondarySections.map((sectionId) => (
            <TabsContent key={sectionId} value={sectionId} className="mt-6">
              <div className="bg-[#F5F5F0]/50 dark:bg-slate-700/30 rounded-xl p-6">
                {sectionRenderers[sectionId]()}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  // Render all customizable sections based on layout preferences
  const renderDynamicSections = () => {
    const sections: React.ReactNode[] = [];
    let i = 0;

    while (i < state.localLayoutPrefs.sectionOrder.length) {
      const sectionId = state.localLayoutPrefs.sectionOrder[i];
      const config = state.localLayoutPrefs.sections[sectionId];

      if (!config || !shouldRenderSection(sectionId)) {
        i++;
        continue;
      }

      if (secondarySections.includes(sectionId)) {
        i++;
        continue;
      }

      const nextSectionId = state.localLayoutPrefs.sectionOrder[i + 1];
      const nextConfig = nextSectionId ? state.localLayoutPrefs.sections[nextSectionId] : null;
      const nextShouldRender = nextSectionId ? shouldRenderSection(nextSectionId) : false;
      const nextIsSecondary = nextSectionId ? secondarySections.includes(nextSectionId) : false;

      const isHalf = config.width === "half";
      const nextIsHalf = nextConfig?.width === "half";

      if (isHalf && nextIsHalf && nextShouldRender && !nextIsSecondary) {
        sections.push(
          <div key={`${sectionId}-${nextSectionId}`}>
            <div className="border-t border-gray-200 dark:border-gray-600" />
            <div className="grid gap-8 md:grid-cols-2 pt-8">
              <div>{sectionRenderers[sectionId]()}</div>
              <div>{sectionRenderers[nextSectionId]()}</div>
            </div>
          </div>
        );
        i += 2;
      } else {
        sections.push(
          <div key={sectionId}>
            <div className="border-t border-gray-200 dark:border-gray-600" />
            <div className="pt-8">{sectionRenderers[sectionId]()}</div>
          </div>
        );
        i++;
      }
    }

    const secondaryContent = renderSecondaryContent();
    if (secondaryContent) {
      sections.push(<div key="secondary-content">{secondaryContent}</div>);
    }

    return sections;
  };

  return (
    <>
      {/* Single Card with All Recipe Info */}
      <Card className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#D9F99D] shadow-sm dark:bg-slate-800 dark:border-gray-700 dark:border-l-[#D9F99D] overflow-hidden">
        {/* Recipe Image Carousel */}
        {recipe.image_url && (
          <div className="relative">
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className="size-2 rounded-full bg-white/80" />
              <div className="size-2 rounded-full bg-white/40" />
            </div>
          </div>
        )}

        {/* Smart Allergen Banner */}
        {hasAnyWarnings && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 size-10 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Contains items you&apos;ve flagged</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {matchingAllergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
                    >
                      {getAllergenDisplayName(allergen)}
                    </span>
                  ))}
                  {matchingCustomRestrictions.map((restriction) => (
                    <span
                      key={restriction}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
                    >
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
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
                {state.currentRating ? (
                  <RatingBadge
                    rating={state.currentRating}
                    size="md"
                    onClick={actions.handleRatingClick}
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground/50 hover:text-yellow-500"
                        onClick={actions.handleRatingClick}
                      >
                        <Star className="size-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rate this recipe</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={actions.handleToggleFavorite}
                      className={state.isFavorite ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`size-6 ${state.isFavorite ? "fill-current" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {state.isFavorite ? "Remove from favorites" : "Add to favorites"}
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
                    <DropdownMenuItem onClick={() => dialogs.setShowLayoutCustomizer(true)}>
                      <LayoutGrid className="size-4 mr-2" />
                      Customize Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dialogs.setShowExportDialog(true)}>
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
                      onClick={() => dialogs.setDeleteDialogOpen(true)}
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
            {state.lastCooked && (
              <div className="flex items-center gap-1">
                <History className="size-4" />
                <span>
                  Last made{" "}
                  {formatDistanceToNow(new Date(state.lastCooked), {
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

          {/* Tags */}
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
            {state.cookedToday ? (
              <Button
                variant="secondary"
                onClick={() => dialogs.setShowCookedDialog(true)}
                className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
              >
                <CheckCircle2 className="mr-2 size-4" />
                Cooked Today
              </Button>
            ) : (
              <Button onClick={() => dialogs.setShowCookedDialog(true)} className="bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]">
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
            <Button variant="default" onClick={() => dialogs.setShowShareDialog(true)} className="bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]">
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>

          {/* Dynamic Sections */}
          {renderDynamicSections()}
        </CardContent>
      </Card>

      {/* Mobile Sticky Actions Footer */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 p-3 shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1)]">
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dialogs.setShowShareDialog(true)}
              className="flex-1 rounded-full"
            >
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="flex-1 bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A] rounded-full"
            >
              <Link href={`/app/recipes/${recipe.id}/cook`}>
                <Play className="mr-2 size-4" />
                Cook Now
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dialogs.setShowCookedDialog(true)}
              className="flex-1 rounded-full"
            >
              <ChefHat className="mr-2 size-4" />
              Made It
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for mobile sticky footer */}
      {isMobile && <div className="h-20" />}

      {/* Dialogs */}
      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={dialogs.showCookedDialog}
        onOpenChange={dialogs.setShowCookedDialog}
        onSuccess={actions.handleCookedSuccess}
      />

      {state.editingHistoryEntry && (
        <EditCookingHistoryDialog
          entry={state.editingHistoryEntry}
          open={!!state.editingHistoryEntry}
          onOpenChange={(open) => !open && actions.setEditingHistoryEntry(null)}
          onSuccess={actions.handleEditHistorySuccess}
        />
      )}

      <AlertDialog
        open={!!state.deleteHistoryEntryId}
        onOpenChange={(open) => !open && actions.setDeleteHistoryEntryId(null)}
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
              onClick={actions.handleDeleteHistoryEntry}
              disabled={state.isDeletingHistoryEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {state.isDeletingHistoryEntry ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RecipeExportOnlyDialog
        open={dialogs.showExportDialog}
        onOpenChange={dialogs.setShowExportDialog}
        recipe={{ ...recipe, nutrition: state.localNutrition }}
      />

      <RecipeShareDialog
        open={dialogs.showShareDialog}
        onOpenChange={dialogs.setShowShareDialog}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        isPublic={recipe.is_public || false}
        shareToken={recipe.share_token || null}
        viewCount={recipe.view_count || 0}
      />

      <AlertDialog open={dialogs.deleteDialogOpen} onOpenChange={dialogs.setDeleteDialogOpen}>
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
              onClick={actions.handleDelete}
              disabled={state.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {state.isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RecipeLayoutCustomizer
        open={dialogs.showLayoutCustomizer}
        onOpenChange={dialogs.setShowLayoutCustomizer}
        layoutPrefs={state.localLayoutPrefs}
        onUpdate={actions.handleLayoutUpdate}
      />
    </>
  );
}
