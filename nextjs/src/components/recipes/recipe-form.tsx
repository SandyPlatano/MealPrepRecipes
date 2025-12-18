"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, X, Upload, AlertCircle, Sparkles } from "lucide-react";
import { createRecipe, updateRecipe, uploadRecipeImage } from "@/app/actions/recipes";
import type { Recipe, RecipeType, RecipeFormData } from "@/types/recipe";
import { DEFAULT_RECIPE_TYPES } from "@/types/recipe";
import { useCustomRecipeTypes } from "@/hooks/use-custom-recipe-types";
import { toast } from "sonner";
import Image from "next/image";
import { ALLERGEN_TYPES, detectAllergens, mergeAllergens, getAllergenDisplayName } from "@/lib/allergen-detector";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecipeFormProps {
  recipe?: Recipe;
  initialData?: RecipeFormData;
  nutritionEnabled?: boolean;
  householdId?: string | null;
  onSaveSuccess?: () => void;
}

export function RecipeForm({ recipe, initialData, nutritionEnabled = false, householdId, onSaveSuccess }: RecipeFormProps) {
  // Fetch custom recipe types for the household
  const { recipeTypes: customRecipeTypes, isLoading: typesLoading } = useCustomRecipeTypes(householdId);
  const router = useRouter();
  const isEditing = !!recipe;
  const errorRef = useRef<HTMLDivElement>(null);

  // Use initialData (from parser) or recipe (for editing) or defaults
  const defaultData = initialData || recipe;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

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
  const [isShared] = useState(
    defaultData?.is_shared_with_household ?? recipe?.is_shared_with_household ?? true
  );
  const [imageUrl, setImageUrl] = useState(defaultData?.image_url || recipe?.image_url || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [allergenTags, setAllergenTags] = useState<string[]>(
    defaultData?.allergen_tags || recipe?.allergen_tags || []
  );

  // Auto-detect allergens when ingredients change
  useEffect(() => {
    if (ingredients.length > 0 && ingredients.some(ing => ing.trim())) {
      const detected = detectAllergens(ingredients.filter(ing => ing.trim()));
      // Merge but don't auto-update - just for reference
      mergeAllergens(detected, allergenTags);
    }
  }, [ingredients, allergenTags]);

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
    setInstructions(instructions.filter((_, i) => i !== index));
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

  // Allergen tag handlers
  const toggleAllergenTag = (allergen: string) => {
    if (allergenTags.includes(allergen)) {
      setAllergenTags(allergenTags.filter((t) => t !== allergen));
    } else {
      setAllergenTags([...allergenTags, allergen]);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadRecipeImage(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setImageUrl(result.data.url);
      toast.success("Image uploaded!");
    }

    setUploadingImage(false);
    e.target.value = ""; // Reset input
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    toast.success("Image removed");
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
      image_url: imageUrl.trim() || undefined,
      allergen_tags: allergenTags,
      is_shared_with_household: isShared,
    };

    const result = isEditing
      ? await updateRecipe(recipe.id, formData)
      : await createRecipe(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      toast.success(isEditing ? "Recipe updated!" : "Recipe saved!");
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        router.push("/app/recipes");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

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
              maxLength={200}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Recipe Image</Label>
            {imageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={imageUrl}
                  alt={title || "Recipe image"}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, WebP or GIF (max 5MB)</span>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}
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
                maxLength={100}
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
              maxLength={100}
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
                maxLength={100}
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
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time</Label>
              <Input
                id="cookTime"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="e.g., 35 minutes"
                maxLength={50}
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
                maxLength={2000}
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
                onClick={() => {
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Step by step. Make it foolproof. <span className="text-muted-foreground">(Optional)</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No instructions added. Click &quot;Add Step&quot; below to add instructions, or leave empty if not needed.
            </p>
          ) : (
            instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-sm text-muted-foreground">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <MarkdownEditor
                    value={instruction}
                    onChange={(value) => updateInstruction(index, value)}
                    placeholder={`Step ${index + 1} - Use **bold** for emphasis, ## for sections`}
                    rows={3}
                    maxLength={2000}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  className="mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
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
              maxLength={50}
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

      {/* Allergen Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Allergen Warnings</CardTitle>
          <CardDescription>
            Mark allergens present in this recipe. Auto-detected allergens are shown below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_TYPES.map((allergen) => {
              const isSelected = allergenTags.includes(allergen);
              return (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleAllergenTag(allergen)}
                  />
                  <label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <Badge
                      variant={isSelected ? "warning" : "secondary"}
                    >
                      {getAllergenDisplayName(allergen)}
                    </Badge>
                  </label>
                </div>
              );
            })}
          </div>
          {allergenTags.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected allergens: {allergenTags.map((tag) => getAllergenDisplayName(tag as import("@/lib/allergen-detector").AllergenType)).join(", ")}
            </p>
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
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <MarkdownEditor
              value={notes}
              onChange={setNotes}
              placeholder="Tips, substitutions, or personal notes... Use **bold** for emphasis"
              rows={4}
              maxLength={2000}
            />
          </div>

        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col gap-4">
        {error && (
          <div
            ref={errorRef}
            className="p-4 text-sm bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg animate-in slide-in-from-top-2"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive mb-1">Please fix the following:</p>
                <p className="text-destructive/90">{error}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Nutrition Auto-Extraction Info */}
        {!isEditing && nutritionEnabled && (
          <Alert className="bg-primary/5 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Nutrition tracking enabled:</span> We&apos;ll automatically extract nutrition information from your ingredients after you create this recipe.
            </AlertDescription>
          </Alert>
        )}

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
      </div>
    </form>
  );
}
