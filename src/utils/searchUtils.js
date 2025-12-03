// Search utilities for recipe matching

// Search recipes by protein type
export const searchByProtein = (recipes, proteinQuery) => {
  if (!proteinQuery || !proteinQuery.trim()) {
    return recipes; // Return all recipes if no query
  }

  const query = proteinQuery.toLowerCase().trim();

  return recipes.filter(recipe => {
    const proteinType = (recipe.proteinType || '').toLowerCase();
    const title = (recipe.title || '').toLowerCase();
    // Search in both protein type and title
    return proteinType.includes(query) || title.includes(query);
  });
};

// Search recipes by ingredients
export const searchByIngredients = (recipes, ingredientsList) => {
  if (!ingredientsList || ingredientsList.length === 0) {
    return [];
  }

  // Normalize ingredients (lowercase, remove extra spaces)
  const normalizedInputIngredients = ingredientsList.map(ing =>
    ing.toLowerCase().trim()
  );

  const results = recipes.map(recipe => {
    // Normalize recipe ingredients
    const recipeIngredients = recipe.ingredients.map(ing =>
      ing.toLowerCase().trim()
    );

    // Count matches
    let matchedCount = 0;
    const missingIngredients = [];
    const matchedIngredients = [];

    recipeIngredients.forEach(recipeIng => {
      const isMatched = normalizedInputIngredients.some(inputIng => {
        // Check for partial matches (e.g., "tomato" matches "cherry tomatoes")
        return recipeIng.includes(inputIng) || inputIng.includes(recipeIng);
      });

      if (isMatched) {
        matchedCount++;
        matchedIngredients.push(recipeIng);
      } else {
        missingIngredients.push(recipeIng);
      }
    });

    // Calculate match percentage
    const matchPercentage = Math.round((matchedCount / recipeIngredients.length) * 100);

    return {
      ...recipe,
      matchedCount,
      matchPercentage,
      totalIngredients: recipeIngredients.length,
      missingIngredients,
      matchedIngredients
    };
  });

  // Filter out recipes with 0% match and sort by match percentage
  return results
    .filter(recipe => recipe.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

// Parse comma-separated ingredient string into array
export const parseIngredientInput = (inputString) => {
  if (!inputString || !inputString.trim()) {
    return [];
  }

  return inputString
    .split(',')
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0);
};

// Calculate total time from prep and cook time
export const getTotalTime = (prepTime, cookTime) => {
  const prepMinutes = extractMinutes(prepTime);
  const cookMinutes = extractMinutes(cookTime);
  return prepMinutes + cookMinutes;
};

// Extract minutes from time string (e.g., "15 minutes" -> 15)
const extractMinutes = (timeString) => {
  if (!timeString) return 0;
  const match = timeString.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Format time in minutes to readable string
export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};
