import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, ChevronDown, Copy, ClipboardPaste, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { RecipePreviewPopover } from "../recipe-preview-popover";
import { QuickAddDropdown } from "../quick-add-dropdown";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface HorizontalLayoutProps {
  dayNumber: number;
  dayAbbrev: string;
  monthAbbrev: string;
  isToday: boolean;
  isPast: boolean;
  isPending: boolean;
  assignments: MealAssignmentWithRecipe[];
  recipes: Recipe[];
  recentRecipeIds: string[];
  cookNames: string[];
  cookColors: Record<string, string>;
  nutritionData?: Map<string, RecipeNutrition> | null;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onRemoveMeal: (assignmentId: string) => Promise<void>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onAddMeal: (recipeId: string, day: DayOfWeek) => Promise<void>;
  setModalOpen: (open: boolean) => void;
  day: DayOfWeek;
  onCopyDay?: (day: DayOfWeek) => void;
  onPasteDay?: (day: DayOfWeek) => void;
  onClearDay?: (day: DayOfWeek) => Promise<void>;
  canPaste?: boolean;
}

export function HorizontalLayout({
  dayNumber,
  dayAbbrev,
  monthAbbrev,
  isToday,
  isPast,
  isPending,
  assignments,
  recipes,
  recentRecipeIds,
  cookNames,
  cookColors,
  nutritionData = null,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onRemoveMeal,
  onUpdateCook,
  onAddMeal,
  setModalOpen,
  day,
  onCopyDay,
  onPasteDay,
  onClearDay,
  canPaste = false,
}: HorizontalLayoutProps) {
  // Default colors for cooks (fallback)
  const defaultColors = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={isSelectionMode}>
        <Card
          className={cn(
            "group relative transition-all h-full bg-[#FAFAF8] shadow-md",
            isToday && "ring-2 ring-primary shadow-lg",
            isPast && "opacity-60",
            isSelectionMode && isSelected && "ring-2 ring-[#D9F99D] bg-[#D9F99D]/10",
            isPending && "opacity-50"
          )}
          onClick={isSelectionMode ? onToggleSelection : undefined}
        >
          <CardContent className="flex items-center gap-2 md:gap-3 p-2 md:p-3 h-full min-h-0">
            {/* Date badge - left side */}
            <div
              className={cn(
                "flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-[70px] md:min-w-[80px]",
                isToday && "text-primary",
                isSelectionMode && "cursor-pointer"
              )}
              onClick={isSelectionMode ? (e) => { e.stopPropagation(); onToggleSelection?.(); } : undefined}
            >
              {/* Selection Checkbox */}
              {isSelectionMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection?.();
                  }}
                  className={cn(
                    "size-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                    isSelected
                      ? "bg-[#D9F99D] border-[#D9F99D] text-[#1A1A1A]"
                      : "border-gray-300 hover:border-[#D9F99D]"
                  )}
                  aria-label={isSelected ? "Deselect day" : "Select day"}
                >
                  {isSelected && <Check className="size-3" />}
                </button>
              )}

              <div className="flex items-baseline gap-1.5">
                <span className="text-lg md:text-xl font-bold font-mono leading-none">
                  {dayNumber}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide leading-none">
                    {dayAbbrev}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground leading-none">
                    {monthAbbrev}
                  </span>
                </div>
              </div>
              {isToday && (
                <Badge variant="default" className="text-[8px] md:text-[9px] px-1.5 py-0 h-4">
                  Today
                </Badge>
              )}
            </div>

            {/* CENTER: Meals content - grows to fill, centered when empty */}
            <div className={cn(
              "flex-1 flex flex-col gap-2 min-w-0 overflow-y-auto",
              assignments.length === 0 && "items-center justify-center"
            )}>
              {assignments.length === 0 ? (
                isPast ? (
                  <span className="text-sm text-muted-foreground">No meals</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-gray-300",
                      "hover:border-[#D9F99D] hover:bg-[#D9F99D]/10 transition-all text-sm text-gray-600",
                      "hover:text-[#1A1A1A]"
                    )}
                  >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Add meal</span>
                  </button>
                )
              ) : (
                <>
                  {/* Stack all meals vertically - Two-Row Metadata Layout */}
                  {assignments.map((assignment) => {
                    const cookColor = assignment.cook
                      ? cookColors[assignment.cook] || defaultColors[cookNames.indexOf(assignment.cook) % defaultColors.length]
                      : null;

                    // Meal type colors for left border
                    const mealTypeColors: Record<string, string> = {
                      breakfast: "#FDE047",
                      lunch: "#86EFAC",
                      dinner: "#93C5FD",
                    };
                    const mealTypeColor = assignment.meal_type
                      ? mealTypeColors[assignment.meal_type] || "#E5E7EB"
                      : "#E5E7EB";
                    const mealTypeLabel = assignment.meal_type
                      ? assignment.meal_type.charAt(0).toUpperCase() + assignment.meal_type.slice(1)
                      : "Meal";

                    return (
                      <div
                        key={assignment.id}
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
                        style={{ borderLeftWidth: '4px', borderLeftColor: mealTypeColor }}
                      >
                        {/* Row 1: Recipe title + action icons */}
                        <div className="flex items-center justify-between">
                          <RecipePreviewPopover
                            recipe={assignment.recipe}
                            nutrition={nutritionData?.get(assignment.recipe_id) || null}
                          >
                            <span className="font-medium text-sm truncate hover:underline cursor-pointer">
                              {assignment.recipe.title}
                            </span>
                          </RecipePreviewPopover>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
                              <Button variant="ghost" size="icon" className="size-7">
                                <Eye className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                onRemoveMeal(assignment.id);
                                setModalOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => onRemoveMeal(assignment.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Row 2: Meal type + cook selector */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: mealTypeColor }}
                            />
                            {mealTypeLabel}
                          </span>
                          <span>•</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                  style={{ backgroundColor: cookColor || "#9CA3AF" }}
                                >
                                  {assignment.cook ? assignment.cook[0].toUpperCase() : "?"}
                                </span>
                                <span>{assignment.cook || "No cook"}</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={() => onUpdateCook(assignment.id, null)}
                              >
                                No cook
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {cookNames.map((name) => {
                                const color = cookColors[name] || defaultColors[cookNames.indexOf(name) % defaultColors.length];
                                return (
                                  <DropdownMenuItem
                                    key={name}
                                    onClick={() => onUpdateCook(assignment.id, name)}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                        style={{ backgroundColor: color }}
                                      >
                                        {name[0].toUpperCase()}
                                      </span>
                                      {name}
                                    </span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                  {/* Add more button */}
                  {!isPast && (
                    <QuickAddDropdown
                      recipes={recipes}
                      recentRecipeIds={recentRecipeIds}
                      onQuickAdd={async (recipeId) => {
                        await onAddMeal(recipeId, day);
                      }}
                      onOpenFullPicker={() => setModalOpen(true)}
                      disabled={isPending}
                      compact
                    />
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={() => onCopyDay?.(day)}
          disabled={assignments.length === 0}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy day
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onPasteDay?.(day)}
          disabled={!canPaste || isPast}
        >
          <ClipboardPaste className="mr-2 h-4 w-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => setModalOpen(true)}
          disabled={isPast}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add meal
          <ContextMenuShortcut>A</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onClearDay?.(day)}
          disabled={assignments.length === 0}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear day
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
