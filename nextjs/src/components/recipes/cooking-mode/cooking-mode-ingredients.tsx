import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingModeIngredientsProps {
  ingredients: string[];
  checkedIngredients: boolean[];
  highlightedIndices: Set<number>;
  allChecked: boolean;
  onToggle: (index: number) => void;
}

export function CookingModeIngredients({
  ingredients,
  checkedIngredients,
  highlightedIndices,
  allChecked,
  onToggle,
}: CookingModeIngredientsProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Ingredients</span>
          <div className="flex items-center gap-2">
            {highlightedIndices.size > 0 && (
              <Badge variant="secondary" className="gap-1 text-sm">
                {highlightedIndices.size} for this step
              </Badge>
            )}
            {allChecked && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                All set!
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col max-h-[500px] overflow-y-auto">
          {ingredients.map((ingredient, index) => {
            const isHighlighted = highlightedIndices.has(index);
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4 rounded-lg p-3 -m-3 transition-colors",
                  isHighlighted && !checkedIngredients[index] && "bg-lime-50 dark:bg-lime-950/20 ring-1 ring-lime-200 dark:ring-lime-800"
                )}
              >
                <Checkbox
                  id={`ingredient-${index}`}
                  checked={checkedIngredients[index]}
                  onCheckedChange={() => onToggle(index)}
                  className="mt-0.5 h-6 w-6 data-[state=checked]:bg-[#D9F99D] data-[state=checked]:border-[#D9F99D] data-[state=checked]:text-[#1A1A1A]"
                />
                <label
                  htmlFor={`ingredient-${index}`}
                  className={cn(
                    "text-base leading-relaxed cursor-pointer flex-1",
                    checkedIngredients[index] && "line-through text-muted-foreground",
                    isHighlighted && !checkedIngredients[index] && "font-medium text-[#1A1A1A] dark:text-lime-300"
                  )}
                >
                  {ingredient}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
