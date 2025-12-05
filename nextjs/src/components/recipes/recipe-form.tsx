"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X } from "lucide-react";
import { createRecipe, updateRecipe } from "@/app/actions/recipes";
import type { Recipe, RecipeType, RecipeFormData } from "@/types/recipe";

interface RecipeFormProps {
  recipe?: Recipe;
  initialData?: RecipeFormData;
}

const recipeTypes: RecipeType[] = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
];

export function RecipeForm({ recipe, initialData }: RecipeFormProps) {
  const router = useRouter();
  const isEditing = !!recipe;

  // Use initialData (from parser) or recipe (for editing) or defaults
  const defaultData = initialData || recipe;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(defaultData?.title || "");
  const [recipeType, setRecipeType] = useState<RecipeType>(
    (defaultData?.recipe_type as RecipeType) || "Dinner"
  );
  const [category, setCategory] = useState(defaultData?.category || "");
  const [proteinType, setProteinType] = useState(
    (recipe?.protein_type || initialData?.tags?.[0]) || ""
  );
  const [prepTime, setPrepTime] = useState(defaultData?.prep_time || "");
  const [cookTime, setCookTime] = useState(defaultData?.cook_time || "");
  const [servings, setServings] = useState(defaultData?.servings || "");
  const [baseServings, setBaseServings] = useState<number | undefined>(
    defaultData?.base_servings || undefined
  );
  const [ingredients, setIngredients] = useState<string[]>(
    defaultData?.ingredients?.length ? defaultData.ingredients : [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    defaultData?.instructions?.length ? defaultData.instructions : [""]
  );
  const [tags, setTags] = useState<string[]>(defaultData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(defaultData?.notes || "");
  const [sourceUrl, setSourceUrl] = useState(
    defaultData?.source_url || recipe?.source_url || ""
  );
  const [isShared, setIsShared] = useState(
    defaultData?.is_shared_with_household ?? recipe?.is_shared_with_household ?? true
  );

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // Instruction handlers
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  // Tag handlers
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out empty ingredients and instructions
    const filteredIngredients = ingredients.filter((i) => i.trim());
    const filteredInstructions = instructions.filter((i) => i.trim());

    if (!title.trim()) {
      setError("Recipe title is required");
      setLoading(false);
      return;
    }

    if (filteredIngredients.length === 0) {
      setError("At least one ingredient is required");
      setLoading(false);
      return;
    }

    if (filteredInstructions.length === 0) {
      setError("At least one instruction is required");
      setLoading(false);
      return;
    }

    const formData: RecipeFormData = {
      title: title.trim(),
      recipe_type: recipeType,
      category: category.trim() || undefined,
      protein_type: proteinType.trim() || undefined,
      prep_time: prepTime.trim() || undefined,
      cook_time: cookTime.trim() || undefined,
      servings: servings.trim() || undefined,
      base_servings: baseServings,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      tags,
      notes: notes.trim() || undefined,
      source_url: sourceUrl.trim() || undefined,
      is_shared_with_household: isShared,
    };

    const result = isEditing
      ? await updateRecipe(recipe.id, formData)
      : await createRecipe(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/app/recipes");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
          <CardDescription>
            The essentials. What are we cooking?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sheet Pan Lemon Herb Chicken"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipeType">Type *</Label>
              <Select
                value={recipeType}
                onValueChange={(value) => setRecipeType(value as RecipeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recipeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Chicken, Pasta, Salad"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteinType">Protein Type</Label>
            <Input
              id="proteinType"
              value={proteinType}
              onChange={(e) => setProteinType(e.target.value)}
              placeholder="e.g., Chicken, Beef, Vegetarian"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="baseServings">
                Number of Servings{" "}
                <span className="text-xs text-muted-foreground">(for scaling)</span>
              </Label>
              <Input
                id="baseServings"
                type="number"
                min="1"
                value={baseServings || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setBaseServings(val ? parseInt(val) : undefined);
                }}
                placeholder="e.g., 4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">
                Servings Description{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="servings"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="e.g., Serves 4-6 or Makes 24 cookies"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time</Label>
              <Input
                id="prepTime"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="e.g., 15 minutes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time</Label>
              <Input
                id="cookTime"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="e.g., 35 minutes"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
          <CardDescription>
            Add one at a time, or paste multiple separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk add via comma-separated input */}
          <div className="space-y-2">
            <Label htmlFor="bulkIngredients" className="text-sm text-muted-foreground">
              Quick add (comma-separated)
            </Label>
            <div className="flex gap-2">
              <Input
                id="bulkIngredients"
                placeholder="e.g., 2 cups flour, 1 tsp salt, 3 eggs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const value = input.value.trim();
                    if (value) {
                      const newIngredients = value
                        .split(",")
                        .map((i) => i.trim())
                        .filter((i) => i);
                      if (newIngredients.length > 0) {
                        // Filter out empty existing ingredients, then add new ones
                        const existingNonEmpty = ingredients.filter((i) => i.trim());
                        setIngredients([...existingNonEmpty, ...newIngredients]);
                        input.value = "";
                      }
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = document.getElementById("bulkIngredients") as HTMLInputElement;
                  const value = input?.value.trim();
                  if (value) {
                    const newIngredients = value
                      .split(",")
                      .map((i) => i.trim())
                      .filter((i) => i);
                    if (newIngredients.length > 0) {
                      const existingNonEmpty = ingredients.filter((i) => i.trim());
                      setIngredients([...existingNonEmpty, ...newIngredients]);
                      input.value = "";
                    }
                  }
                }}
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
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Step by step. Make it foolproof.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <span className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-sm text-muted-foreground">
                {index + 1}.
              </span>
              <Textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInstruction(index)}
                disabled={instructions.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInstruction}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Make it searchable. Add tags like &quot;quick&quot;, &quot;healthy&quot;, &quot;one-pan&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra Details */}
      <Card>
        <CardHeader>
          <CardTitle>Extra Details</CardTitle>
          <CardDescription>Optional but helpful.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tips, substitutions, or personal notes..."
              rows={3}
            />
          </div>

        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Recipe"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
