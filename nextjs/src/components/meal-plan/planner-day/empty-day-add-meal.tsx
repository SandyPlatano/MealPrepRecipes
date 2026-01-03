import { useState } from "react";
import { Plus, Zap, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface EmptyDayAddMealProps {
  recipes: Recipe[];
  recentRecipeIds: string[];
  onQuickAdd: (recipeId: string) => Promise<void>;
  onOpenFullPicker: () => void;
  disabled?: boolean;
  density?: "compact" | "comfortable" | "spacious";
}

export function EmptyDayAddMeal({
  recipes,
  recentRecipeIds,
  onQuickAdd,
  onOpenFullPicker,
  disabled = false,
  density,
}: EmptyDayAddMealProps) {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get the last 5 recently-cooked recipes
  const recentRecipes = recentRecipeIds
    .slice(0, 5)
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => r !== undefined);

  const handleQuickAdd = async (recipeId: string) => {
    setIsAdding(recipeId);
    try {
      await onQuickAdd(recipeId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error quick-adding recipe:", error);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#D9F99D] hover:bg-[#D9F99D]/10 transition-all group/empty flex-1 min-h-0",
        density === "compact" ? "py-2 md:py-3" : "py-3 md:py-4",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Main clickable area - opens full picker */}
      <button
        type="button"
        onClick={onOpenFullPicker}
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full"
      >
        <div className="size-8 rounded-full bg-gray-100 group-hover/empty:bg-[#D9F99D]/20 flex items-center justify-center transition-colors">
          <Plus className="size-4 text-gray-600 group-hover/empty:text-[#1A1A1A] transition-colors" />
        </div>
        <span className="text-xs text-gray-600 group-hover/empty:text-[#1A1A1A] transition-colors">
          Add meal
        </span>
      </button>

      {/* Quick-add dropdown in corner - only if recent recipes exist */}
      {recentRecipes.length > 0 && (
        <div className="absolute bottom-2 right-2">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "h-8 px-2 gap-1 text-xs rounded-md",
                  "hover:bg-[#D9F99D]/20 hover:text-[#1A1A1A] transition-colors",
                  "opacity-60 group-hover/empty:opacity-100"
                )}
              >
                <Zap className="size-3.5 text-amber-500" />
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Quick Add Recent
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentRecipes.map((recipe) => (
                <DropdownMenuItem
                  key={recipe.id}
                  onClick={() => handleQuickAdd(recipe.id)}
                  disabled={isAdding !== null}
                  className={cn(
                    "flex flex-col items-start gap-0.5 py-2.5 cursor-pointer",
                    isAdding === recipe.id && "opacity-50"
                  )}
                >
                  <span className="font-medium truncate w-full">{recipe.title}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {recipe.recipe_type}
                    {recipe.prep_time && (
                      <>
                        <span>•</span>
                        {recipe.prep_time}
                      </>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullPicker();
                }}
                className="text-muted-foreground"
              >
                <Plus className="size-4 mr-2" />
                Browse all recipes...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
