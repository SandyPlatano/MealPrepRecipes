import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface IngredientsSectionProps {
  ingredients: string[];
  addIngredient: () => void;
  updateIngredient: (index: number, value: string) => void;
  removeIngredient: (index: number) => void;
  addBulkIngredients: (value: string) => void;
}

export function IngredientsSection({
  ingredients,
  addIngredient,
  updateIngredient,
  removeIngredient,
  addBulkIngredients,
}: IngredientsSectionProps) {
  const handleBulkAdd = () => {
    const input = document.getElementById("bulkIngredients") as HTMLInputElement;
    const value = input?.value.trim();
    if (value) {
      addBulkIngredients(value);
      input.value = "";
    }
  };

  const handleBulkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value) {
        addBulkIngredients(value);
        input.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
        <CardDescription>
          Add one at a time, or paste multiple separated by commas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Bulk add via comma-separated input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="bulkIngredients" className="text-sm text-muted-foreground">
            Quick add (comma-separated)
          </Label>
          <div className="flex gap-2">
            <Input
              id="bulkIngredients"
              placeholder="e.g., 2 cups flour, 1 tsp salt, 3 eggs"
              maxLength={2000}
              onKeyDown={handleBulkKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleBulkAdd}
            >
              Add All
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or add individually</span>
          </div>
        </div>

        {/* Individual ingredient inputs */}
        <div className="flex flex-col gap-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                maxLength={500}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </CardContent>
    </Card>
  );
}
