"use client";

import { useSettings } from "@/contexts/settings-context";
import { useRecipeImport } from "@/hooks/use-recipe-import";
import { RecipeForm } from "../recipe-form";
import { ModeSelector } from "./mode-selector";
import { PasteInputStep } from "./paste-input-step";
import { UrlInputStep } from "./url-input-step";
import { SingleRecipeReview } from "./single-recipe-review";
import { MultiRecipeReview } from "./multi-recipe-review";

export function RecipeImport() {
  const { household } = useSettings();
  const householdId = household?.household?.id ?? null;

  const {
    mode,
    setMode,
    pasteText,
    setPasteText,
    urlInputs,
    addUrlInput,
    removeUrlInput,
    updateUrlInput,
    validUrls,
    isParsing,
    parsedRecipe,
    parsedRecipes,
    currentReviewIndex,
    setCurrentReviewIndex,
    nutritionEnabled,
    importStatuses,
    importStats,
    isLoadingStats,
    isCreatingAll,
    createAllProgress,
    handlePasteSubmit,
    handleUrlSubmit,
    handleClearParsed,
    handleNextRecipe,
    handlePrevRecipe,
    handleRecipeSaved,
    handleRemoveFromQueue,
    handleCreateAllRecipes,
    MAX_URLS,
  } = useRecipeImport();

  // Multi-recipe review flow
  if (parsedRecipes.length > 0) {
    return (
      <MultiRecipeReview
        recipes={parsedRecipes}
        currentIndex={currentReviewIndex}
        nutritionEnabled={nutritionEnabled}
        householdId={householdId}
        isCreatingAll={isCreatingAll}
        createAllProgress={createAllProgress}
        onNext={handleNextRecipe}
        onPrev={handlePrevRecipe}
        onClear={handleClearParsed}
        onRecipeSaved={handleRecipeSaved}
        onRemoveFromQueue={handleRemoveFromQueue}
        onCreateAll={handleCreateAllRecipes}
        onIndexChange={setCurrentReviewIndex}
      />
    );
  }

  // Single recipe review flow
  if (parsedRecipe) {
    return (
      <SingleRecipeReview
        recipe={parsedRecipe}
        nutritionEnabled={nutritionEnabled}
        householdId={householdId}
        onClear={handleClearParsed}
      />
    );
  }

  // Import mode selection and input
  return (
    <div className="flex flex-col gap-6">
      <ModeSelector mode={mode} onModeChange={setMode} />

      {mode === "manual" && (
        <RecipeForm
          nutritionEnabled={nutritionEnabled}
          householdId={householdId}
        />
      )}

      {mode === "paste" && (
        <PasteInputStep
          pasteText={pasteText}
          isParsing={isParsing}
          onTextChange={setPasteText}
          onSubmit={handlePasteSubmit}
        />
      )}

      {mode === "url" && (
        <UrlInputStep
          urlInputs={urlInputs}
          validUrls={validUrls}
          isParsing={isParsing}
          importStats={importStats}
          isLoadingStats={isLoadingStats}
          importStatuses={importStatuses}
          maxUrls={MAX_URLS}
          onAddUrl={addUrlInput}
          onRemoveUrl={removeUrlInput}
          onUpdateUrl={updateUrlInput}
          onSubmit={handleUrlSubmit}
        />
      )}
    </div>
  );
}
