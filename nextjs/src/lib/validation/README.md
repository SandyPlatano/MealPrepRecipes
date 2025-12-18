# Ingredient Validation

This module provides utilities for validating and normalizing ingredient strings to improve data quality in recipes.

## Problem

The shopping list showed issues like `"4.23 cup arge egg (beaten)"` which has multiple problems:
- Typo: "arge" should be "large"
- Suspicious quantity: eggs should be counted, not measured in cups
- Inconsistent spacing

## Solution

The `ingredient-validator.ts` provides non-blocking validation that:
1. Detects and fixes common typos
2. Identifies suspicious quantities (e.g., volume units for counted items)
3. Normalizes whitespace
4. Checks unit-ingredient compatibility

## Usage

### Basic Validation

```typescript
import { validateIngredient } from '@/lib/validation/ingredient-validator';

const result = validateIngredient("4 arge eggs (beaten)");

console.log(result.normalized); // "4 large eggs (beaten)"
console.log(result.warnings);   // [{ type: "typo_correction", message: "..." }]
```

### Batch Validation

```typescript
import { validateIngredients, getNormalizedIngredients } from '@/lib/validation/ingredient-validator';

const ingredients = [
  "4 arge eggs",
  "2  cups  flour",
  "1 medum onion"
];

const result = validateIngredients(ingredients);
const cleaned = getNormalizedIngredients(result);

// cleaned = ["4 large eggs", "2 cups flour", "1 medium onion"]
```

### Warning Analysis

```typescript
import {
  validateIngredients,
  getAllWarnings,
  getWarningsByType
} from '@/lib/validation/ingredient-validator';

const result = validateIngredients(ingredients);

// Get all warnings
const warnings = getAllWarnings(result);

// Group warnings by type
const grouped = getWarningsByType(result);
console.log(grouped.typo_correction); // All typo warnings
console.log(grouped.suspicious_quantity); // All suspicious quantity warnings
```

## Warning Types

- **typo_correction**: Common typos detected and fixed
- **suspicious_quantity**: Volume/weight used for typically counted items
- **unit_normalization**: Units normalized for consistency
- **unit_mismatch**: Unusual unit-ingredient combinations
- **whitespace_cleanup**: Excessive whitespace cleaned

## Integration

This validator is designed to be **non-blocking**:
- Returns warnings instead of throwing errors
- Original data is preserved
- Normalized version is provided alongside warnings
- Can be integrated into existing flows without breaking changes

### Example: Recipe Processing

```typescript
import { validateIngredients, getNormalizedIngredients } from '@/lib/validation/ingredient-validator';

async function processRecipe(recipe: Recipe) {
  // Validate ingredients
  const validation = validateIngredients(recipe.ingredients);

  // Log warnings for monitoring
  if (validation.hasWarnings) {
    console.warn(`Recipe ${recipe.id} has ${validation.warningCount} ingredient issues`);
    validation.ingredients.forEach(ing => {
      ing.warnings.forEach(w => console.warn(w.message));
    });
  }

  // Use normalized ingredients for storage/display
  const cleanedIngredients = getNormalizedIngredients(validation);

  return {
    ...recipe,
    ingredients: cleanedIngredients,
    _originalIngredients: recipe.ingredients // Preserve original if needed
  };
}
```

## Examples

See `ingredient-validator.example.ts` for comprehensive usage examples.

## Adding New Rules

To add new validation rules:

1. Add warning type to `IngredientValidationWarning` interface
2. Add detection logic in `validateIngredient` function
3. Update typo corrections or unit lists as needed

## Future Enhancements

- Machine learning-based typo detection
- Context-aware unit validation
- Ingredient synonym detection
- Quantity range validation (e.g., 100 eggs is suspicious)
