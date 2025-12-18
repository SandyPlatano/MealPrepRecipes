/**
 * Example usage of Ingredient Validator
 *
 * This demonstrates how to use the ingredient validator to detect
 * and fix common data quality issues.
 */

import {
  validateIngredient,
  validateIngredients,
  getNormalizedIngredients,
  getAllWarnings,
  getWarningsByType,
} from "./ingredient-validator";

// Example 1: Validate a single ingredient with typo
function example1() {
  console.log("=== Example 1: Fix typo ===");
  const result = validateIngredient("4 arge eggs (beaten)");

  console.log("Original:", result.original);
  console.log("Normalized:", result.normalized);
  console.log("Warnings:");
  result.warnings.forEach((w) => console.log(`  - [${w.type}] ${w.message}`));
  console.log();

  // Output:
  // Original: 4 arge eggs (beaten)
  // Normalized: 4 large eggs (beaten)
  // Warnings:
  //   - [typo_correction] Fixed typo: "arge" -> "large"
}

// Example 2: Detect suspicious quantity (the original issue)
function example2() {
  console.log("=== Example 2: Suspicious quantity ===");
  const result = validateIngredient("4.23 cup arge egg (beaten)");

  console.log("Original:", result.original);
  console.log("Normalized:", result.normalized);
  console.log("Warnings:");
  result.warnings.forEach((w) => console.log(`  - [${w.type}] ${w.message}`));
  console.log();

  // Output:
  // Original: 4.23 cup arge egg (beaten)
  // Normalized: 4.23 cup large egg (beaten)
  // Warnings:
  //   - [typo_correction] Fixed typo: "arge" -> "large"
  //   - [suspicious_quantity] Suspicious: Using volume/weight unit "cup" for "egg (beaten)" which is typically counted
}

// Example 3: Validate multiple ingredients
function example3() {
  console.log("=== Example 3: Validate multiple ingredients ===");
  const ingredients = [
    "4 arge eggs",
    "2  cups  flour", // Extra spaces
    "1 medum onion",
    "3 cups sugar",
  ];

  const result = validateIngredients(ingredients);

  console.log(`Total ingredients: ${result.ingredients.length}`);
  console.log(`Has warnings: ${result.hasWarnings}`);
  console.log(`Warning count: ${result.warningCount}`);
  console.log();

  result.ingredients.forEach((ing, index) => {
    console.log(`[${index}] "${ing.original}" -> "${ing.normalized}"`);
    if (ing.warnings.length > 0) {
      ing.warnings.forEach((w) => console.log(`     [${w.type}] ${w.message}`));
    }
  });
  console.log();
}

// Example 4: Get normalized ingredients
function example4() {
  console.log("=== Example 4: Get normalized ingredients ===");
  const ingredients = ["4 arge eggs", "2  cups  flour", "1 medum onion"];

  const result = validateIngredients(ingredients);
  const normalized = getNormalizedIngredients(result);

  console.log("Original ingredients:");
  ingredients.forEach((ing) => console.log(`  - ${ing}`));
  console.log();

  console.log("Normalized ingredients:");
  normalized.forEach((ing) => console.log(`  - ${ing}`));
  console.log();

  // Can use normalized array directly for recipe storage
}

// Example 5: Group warnings by type
function example5() {
  console.log("=== Example 5: Group warnings by type ===");
  const ingredients = [
    "4 arge eggs",
    "2  medum  onions",
    "4.23 cups eggs",
    "1 lage tomato",
  ];

  const result = validateIngredients(ingredients);
  const grouped = getWarningsByType(result);

  console.log("Warnings by type:");
  Object.entries(grouped).forEach(([type, warnings]) => {
    console.log(`\n${type} (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  - ${w.message}`));
  });
  console.log();
}

// Example 6: Real-world usage in recipe processing
function example6() {
  console.log("=== Example 6: Recipe processing workflow ===");

  // Simulating recipe data from shopping list
  const recipeIngredients = [
    "4.23 cup arge egg (beaten)",
    "2  cups  all-purpose flour",
    "1 medum onion, diced",
    "3 cloves galic, minced",
  ];

  console.log("Processing recipe ingredients...\n");

  const result = validateIngredients(recipeIngredients);

  // Get cleaned ingredients for storage
  const cleanedIngredients = getNormalizedIngredients(result);

  // Log warnings for review
  if (result.hasWarnings) {
    console.log(`⚠️  Found ${result.warningCount} data quality issues:\n`);

    result.ingredients.forEach((ing, index) => {
      if (ing.warnings.length > 0) {
        console.log(`Ingredient ${index + 1}: "${ing.original}"`);
        ing.warnings.forEach((w) => {
          console.log(`  → ${w.message}`);
        });
        console.log(`  ✓ Corrected to: "${ing.normalized}"\n`);
      }
    });
  } else {
    console.log("✓ All ingredients are clean!\n");
  }

  // Use cleaned ingredients
  console.log("Final cleaned ingredients:");
  cleanedIngredients.forEach((ing) => console.log(`  - ${ing}`));
}

// Run examples if this file is executed directly
if (require.main === module) {
  example1();
  example2();
  example3();
  example4();
  example5();
  example6();
}

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
};
