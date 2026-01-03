import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeCardActionsProps {
  isFavorite: boolean;
  isPending: boolean;
  isAddingToPlan: boolean;
  isMobile: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export function RecipeCardActions({
  isFavorite,
  isPending,
  isAddingToPlan,
  isMobile,
  onToggleFavorite,
  onAddToCart,
}: RecipeCardActionsProps) {
  return (
    <div className="mt-auto flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            className={cn(
              "flex-1 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white font-medium text-sm shadow-sm hover:shadow-md transition-all",
              isMobile && "h-12"
            )}
            onClick={onAddToCart}
            disabled={isAddingToPlan}
          >
            {isAddingToPlan ? "Adding..." : "Add to Plan"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add this recipe to your weekly meal plan</TooltipContent>
      </Tooltip>

      {/* Favorite Button - rounded to match card */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "shrink-0 rounded-full border border-gray-200 transition-all duration-200",
              isMobile && "size-12",
              isFavorite
                ? "bg-red-50 border-red-200 text-red-500"
                : "hover:bg-red-50 hover:border-red-200 hover:text-red-500"
            )}
            onClick={onToggleFavorite}
            disabled={isPending}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "size-5 transition-all duration-300",
                isFavorite && "fill-red-500 text-red-500 scale-110"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
