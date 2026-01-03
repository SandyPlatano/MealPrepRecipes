import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Recipe, RecipeType, RecipeFormData } from "@/types/recipe";
import { detectAllergens, mergeAllergens } from "@/lib/allergen-detector";
import { createRecipe, updateRecipe } from "@/app/actions/recipes";

interface UseRecipeFormProps {
  recipe?: Recipe;
  initialData?: RecipeFormData;
  onSaveSuccess?: () => void;
}

export function useRecipeForm({ recipe, initialData, onSaveSuccess }: UseRecipeFormProps) {
  const router = useRouter();
  const isEditing = !!recipe;
  const errorRef = useRef<HTMLDivElement>(null);

  // Use initialData (from parser) or recipe (for editing) or defaults
  const defaultData = initialData || recipe;

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic info state
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

  // Ingredients and instructions state
  const [ingredients, setIngredients] = useState<string[]>(
    defaultData?.ingredients?.length ? defaultData.ingredients : [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    defaultData?.instructions?.length ? defaultData.instructions : [""]
  );

  // Tags and allergens state
  const [tags, setTags] = useState<string[]>(defaultData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [allergenTags, setAllergenTags] = useState<string[]>(
    defaultData?.allergen_tags || recipe?.allergen_tags || []
  );

  // Extra details state
  const [notes, setNotes] = useState(defaultData?.notes || "");
  const [sourceUrl, setSourceUrl] = useState(
    defaultData?.source_url || recipe?.source_url || ""
  );
  const [isShared] = useState(
    defaultData?.is_shared_with_household ?? recipe?.is_shared_with_household ?? true
  );

  // Image state
  const [imageUrl, setImageUrl] = useState(defaultData?.image_url || recipe?.image_url || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

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

  const addBulkIngredients = (value: string) => {
    const newIngredients = value
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);
    if (newIngredients.length > 0) {
      const existingNonEmpty = ingredients.filter((i) => i.trim());
      setIngredients([...existingNonEmpty, ...newIngredients]);
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

  // Image handlers
  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    toast.success("Image removed");
  };

  const setUploadingImageState = (state: boolean) => {
    setUploadingImage(state);
  };

  // Form validation
  const validateForm = (): string | null => {
    const filteredIngredients = ingredients.filter((i) => i.trim());

    if (!title.trim()) {
      return "Recipe title is required";
    }

    if (filteredIngredients.length === 0) {
      return "At least one ingredient is required";
    }

    return null;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Filter out empty ingredients and instructions
    const filteredIngredients = ingredients.filter((i) => i.trim());
    const filteredInstructions = instructions.filter((i) => i.trim());

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

  return {
    // State
    loading,
    error,
    errorRef,
    isEditing,
    // Basic info
    title,
    setTitle,
    recipeType,
    setRecipeType,
    category,
    setCategory,
    proteinType,
    setProteinType,
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    servings,
    setServings,
    baseServings,
    setBaseServings,
    // Ingredients
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addBulkIngredients,
    // Instructions
    instructions,
    addInstruction,
    updateInstruction,
    removeInstruction,
    // Tags
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    // Allergens
    allergenTags,
    toggleAllergenTag,
    // Extra details
    notes,
    setNotes,
    sourceUrl,
    setSourceUrl,
    // Image
    imageUrl,
    uploadingImage,
    handleImageUpload,
    handleRemoveImage,
    setUploadingImageState,
    // Form handlers
    handleSubmit,
    setError,
  };
}
