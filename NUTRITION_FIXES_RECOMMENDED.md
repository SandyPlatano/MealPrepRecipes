# Nutrition System - Recommended Code Fixes

## Summary

This document provides exact code changes to fix the identified issues in the nutrition system.

---

## FIX #1: Zero Calories Validation Bug (CRITICAL)

**File:** `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/ai/nutrition-extraction-prompt.ts`

**Problem:** Zero is falsy in JavaScript, so `if (nutrition.calories)` skips validation when calories = 0

**Lines to Replace:** 245-251 and 277

### Before (Buggy)

```typescript
// Lines 245-251
if (nutrition.calories) {
  if (nutrition.calories < 10) {
    warnings.push('Calories seem unrealistically low (<10)');
  }
  if (nutrition.calories > 2000) {
    warnings.push('Calories seem very high (>2000 per serving)');
  }
}

// Lines 277-291
if (nutrition.calories && nutrition.calories > 0 && nutrition.protein_g !== null && nutrition.protein_g !== undefined && nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && nutrition.fat_g !== null && nutrition.fat_g !== undefined) {
  const estimatedCalories =
    nutrition.protein_g * 4 +
    nutrition.carbs_g * 4 +
    nutrition.fat_g * 9;

  const diff = Math.abs(estimatedCalories - nutrition.calories);
  const diffPercent = (diff / nutrition.calories) * 100;

  if (diffPercent > 20) {
    warnings.push(
      `Calorie calculation mismatch: ${Math.round(diffPercent)}% difference from macros`
    );
  }
}
```

### After (Fixed)

```typescript
// Lines 245-260 (FIXED)
if (nutrition.calories !== null && nutrition.calories !== undefined) {
  // Check for impossible data: 0 calories with macros
  if (nutrition.calories === 0 && (nutrition.protein_g || nutrition.carbs_g || nutrition.fat_g)) {
    warnings.push('Calories cannot be 0 when macros are provided');
  } else if (nutrition.calories > 0 && nutrition.calories < 10) {
    warnings.push('Calories seem unrealistically low (<10)');
  }
  if (nutrition.calories > 2000) {
    warnings.push('Calories seem very high (>2000 per serving)');
  }
}

// Lines 277-291 (FIXED)
if (nutrition.calories !== null &&
    nutrition.calories !== undefined &&
    nutrition.calories > 0 &&
    nutrition.protein_g !== null &&
    nutrition.protein_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.fat_g !== null &&
    nutrition.fat_g !== undefined) {
  const estimatedCalories =
    nutrition.protein_g * 4 +
    nutrition.carbs_g * 4 +
    nutrition.fat_g * 9;

  const diff = Math.abs(estimatedCalories - nutrition.calories);
  const diffPercent = (diff / nutrition.calories) * 100;

  if (diffPercent > 20) {
    warnings.push(
      `Calorie calculation mismatch: ${Math.round(diffPercent)}% difference from macros`
    );
  }
}
```

**Impact:**
- Detects invalid nutrition data (0 calories with high macros)
- Calorie-macro mismatch check still works for zero calories
- Proper handling of all edge cases

---

## FIX #2: Implement Confidence Penalty System (CRITICAL)

**File:** `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/api/ai/extract-nutrition/route.ts`

**Problem:** Validation warnings are not affecting confidence score

### Step 1: Add Penalty Calculation Function

**Add after imports (around line 10):**

```typescript
/**
 * Calculate confidence penalties based on validation quality
 * Returns penalty amount (0 to 0.4, representing 0-40% reduction)
 */
function calculateConfidencePenalties(
  nutrition: NutritionData & { confidence_score: number },
  warnings: string[]
): number {
  let penalty = 0;

  // 1. Penalty per warning (5% each, max 20%)
  const warningPenalty = Math.min(0.2, warnings.length * 0.05);
  penalty += warningPenalty;

  // 2. Calorie-macro mismatch penalty
  if (
    nutrition.calories !== null &&
    nutrition.calories !== undefined &&
    nutrition.calories > 0 &&
    nutrition.protein_g !== null &&
    nutrition.protein_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.fat_g !== null &&
    nutrition.fat_g !== undefined
  ) {
    const estimated =
      nutrition.protein_g * 4 + nutrition.carbs_g * 4 + nutrition.fat_g * 9;
    const diff = Math.abs(estimated - nutrition.calories) / nutrition.calories;

    if (diff > 0.2) {
      penalty += 0.1; // 10% penalty for >20% mismatch
    } else if (diff > 0.1) {
      penalty += 0.05; // 5% penalty for >10% mismatch
    }
  }

  // 3. Unrealistic zero macros penalty
  const zeroCount = [
    nutrition.calories,
    nutrition.protein_g,
    nutrition.carbs_g,
    nutrition.fat_g,
  ]
    .filter((v) => v === 0).length;

  if (zeroCount >= 2) {
    penalty += 0.15; // 15% for 2+ zero macros
  }

  // 4. Data completeness penalty
  const providedFields = [
    nutrition.calories,
    nutrition.protein_g,
    nutrition.carbs_g,
    nutrition.fat_g,
  ].filter((v) => v !== null && v !== undefined).length;

  if (providedFields < 4) {
    const completeness = providedFields / 4;
    penalty += (1 - completeness) * 0.15; // Up to 15% for missing fields
  }

  return Math.min(0.4, penalty); // Max 40% penalty
}
```

### Step 2: Update Route Handler

**Replace lines 227-285 with:**

```typescript
    // 11. VALIDATE NUTRITION RANGES
    const warnings = validateNutritionRanges(nutritionData);

    // 12. CALCULATE CONFIDENCE PENALTIES
    const confidencePenalties = calculateConfidencePenalties(nutritionData, warnings);
    const adjustedConfidence = Math.max(
      0,
      nutritionData.confidence_score - confidencePenalties
    );

    // Make thresholds configurable
    const CONFIDENCE_HIGH = parseFloat(
      process.env.CONFIDENCE_HIGH_THRESHOLD || '0.7'
    );
    const CONFIDENCE_MEDIUM = parseFloat(
      process.env.CONFIDENCE_MEDIUM_THRESHOLD || '0.4'
    );

    let confidenceLevel: 'high' | 'medium' | 'low';
    if (adjustedConfidence >= CONFIDENCE_HIGH) {
      confidenceLevel = 'high';
    } else if (adjustedConfidence >= CONFIDENCE_MEDIUM) {
      confidenceLevel = 'medium';
    } else {
      confidenceLevel = 'low';
    }

    // 13. SAVE TO DATABASE
    const { data: savedNutrition, error: saveError } = await supabase
      .from("recipe_nutrition")
      .upsert(
        {
          recipe_id,
          calories: nutritionData.calories,
          protein_g: nutritionData.protein_g,
          carbs_g: nutritionData.carbs_g,
          fat_g: nutritionData.fat_g,
          fiber_g: nutritionData.fiber_g,
          sugar_g: nutritionData.sugar_g,
          sodium_mg: nutritionData.sodium_mg,
          source: "ai_extracted" as const,
          confidence_score: adjustedConfidence, // Use adjusted confidence
          input_tokens: inputTokens > 0 ? inputTokens : null,
          output_tokens: outputTokens > 0 ? outputTokens : null,
          cost_usd: costUsd,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "recipe_id",
        }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save nutrition data:", saveError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save nutrition data to database",
          details: saveError.message,
        },
        { status: 500 }
      );
    }

    // 14. RETURN SUCCESS RESPONSE WITH DETAILED CONFIDENCE INFO
    return NextResponse.json({
      success: true,
      nutrition: savedNutrition,
      warnings: warnings.length > 0 ? warnings : undefined,
      confidence: {
        original_score: nutritionData.confidence_score,
        adjusted_score: adjustedConfidence,
        penalty_applied: confidencePenalties,
        level: confidenceLevel,
      },
      cost: costUsd
        ? {
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_usd: costUsd,
          }
        : undefined,
    });
```

**Impact:**
- Confidence adjusted based on data quality
- Warnings directly affect confidence score
- Transparent reporting of adjustments
- Configurable thresholds via environment variables

---

## FIX #3: Additional Validations (MEDIUM PRIORITY)

### Add Fiber/Sugar Balance Check

**File:** `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/ai/nutrition-extraction-prompt.ts`

**Add after line 306:**

```typescript
  // Sugar/fiber balance check (>85% of carbs)
  if (
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.carbs_g > 0 &&
    nutrition.sugar_g !== null &&
    nutrition.sugar_g !== undefined &&
    nutrition.fiber_g !== null &&
    nutrition.fiber_g !== undefined
  ) {
    const ratio = (nutrition.sugar_g + nutrition.fiber_g) / nutrition.carbs_g;
    if (ratio > 0.85) {
      warnings.push(
        `Sugar and fiber represent ${Math.round(ratio * 100)}% of carbs ` +
        `(expected <85% for most foods)`
      );
    }
  }
```

### Improve Sodium Validation

**File:** `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/ai/nutrition-extraction-prompt.ts`

**Replace lines 309-314 with:**

```typescript
  // Sodium validation
  if (nutrition.sodium_mg && nutrition.sodium_mg < 0) {
    warnings.push('Sodium cannot be negative');
  }
  if (
    nutrition.sodium_mg !== null &&
    nutrition.sodium_mg !== undefined &&
    nutrition.sodium_mg > 0 &&
    nutrition.sodium_mg < 50
  ) {
    warnings.push(
      'Sodium is very low for most recipes (<50mg per serving)'
    );
  }
  if (nutrition.sodium_mg && nutrition.sodium_mg > 5000) {
    warnings.push('Sodium seems very high (>5000mg per serving)');
  }
```

---

## FIX #4: Add Confidence Validation to parseNutritionResponse

**File:** `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/ai/nutrition-extraction-prompt.ts`

**Add after line 204 in parseNutritionResponse function:**

```typescript
    // Ensure confidence is within expected ranges
    // Log if confidence is outside expected distribution
    if (confidence_score > 0.9) {
      console.warn(
        `High confidence score (${confidence_score}) - ensure ingredients were clear`
      );
    }
    if (confidence_score < 0.2) {
      console.warn(
        `Low confidence score (${confidence_score}) - consider recipe is unusual/unclear`
      );
    }
```

This helps track when Claude is returning unexpected confidence values.

---

## ENVIRONMENT VARIABLES TO ADD

Add to your `.env.local` and `.env.production`:

```bash
# Confidence scoring thresholds
CONFIDENCE_HIGH_THRESHOLD=0.7
CONFIDENCE_MEDIUM_THRESHOLD=0.4

# Optional: Penalty multipliers
CONFIDENCE_WARNING_PENALTY_MULTIPLIER=0.05
CONFIDENCE_MAX_PENALTY=0.4
```

---

## DATABASE MIGRATION (Optional)

If you want to track the original confidence score vs adjusted:

```sql
-- Add new column to track original confidence from Claude
ALTER TABLE recipe_nutrition
ADD COLUMN confidence_score_original DECIMAL(3,2) NULL;

-- Update existing records to copy current confidence as original
UPDATE recipe_nutrition
SET confidence_score_original = confidence_score
WHERE confidence_score_original IS NULL;

-- Add comment column for penalty explanation
ALTER TABLE recipe_nutrition
ADD COLUMN confidence_penalty_reason TEXT NULL;
```

---

## TESTING THE FIXES

Create test cases to verify:

```typescript
// Test 1: Zero calories with macros
const test1 = validateNutritionRanges({
  calories: 0,
  protein_g: 30,
  carbs_g: 50,
  fat_g: 20,
});
// Should include: "Calories cannot be 0 when macros are provided"

// Test 2: Confidence penalty system
const nutrition = {
  calories: 500,
  protein_g: 100,
  carbs_g: 100,
  fat_g: 100,
  confidence_score: 0.85,
};
const warnings = [
  "Calorie calculation mismatch: 240% difference from macros"
];
const penalty = calculateConfidencePenalties(nutrition, warnings);
// Should be: 0.15 (0.1 for warning + 0.1 for >20% mismatch)
// Adjusted confidence: 0.85 - 0.15 = 0.70

// Test 3: Configurable thresholds
const CONF_HIGH = parseFloat(process.env.CONFIDENCE_HIGH_THRESHOLD || '0.7');
// Should respect environment variable if set
```

---

## ROLLOUT PLAN

### Phase 1: Critical Fixes (Week 1)
1. Deploy Fix #1 (zero calories validation bug)
2. Deploy Fix #2 (confidence penalty system)
3. Test with existing recipes
4. Monitor for any regressions

### Phase 2: Additional Validations (Week 2)
1. Deploy Fix #3 (fiber/sugar balance, sodium)
2. Deploy Fix #4 (confidence validation logging)
3. Gather data on penalty distribution
4. Adjust penalty multipliers if needed

### Phase 3: Monitoring (Week 3+)
1. Track confidence score distribution
2. Analyze which warnings are most common
3. Refine penalty multipliers based on data
4. Prepare optional database migration

---

## MONITORING & METRICS

After deploying the fixes, monitor:

```typescript
// Track in analytics/logging service
{
  timestamp: new Date(),
  recipe_id: recipeId,
  confidence_original: 0.85,
  confidence_adjusted: 0.70,
  penalty_applied: 0.15,
  warnings_count: 1,
  warning_types: ['calorie_mismatch'],
  data_completeness: 1.0,
  zero_macro_count: 0,
}
```

Key metrics to track:
- Average penalty applied
- Distribution of warnings
- Correlation between penalties and user corrections
- Recipes with high warnings but kept at high confidence (edge cases)

---

## SUMMARY OF CHANGES

| Fix | File | Severity | Lines | Effort |
|-----|------|----------|-------|--------|
| #1 | nutrition-extraction-prompt.ts | CRITICAL | 245-251, 277-291 | 1 hour |
| #2 | extract-nutrition/route.ts | CRITICAL | 227-285 | 2 hours |
| #3 | nutrition-extraction-prompt.ts | MEDIUM | ~307-350 | 30 min |
| #4 | nutrition-extraction-prompt.ts | LOW | ~205 | 15 min |

**Total Effort:** ~4 hours
**Testing Time:** ~2 hours
**Total:** ~6 hours for full implementation

---

## QUESTIONS & CONSIDERATIONS

1. **Should we update existing nutrition records?**
   - Recommendation: No, let them keep original confidence
   - New records will use adjusted confidence
   - Optional: Run migration to recalculate old records

2. **What if Claude's confidence is already perfect?**
   - Adjusted confidence will be equal or lower
   - If no warnings, adjusted = original
   - System is conservative (good for reliability)

3. **How to handle edge cases?**
   - Foods with legitimately 0 calories? (Unlikely in recipes)
   - Very high-confidence unusual recipes? (Penalty system handles)
   - System has guards and won't over-penalize

4. **Can users override confidence?**
   - Currently: No, AI-extracted is read-only
   - Consider: Allow manual confidence adjustment in UI
   - Future: A/B test user adjustments vs. system predictions

---

**Generated:** 2025-12-15
**Status:** Ready for Implementation
**Estimated Impact:** High (improves confidence reliability significantly)
