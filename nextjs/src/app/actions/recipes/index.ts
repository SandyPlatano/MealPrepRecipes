/**
 * Recipes Actions Index
 *
 * Re-exports all recipe actions from modular files.
 * Import from '@/app/actions/recipes' for all recipe functionality.
 */

// Read operations
export { getRecipes, getRecipe } from "./read";

// Write operations
export { createRecipe, saveQuickCookRecipe, updateRecipe, deleteRecipe } from "./write";

// Favorites
export { toggleFavorite, getFavorites, getFavoriteRecipes } from "./favorites";

// History
export { markAsCooked, getRecipeHistory, getRecipeCookCounts } from "./history";

// Ratings
export { updateRecipeRating } from "./ratings";

// Images
export { uploadRecipeImage, deleteRecipeImage } from "./images";
