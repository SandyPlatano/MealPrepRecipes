# Recipe Scraping Improvements - Testing Guide

## How to Test the Improvements

This guide will help you verify that the recipe scraping improvements are working correctly.

## Test Scenarios

### Test 1: Traditional Recipe Sites (AllRecipes, Food Network)

**Website**: https://www.allrecipes.com/ (or any AllRecipes recipe)

**What to Test**:
1. Navigate to any recipe on AllRecipes
2. Copy the recipe URL
3. Import it into your app using "From URL" mode
4. Check the extracted recipe

**Verification Checklist**:
- [ ] Recipe title matches website exactly
- [ ] **All ingredients appear** with exact quantities
- [ ] Example: "1 (15 oz) can diced tomatoes" (not simplified to "1 can tomatoes")
- [ ] Example: "2-3 tbsp" (not just "2 tbsp")
- [ ] Example: "Salt and black pepper to taste" (fully preserved)
- [ ] All instruction steps appear in original order
- [ ] No steps are combined or reworded
- [ ] Prep time and cook time are correct

**Expected Result**: Recipe matches AllRecipes exactly, with all ingredients in original format.

---

### Test 2: Modern Sites with JSON-LD Schema (Bon Appétit, NY Times)

**Website**: https://www.bonappetit.com/ (or any Bon Appétit recipe)

**What to Test**:
1. Copy a Bon Appétit recipe URL
2. Import using "From URL" mode
3. Check both the extraction and any console logs

**Verification Checklist**:
- [ ] JSON-LD schema is detected (you can check in network requests)
- [ ] Recipe structure is correctly identified
- [ ] Timing information is accurate (converted from ISO 8601 format)
- [ ] Ingredients match the website exactly
- [ ] All instructions preserved in order

**Expected Result**: Recipe accurately captures all structured data from the website.

---

### Test 3: Food Blog Recipes (Minimalist Baker, Budget Bytes)

**Website**: https://minimalistbaker.com/ (or similar food blog)

**What to Test**:
1. Choose a food blog recipe with good formatting
2. Copy the URL
3. Import using "From URL" mode
4. Verify extraction

**Verification Checklist**:
- [ ] Ingredients with various unit types captured (cups, tbsp, grams, etc.)
- [ ] Ingredient modifiers preserved ("finely diced", "minced", "fresh", "cooked")
- [ ] Instructions with numbered format maintained
- [ ] Preparation and cooking times extracted correctly
- [ ] Notes/tips section captured if present

**Expected Result**: Recipe maintains all details from the food blog, including metric and imperial units.

---

### Test 4: Edge Cases - Quantity Ranges

**Setup**: Find or create a recipe with quantity ranges

**Test Cases**:
1. "2-3 cups flour"
2. "1 to 2 onions, diced"
3. "Salt and pepper to taste"
4. "1-2 tbsp"

**Verification Checklist**:
- [ ] "2-3" format preserved (not just "2" or "3")
- [ ] "to" format preserved in ranges
- [ ] "to taste" captured exactly
- [ ] Hyphens maintained in "1-2"

**Expected Result**: All quantity ranges preserved exactly as written.

---

### Test 5: Edge Cases - Grouped Ingredients

**Setup**: Find a recipe with grouped ingredients (e.g., "For the sauce:", "For the filling:")

**Test Cases**:
1. Recipes with multiple component sections
2. "For the dressing:" sections
3. "For garnish:" sections

**Verification Checklist**:
- [ ] Ingredient groupings preserved or clearly separated
- [ ] All ingredient groups included
- [ ] No ingredients lost between groups
- [ ] Group descriptions included in extraction

**Expected Result**: All ingredient groups captured with clear separation.

---

### Test 6: Can Sizes and Special Formats

**Setup**: Test recipes with specific can sizes and special ingredient formats

**Test Cases**:
1. "1 (15 oz) can diced tomatoes"
2. "1 (8 oz) package cream cheese"
3. "2 (6 oz) skinless, boneless chicken breasts"
4. "1 lb ground beef"

**Verification Checklist**:
- [ ] Full can size preserved in parentheses
- [ ] Multiple specifications combined correctly
- [ ] Weight units accurate (lb, oz, kg, g)
- [ ] Package sizes included

**Expected Result**: Complex ingredient formats extracted exactly as written.

---

### Test 7: Instructions with Temperatures and Times

**Setup**: Find recipes with detailed cooking instructions

**Test Cases**:
1. "Bake at 350°F for 30 minutes"
2. "Simmer for 5-10 minutes until tender"
3. "Cook on medium-high heat until golden brown"
4. "Refrigerate for at least 2 hours or overnight"

**Verification Checklist**:
- [ ] Temperature settings preserved (350°F, 425°C, etc.)
- [ ] Time ranges preserved ("5-10 minutes")
- [ ] Cooking method preserved ("simmer", "bake", "sauté")
- [ ] Completion criteria preserved ("until golden", "until tender")

**Expected Result**: All instruction details captured with precision.

---

### Test 8: Before & After Comparison

**Setup**: Choose a recipe you've imported before

**Steps**:
1. **Before**: Note down what was extracted previously
2. **After**: Re-import the same recipe
3. **Compare**: Check if new extraction is more accurate

**What to Compare**:
- Ingredient count (should be equal or more)
- Ingredient format (should be more detailed)
- Instruction steps (should match exactly)
- Preserve special formatting (ranges, units, modifiers)

**Expected Result**: New extraction captures more details and maintains exact formatting.

---

## Automated Testing Ideas

If you want to create automated tests:

### Unit Test Example (for schema-extractor.ts):

```typescript
import { extractRecipeSchema, parseDuration } from '@/lib/recipe-schema-extractor';

describe('Recipe Schema Extraction', () => {
  test('should extract recipe schema from JSON-LD', () => {
    const html = `
      <script type="application/ld+json">
        {"@type": "Recipe", "name": "Test Recipe"}
      </script>
    `;
    const schema = extractRecipeSchema(html);
    expect(schema?.name).toBe('Test Recipe');
  });

  test('should parse ISO 8601 duration correctly', () => {
    expect(parseDuration('PT30M')).toBe('30 minutes');
    expect(parseDuration('PT2H30M')).toBe('2 hours 30 minutes');
  });
});
```

### Integration Test Example (for full pipeline):

```typescript
test('should extract AllRecipes recipe accurately', async () => {
  const url = 'https://www.allrecipes.com/recipe/[recipe-id]/';
  const result = await scrapeAndParseRecipe(url);

  // Verify structure
  expect(result.ingredients).toHaveLength(expectedCount);
  expect(result.ingredients[0]).toBe(expectedFirstIngredient);
  expect(result.instructions).toHaveLength(expectedSteps);
});
```

## Troubleshooting Tests

### If ingredients are still simplified:
1. Check that parse-recipe.ts has the updated prompt
2. Verify the skillInstructions include "CRITICAL: Include every ingredient exactly as listed"
3. Check Claude model version

### If HTML isn't being extracted well:
1. Check scrape-url.ts for recipe pattern detection
2. Verify recipePatterns array has been updated
3. Check that the website's recipe is in a `<div class="recipe">` or similar

### If JSON-LD schema isn't being detected:
1. Check if website actually has JSON-LD schema (inspect page source)
2. Verify schema extractor is finding `<script type="application/ld+json">`
3. Check that schema has `"@type": "Recipe"`

## Performance Notes

- Schema extraction adds minimal overhead (<1ms typically)
- HTML detection happens only on URL imports
- Text extraction is fast (mostly regex operations)
- AI processing time unchanged

## Reporting Issues

If you find a recipe that isn't being extracted correctly:

1. Note the website URL
2. Take a screenshot of what's shown on the website
3. Check what was extracted by your app
4. Compare the differences

Common issues to report:
- Missing ingredients
- Incorrect ingredient format
- Steps in wrong order
- Times/temperatures not captured

## Summary

The improved recipe scraping system should:

✅ Extract 100% of ingredients exactly as written
✅ Preserve all quantity formats and ranges
✅ Maintain instruction order and details
✅ Capture timing and temperature information
✅ Work with both traditional and modern recipe sites

Test these scenarios to verify the improvements are working!
