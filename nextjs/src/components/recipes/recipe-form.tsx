"use client";

import type { Recipe, RecipeFormData } from "@/types/recipe";
import { useCustomRecipeTypes } from "@/hooks/use-custom-recipe-types";
import { useRecipeForm } from "@/hooks/use-recipe-form";
import {
  BasicInfoSection,
  IngredientsSection,
  InstructionsSection,
  TagsSection,
  AllergenSection,
  ExtraDetailsSection,
  SubmitSection,
} from "./recipe-form/index";

interface RecipeFormProps {
  recipe?: Recipe;
  initialData?: RecipeFormData;
  nutritionEnabled?: boolean;
  householdId?: string | null;
  onSaveSuccess?: () => void;
}

export function RecipeForm({
  recipe,
  initialData,
  nutritionEnabled = false,
  householdId,
  onSaveSuccess
}: RecipeFormProps) {
  // Fetch custom recipe types for the household
  const { recipeTypes: customRecipeTypes, isLoading: typesLoading } = useCustomRecipeTypes(householdId);

  // Use the custom hook for form state and handlers
  const form = useRecipeForm({ recipe, initialData, onSaveSuccess });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-6">
      <BasicInfoSection
        title={form.title}
        setTitle={form.setTitle}
        recipeType={form.recipeType}
        setRecipeType={form.setRecipeType}
        category={form.category}
        setCategory={form.setCategory}
        proteinType={form.proteinType}
        setProteinType={form.setProteinType}
        prepTime={form.prepTime}
        setPrepTime={form.setPrepTime}
        cookTime={form.cookTime}
        setCookTime={form.setCookTime}
        servings={form.servings}
        setServings={form.setServings}
        baseServings={form.baseServings}
        setBaseServings={form.setBaseServings}
        imageUrl={form.imageUrl}
        uploadingImage={form.uploadingImage}
        handleImageUpload={form.handleImageUpload}
        handleRemoveImage={form.handleRemoveImage}
        setUploadingImageState={form.setUploadingImageState}
        customRecipeTypes={customRecipeTypes}
        typesLoading={typesLoading}
      />

      <IngredientsSection
        ingredients={form.ingredients}
        addIngredient={form.addIngredient}
        updateIngredient={form.updateIngredient}
        removeIngredient={form.removeIngredient}
        addBulkIngredients={form.addBulkIngredients}
      />

      <InstructionsSection
        instructions={form.instructions}
        addInstruction={form.addInstruction}
        updateInstruction={form.updateInstruction}
        removeInstruction={form.removeInstruction}
      />

      <TagsSection
        tags={form.tags}
        tagInput={form.tagInput}
        setTagInput={form.setTagInput}
        addTag={form.addTag}
        removeTag={form.removeTag}
      />

      <AllergenSection
        allergenTags={form.allergenTags}
        toggleAllergenTag={form.toggleAllergenTag}
      />

      <ExtraDetailsSection
        sourceUrl={form.sourceUrl}
        setSourceUrl={form.setSourceUrl}
        notes={form.notes}
        setNotes={form.setNotes}
      />

      <SubmitSection
        loading={form.loading}
        uploadingImage={form.uploadingImage}
        isEditing={form.isEditing}
        error={form.error}
        errorRef={form.errorRef}
        setError={form.setError}
        nutritionEnabled={nutritionEnabled}
      />
    </form>
  );
}
