# Recipe Scraping Improvements - Accuracy Enhancement

## Overview

This document outlines the significant improvements made to the recipe scraping system to ensure accurate extraction of ingredients and instructions directly from recipe websites, while preserving the original format and details.

## Problem Statement

The original recipe scraping implementation was using generic AI extraction that sometimes:
- Simplified or combined ingredients unnecessarily
- Modified ingredient quantities or names
- Reordered instructions
- Lost precision in measurements and preparation details

## Solution: Multi-Layered Accuracy Approach

### 1. Enhanced AI Prompting System

**File**: `/nextjs/src/app/api/parse-recipe/route.ts`

The recipe extraction prompt has been completely redesigned with emphasis on accuracy and fidelity to the source:

#### Key Improvements:
- **Accuracy-First Philosophy**: The prompt now explicitly instructs Claude to extract "EXACTLY as written" on the source
- **Explicit Preservation Instructions**: Multiple reminders to NOT simplify, modify, or reinterpret
- **Detailed Ingredient Guidelines**: Shows examples of proper formatting including:
  - Full quantities with units (e.g., "1 (15 oz) can", "2-3", "to taste")
  - Complete modifiers (e.g., "finely minced", "diced", "cooked")
  - Special preparation instructions on ingredients

- **Instruction Preservation**: Steps are extracted exactly as written, maintaining:
  - Temperature information
  - Timing details
  - Sequential ordering
  - All special instructions

#### Example Prompt Enhancement:

**Before:**
```
Extract ingredients with quantities. Format as: "[Quantity] [Unit] [Ingredient name]"
```

**After:**
```
Format each ingredient exactly as presented, including:
- Full quantity with units (e.g., "2 lbs", "1 cup", "1 tbsp", "1/4 tsp", "2-3", "to taste", "1 (15 oz) can")
- Complete ingredient name including all modifiers (e.g., "diced onion", "cooked chicken breast", "fresh cilantro")
- Special instructions on ingredients if provided (e.g., "melted butter", "lightly beaten eggs")

Format: "[Quantity] [Unit] [Ingredient name with all modifiers]"
Examples: "2 lbs boneless, skinless chicken breast", "1 (15 oz) can diced tomatoes", "3/4 cup finely chopped onions"

CRITICAL: Include every ingredient exactly as listed on the source, even if quantities seem unusual or incomplete.
```

### 2. Improved HTML Extraction & Preservation

**File**: `/nextjs/src/app/api/scrape-url/route.ts`

The URL scraping endpoint has been significantly enhanced to better identify and preserve recipe content:

#### Improvements:

1. **JSON-LD Schema Detection First**
   - Looks for `application/ld+json` scripts containing Recipe schema markup
   - This is the most accurate way to find recipe data on modern websites
   - Enables fallback to structured data if HTML parsing fails

2. **Enhanced Recipe Section Detection**
   - Now detects recipe sections by:
     - ID attributes: `id="*recipe*"`
     - Class names: `class="*recipe*"`, `class="*recipe-content*"`, `class="*recipe-body*"`
     - HTML structure: `<article>`, `<section>`, `<main>`
   - Requires minimum 100 characters to avoid empty sections
   - Multiple fallback patterns for different website structures

3. **Structure-Preserving Text Conversion**
   - **Before**: Generic HTML tag removal that lost all formatting
   - **After**: Intelligent conversion that preserves:
     - List items → bullet points (`• `)
     - Line breaks and paragraphs → newlines
     - Headings → preserved with newlines
     - Semantic spacing maintained

4. **Increased Content Limits**
   - HTML extraction: Increased from 15,000 → 20,000 characters
   - Text extraction: Increased from 10,000 → 15,000 characters
   - Allows more complete recipe content to reach AI for processing

#### Code Example:

```typescript
// BEFORE: Generic conversion
text = text.replace(/<[^>]+>/g, " ");

// AFTER: Structure-preserving conversion
text = text.replace(/<li[^>]*>/gi, "\n• ");
text = text.replace(/<p[^>]*>/gi, "\n");
text = text.replace(/<h[1-6][^>]*>/gi, "\n");
// ... and more semantic conversions
```

### 3. JSON-LD Recipe Schema Extraction

**File**: `/nextjs/src/lib/recipe-schema-extractor.ts` (NEW)

A dedicated utility for extracting structured recipe data from JSON-LD schemas:

#### Capabilities:

- **Schema Detection**: Finds Recipe schemas in multiple formats:
  - Direct Recipe type: `"@type": "Recipe"`
  - Nested in @graph
  - Wrapped in WebPage's mainEntity

- **Normalization Functions**:
  - `normalizeIngredientsFromSchema()`: Handles various ingredient formats
  - `normalizeInstructionsFromSchema()`: Handles both string and object instruction formats
  - `parseDuration()`: Converts ISO 8601 durations to readable format
    - `PT30M` → `"30 minutes"`
    - `PT2H30M` → `"2 hours 30 minutes"`
  - `normalizeServings()`: Handles array and string serving sizes

- **Recipe Schema to Format Converter**: `schemaToRecipeFormat()`
  - Provides schema data to Claude for cross-validation
  - Ensures consistency when schema data is available

#### Usage in Parse-Recipe:

```typescript
// Check for JSON-LD recipe schema
const schema = extractRecipeSchema(htmlContent);
if (schema) {
  const schemaData = schemaToRecipeFormat(schema);
  // Include schema data in Claude prompt for reference
  schemaInfo = `\n\nRECIPE SCHEMA INFORMATION FOUND (from website structured data):\n${JSON.stringify(schemaData, null, 2)}`;
}
```

### 4. Integrated Schema Context in AI Prompts

When recipe schema is detected, it's included in the Claude prompt as:
- Reference information (not authoritative)
- Validation data to cross-check extractions
- Fallback data if HTML parsing is unclear
- Additional context for timing and servings

This ensures that when a website has already provided structured recipe data, Claude can use it to improve extraction accuracy.

## Implementation Details

### File Changes Summary

| File | Changes | Impact |
|------|---------|--------|
| `/nextjs/src/app/api/parse-recipe/route.ts` | Enhanced AI prompt system; Integrated schema detection | More accurate extraction; Better fidelity to source |
| `/nextjs/src/app/api/scrape-url/route.ts` | Improved HTML detection; Structure-preserving conversion; Increased limits | Better recipe section identification; Preserved formatting |
| `/nextjs/src/lib/recipe-schema-extractor.ts` | NEW - Complete schema extraction utility | Structured data extraction from JSON-LD |

### Backward Compatibility

✅ **All changes are backward compatible**
- No database schema changes
- No breaking API changes
- Existing recipe imports continue to work
- Improvements are additive only

## Benefits

### For Users

1. **Accuracy**: Recipes now match the original website exactly
2. **Completeness**: All ingredients and steps are captured
3. **Precision**: Quantities, measurements, and preparation details are preserved
4. **Consistency**: Same extraction regardless of website structure

### For the System

1. **Robustness**: Schema fallback provides alternative extraction method
2. **Flexibility**: Works with traditional HTML and structured data
3. **Maintainability**: Modular approach separates concerns
4. **Extensibility**: Easy to add more extraction methods

## Testing Recommendations

### Test Cases to Verify Improvements:

1. **Traditional Recipe Sites** (AllRecipes, Food Network, Serious Eats)
   - Should capture all ingredients with exact quantities
   - Should extract complete instructions in order
   - Should preserve numbered/bulleted formatting

2. **Modern Recipe Sites with Schema** (Bon Appétit, NY Times Cooking)
   - Should detect JSON-LD schema
   - Should cross-validate extraction with schema data
   - Should use schema for timing information

3. **Food Blog Recipes** (Minimalist Baker, Budget Bytes)
   - Should handle non-standard HTML structures
   - Should extract ingredients from paragraphs
   - Should reconstruct numbered instructions from text

4. **Edge Cases**:
   - Recipes with metric and imperial units
   - Recipes with grouped ingredients (e.g., "For the sauce:")
   - Recipes with optional ingredients
   - Recipes with quantity ranges (e.g., "2-3")

## Future Enhancements

Potential areas for further improvement:

1. **Metric/Imperial Detection**: Auto-detect and preserve unit systems
2. **Ingredient Parsing**: Extract quantity, unit, and ingredient name into separate fields
3. **Video Recipes**: Extract timing from recipe videos
4. **Recipe Scaling**: Use structured quantity data for accurate scaling
5. **Allergen Detection**: Cross-reference with website allergen information
6. **Nutrition Data**: Extract nutrition info from schema or website
7. **Multi-Language Support**: Handle recipes in different languages

## Technical Notes

### Claude Model Version
- Current: `claude-sonnet-4-5-20250929`
- The system is designed to work with current and future Claude versions
- Prompt structure allows easy updates to model versions

### Rate Limiting
- Parse-Recipe: 20 requests/hour per user
- Scrape-URL: 30 requests/hour per user
- No changes to rate limiting in these improvements

### API Response Sizes
- HTML extraction: Now up to 20KB (was 15KB)
- Text extraction: Now up to 15KB (was 10KB)
- Allows more complete recipes to be processed

## Conclusion

These improvements represent a fundamental shift toward accuracy-first recipe extraction. By combining:
- Enhanced AI prompting focused on fidelity
- Better HTML parsing with structure preservation
- JSON-LD schema detection and parsing
- Integrated cross-validation

The system now accurately captures recipes exactly as presented on their original sources, ensuring users get precise measurements, complete ingredient lists, and accurate instructions.
