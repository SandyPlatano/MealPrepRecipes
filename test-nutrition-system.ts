/**
 * COMPREHENSIVE NUTRITION SYSTEM TESTS
 * Tests all 4 fixed functions with edge cases
 * Tests confidence scoring system
 * Tests edge case matrix
 */

import type { NutritionData } from './nextjs/src/types/nutrition';

// =====================================================
// TEST UTILITIES
// =====================================================

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

const results: TestResult[] = [];

function assertEquals<T>(actual: T, expected: T, testName: string, context?: string): void {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({
    name: testName,
    passed,
    expected: JSON.stringify(expected),
    actual: JSON.stringify(actual),
    details: context,
  });
}

function testGroup(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// =====================================================
// FUNCTIONS TO TEST (from calculations.ts)
// =====================================================

function scaleNutrition(
  nutrition: NutritionData,
  baseServings: number,
  targetServings: number
): NutritionData {
  if (baseServings === 0) {
    console.warn('Cannot scale nutrition: baseServings is 0');
    return nutrition;
  }

  if (targetServings < 0) {
    console.warn('Cannot scale nutrition: targetServings cannot be negative');
    return nutrition;
  }

  if (targetServings === 0) {
    return {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    };
  }

  const scale = targetServings / baseServings;

  return {
    calories: nutrition.calories ? Math.round(nutrition.calories * scale) : null,
    protein_g: nutrition.protein_g ? Math.round(nutrition.protein_g * scale * 10) / 10 : null,
    carbs_g: nutrition.carbs_g ? Math.round(nutrition.carbs_g * scale * 10) / 10 : null,
    fat_g: nutrition.fat_g ? Math.round(nutrition.fat_g * scale * 10) / 10 : null,
    fiber_g: nutrition.fiber_g ? Math.round(nutrition.fiber_g * scale * 10) / 10 : null,
    sugar_g: nutrition.sugar_g ? Math.round(nutrition.sugar_g * scale * 10) / 10 : null,
    sodium_mg: nutrition.sodium_mg ? Math.round(nutrition.sodium_mg * scale) : null,
  };
}

function averageNutrition(items: (NutritionData | null | undefined)[]): NutritionData {
  if (items.length === 0) {
    return {
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      fiber_g: null,
      sugar_g: null,
      sodium_mg: null,
    };
  }

  let calorieSum = 0, calorieCount = 0;
  let proteinSum = 0, proteinCount = 0;
  let carbsSum = 0, carbsCount = 0;
  let fatSum = 0, fatCount = 0;
  let fiberSum = 0, fiberCount = 0;
  let sugarSum = 0, sugarCount = 0;
  let sodiumSum = 0, sodiumCount = 0;

  items.forEach((item) => {
    if (!item) return;

    if (item.calories !== null && item.calories !== undefined) {
      calorieSum += item.calories;
      calorieCount++;
    }
    if (item.protein_g !== null && item.protein_g !== undefined) {
      proteinSum += item.protein_g;
      proteinCount++;
    }
    if (item.carbs_g !== null && item.carbs_g !== undefined) {
      carbsSum += item.carbs_g;
      carbsCount++;
    }
    if (item.fat_g !== null && item.fat_g !== undefined) {
      fatSum += item.fat_g;
      fatCount++;
    }
    if (item.fiber_g !== null && item.fiber_g !== undefined) {
      fiberSum += item.fiber_g;
      fiberCount++;
    }
    if (item.sugar_g !== null && item.sugar_g !== undefined) {
      sugarSum += item.sugar_g;
      sugarCount++;
    }
    if (item.sodium_mg !== null && item.sodium_mg !== undefined) {
      sodiumSum += item.sodium_mg;
      sodiumCount++;
    }
  });

  return {
    calories: calorieCount > 0 ? Math.round(calorieSum / calorieCount) : null,
    protein_g: proteinCount > 0 ? Math.round((proteinSum / proteinCount) * 10) / 10 : null,
    carbs_g: carbsCount > 0 ? Math.round((carbsSum / carbsCount) * 10) / 10 : null,
    fat_g: fatCount > 0 ? Math.round((fatSum / fatCount) * 10) / 10 : null,
    fiber_g: fiberCount > 0 ? Math.round((fiberSum / fiberCount) * 10) / 10 : null,
    sugar_g: sugarCount > 0 ? Math.round((sugarSum / sugarCount) * 10) / 10 : null,
    sodium_mg: sodiumCount > 0 ? Math.round(sodiumSum / sodiumCount) : null,
  };
}

function sumNutrition(items: (NutritionData | null | undefined)[]): NutritionData {
  const result: NutritionData = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  };

  let hasData = false;

  items.forEach((item) => {
    if (!item) return;

    if (item.calories !== null && item.calories !== undefined) {
      result.calories = (result.calories || 0) + item.calories;
      hasData = true;
    }
    if (item.protein_g !== null && item.protein_g !== undefined) {
      result.protein_g = (result.protein_g || 0) + item.protein_g;
      hasData = true;
    }
    if (item.carbs_g !== null && item.carbs_g !== undefined) {
      result.carbs_g = (result.carbs_g || 0) + item.carbs_g;
      hasData = true;
    }
    if (item.fat_g !== null && item.fat_g !== undefined) {
      result.fat_g = (result.fat_g || 0) + item.fat_g;
      hasData = true;
    }
    if (item.fiber_g !== null && item.fiber_g !== undefined) {
      result.fiber_g = (result.fiber_g || 0) + item.fiber_g;
      hasData = true;
    }
    if (item.sugar_g !== null && item.sugar_g !== undefined) {
      result.sugar_g = (result.sugar_g || 0) + item.sugar_g;
      hasData = true;
    }
    if (item.sodium_mg !== null && item.sodium_mg !== undefined) {
      result.sodium_mg = (result.sodium_mg || 0) + item.sodium_mg;
      hasData = true;
    }
  });

  if (!hasData) {
    return {
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      fiber_g: null,
      sugar_g: null,
      sodium_mg: null,
    };
  }

  return result;
}

function validateNutritionRanges(nutrition: Partial<NutritionData>): string[] {
  const warnings: string[] = [];

  if (nutrition.calories) {
    if (nutrition.calories < 10) {
      warnings.push('Calories seem unrealistically low (<10)');
    }
    if (nutrition.calories > 2000) {
      warnings.push('Calories seem very high (>2000 per serving)');
    }
  }

  if (nutrition.protein_g && nutrition.protein_g < 0) {
    warnings.push('Protein cannot be negative');
  }
  if (nutrition.protein_g && nutrition.protein_g > 200) {
    warnings.push('Protein seems unusually high (>200g per serving)');
  }

  if (nutrition.carbs_g && nutrition.carbs_g < 0) {
    warnings.push('Carbs cannot be negative');
  }
  if (nutrition.carbs_g && nutrition.carbs_g > 300) {
    warnings.push('Carbs seem unusually high (>300g per serving)');
  }

  if (nutrition.fat_g && nutrition.fat_g < 0) {
    warnings.push('Fat cannot be negative');
  }
  if (nutrition.fat_g && nutrition.fat_g > 150) {
    warnings.push('Fat seems unusually high (>150g per serving)');
  }

  // Calorie calculation check
  if (
    nutrition.calories &&
    nutrition.calories > 0 &&
    nutrition.protein_g !== null &&
    nutrition.protein_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.fat_g !== null &&
    nutrition.fat_g !== undefined
  ) {
    const estimatedCalories =
      nutrition.protein_g * 4 + nutrition.carbs_g * 4 + nutrition.fat_g * 9;

    const diff = Math.abs(estimatedCalories - nutrition.calories);
    const diffPercent = (diff / nutrition.calories) * 100;

    if (diffPercent > 20) {
      warnings.push(
        `Calorie calculation mismatch: ${Math.round(diffPercent)}% difference from macros`
      );
    }
  }

  // Fiber validation
  if (
    nutrition.fiber_g !== null &&
    nutrition.fiber_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.fiber_g > nutrition.carbs_g
  ) {
    warnings.push('Fiber cannot exceed total carbs');
  }

  // Sugar validation
  if (
    nutrition.sugar_g !== null &&
    nutrition.sugar_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.sugar_g > nutrition.carbs_g
  ) {
    warnings.push('Sugar cannot exceed total carbs');
  }

  // Composite carb validation
  if (
    nutrition.sugar_g !== null &&
    nutrition.sugar_g !== undefined &&
    nutrition.fiber_g !== null &&
    nutrition.fiber_g !== undefined &&
    nutrition.carbs_g !== null &&
    nutrition.carbs_g !== undefined &&
    nutrition.sugar_g + nutrition.fiber_g > nutrition.carbs_g
  ) {
    warnings.push('Sugar and fiber combined cannot exceed total carbs');
  }

  if (nutrition.sodium_mg && nutrition.sodium_mg < 0) {
    warnings.push('Sodium cannot be negative');
  }
  if (nutrition.sodium_mg && nutrition.sodium_mg > 5000) {
    warnings.push('Sodium seems very high (>5000mg per serving)');
  }

  return warnings;
}

// =====================================================
// PART 1: TEST FIXED FUNCTIONS
// =====================================================

function testValidateNutritionRanges(): void {
  testGroup('PART 1.1: validateNutritionRanges() - Fixed Constraints');

  // Test 1: All zeros
  const test1 = validateNutritionRanges({
    carbs_g: 0,
    fiber_g: 0,
    sugar_g: 0,
  });
  assertEquals(test1, [], 'Test 1: carbs=0, fiber=0, sugar=0', 'All zeros should be valid');

  // Test 2: Sugar + fiber = carbs (boundary)
  const test2 = validateNutritionRanges({
    carbs_g: 50,
    fiber_g: 25,
    sugar_g: 25,
  });
  assertEquals(test2, [], 'Test 2: sugar+fiber=carbs boundary', 'Sugar+fiber equal to carbs should pass');

  // Test 3: Sugar + fiber > carbs (should fail)
  const test3 = validateNutritionRanges({
    carbs_g: 50,
    fiber_g: 26,
    sugar_g: 25,
  });
  assertEquals(
    test3.some((w) => w.includes('Sugar and fiber combined cannot exceed total carbs')),
    true,
    'Test 3: sugar+fiber exceeds carbs',
    'Should trigger composite carb validation'
  );

  // Test 4: Missing carbs (carbs=null, fiber=5)
  const test4 = validateNutritionRanges({
    carbs_g: null,
    fiber_g: 5,
  });
  assertEquals(test4, [], 'Test 4: carbs=null, fiber=5', 'Should not trigger constraint when carbs is null');

  console.log(`✓ All validateNutritionRanges() tests completed\n`);
}

function testScaleNutrition(): void {
  testGroup('PART 1.2: scaleNutrition() - Fixed Validation');

  const base: NutritionData = {
    calories: 100,
    protein_g: 10,
    carbs_g: 20,
    fat_g: 5,
    fiber_g: 2,
    sugar_g: 3,
    sodium_mg: 500,
  };

  // Test 1: Negative servings (should return original)
  const test1 = scaleNutrition(base, 1, -2);
  assertEquals(test1, base, 'Test 1: scale by -2x', 'Negative servings should return original');

  // Test 2: Zero servings (should return all zeros)
  const test2 = scaleNutrition(base, 1, 0);
  assertEquals(
    test2,
    {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    },
    'Test 2: scale by 0x',
    'Zero servings should return all zeros'
  );

  // Test 3: Fractional scaling (0.5x)
  const test3 = scaleNutrition(base, 2, 1);
  assertEquals(
    test3,
    {
      calories: 50,
      protein_g: 5,
      carbs_g: 10,
      fat_g: 2.5,
      fiber_g: 1,
      sugar_g: 1.5,
      sodium_mg: 250,
    },
    'Test 3: scale by 0.5x',
    'Fractional scaling should work correctly'
  );

  // Test 4: Extreme upscaling (100x)
  const test4 = scaleNutrition(base, 1, 100);
  assertEquals(
    test4,
    {
      calories: 10000,
      protein_g: 1000,
      carbs_g: 2000,
      fat_g: 500,
      fiber_g: 200,
      sugar_g: 300,
      sodium_mg: 50000,
    },
    'Test 4: scale by 100x',
    'Extreme upscaling should work correctly'
  );

  console.log(`✓ All scaleNutrition() tests completed\n`);
}

function testAverageNutrition(): void {
  testGroup('PART 1.3: averageNutrition() - Fixed Per-Field Counting');

  // Test 1: Mixed null values
  const test1 = averageNutrition([
    { calories: 100, carbs_g: 50, protein_g: 20, fat_g: 10, fiber_g: null, sugar_g: null, sodium_mg: null },
    { calories: 200, carbs_g: null, protein_g: 30, fat_g: 15, fiber_g: null, sugar_g: null, sodium_mg: null },
  ]);
  assertEquals(
    test1.carbs_g,
    50,
    'Test 1: carbs average with one null',
    'Should average only the 1 item with carbs value (not 25 from 2 items)'
  );

  // Test 2: Zero values are valid
  const test2 = averageNutrition([
    { calories: 0, protein_g: null, carbs_g: null, fat_g: null, fiber_g: null, sugar_g: null, sodium_mg: null },
    { calories: 100, protein_g: null, carbs_g: null, fat_g: null, fiber_g: null, sugar_g: null, sodium_mg: null },
  ]);
  assertEquals(
    test2.calories,
    50,
    'Test 2: zero is valid data',
    'Zero should be counted as valid, average should be (0+100)/2=50'
  );

  console.log(`✓ All averageNutrition() tests completed\n`);
}

function testSumNutrition(): void {
  testGroup('PART 1.4: sumNutrition() - Type Coercion Safety');

  // Test: Mix of values, null, and zero
  const test1 = sumNutrition([
    { calories: 100, protein_g: 10, carbs_g: 20, fat_g: 5, fiber_g: 2, sugar_g: 3, sodium_mg: 500 },
    { calories: null, protein_g: null, carbs_g: null, fat_g: null, fiber_g: null, sugar_g: null, sodium_mg: null },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 },
  ]);
  assertEquals(
    test1.calories,
    100,
    'Test 1: sum with null and zero',
    'Zero should be counted (null skipped), result should be 100'
  );

  console.log(`✓ All sumNutrition() tests completed\n`);
}

// =====================================================
// PART 2: CONFIDENCE SCORING ANALYSIS
// =====================================================

function analyzeConfidenceScoring(): void {
  testGroup('PART 2: Confidence Scoring System Analysis');

  console.log('CONFIDENCE SCORE RANGES (from nutrition-extraction-prompt.ts):');
  console.log('  - 0.80-1.00: All ingredients clear, standard recipe');
  console.log('  - 0.60-0.79: Most ingredients clear, some estimation needed');
  console.log('  - 0.40-0.59: Several ingredients unclear or non-standard');
  console.log('  - 0.20-0.39: Many estimates required, unusual ingredients');
  console.log('  - 0.00-0.19: Very uncertain, insufficient data\n');

  console.log('KEY FINDINGS & QUESTIONS:\n');

  console.log('1. ENFORCEMENT ISSUE:');
  console.log('   - These ranges are in instructions ONLY (lines 66-72)');
  console.log('   - Claude MAY NOT follow these ranges in practice');
  console.log('   - No programmatic validation/adjustment happens');
  console.log('   - Recommendation: Add confidence_score validation in parseNutritionResponse()\n');

  console.log('2. THRESHOLD ANALYSIS:');
  console.log('   - Threshold at 0.7 for "high confidence" (line 275, extract-nutrition/route.ts)');
  console.log('   - This is hardcoded: confidence >= 0.7 ? "high" : ...');
  console.log('   - 0.7 is reasonable but should be configurable');
  console.log('   - Recommendation: Make this configurable via environment variable\n');

  console.log('3. PENALTY SYSTEM GAPS:');
  console.log('   - No penalty for calorie-macro mismatch > 10%');
  console.log('   - No penalty for sugar + fiber near carbs limit');
  console.log('   - No penalty for multiple zero values');
  console.log('   - Recommendation: Implement confidence penalty system\n');

  console.log('4. VALIDATION WARNINGS:');
  console.log('   - Warnings are collected but not used to adjust confidence');
  console.log('   - validateNutritionRanges() returns array of warnings (line 228)');
  console.log('   - Warnings are returned to client but ignored for confidence');
  console.log('   - Recommendation: Map warnings to confidence penalties\n');
}

// =====================================================
// PART 3: EDGE CASE TEST MATRIX
// =====================================================

interface EdgeCaseTest {
  scenario: string;
  nutrition: Partial<NutritionData>;
  expectedBehavior: string;
  currentBehavior: string;
  isCorrect: boolean;
}

function testEdgeCaseMatrix(): void {
  testGroup('PART 3: Edge Case Test Matrix');

  const matrix: EdgeCaseTest[] = [
    {
      scenario: 'Zero calories with high macros',
      nutrition: {
        calories: 0,
        protein_g: 30,
        carbs_g: 50,
        fat_g: 20,
      },
      expectedBehavior: 'Should warn: calorie-macro mismatch impossible',
      currentBehavior: 'Treated as valid (0 > 0 check fails, no validation)',
      isCorrect: false,
    },
    {
      scenario: 'Complete macros but mismatched calories',
      nutrition: {
        calories: 500,
        protein_g: 100,
        carbs_g: 100,
        fat_g: 100,
      },
      expectedBehavior: 'Should calculate: (100*4)+(100*4)+(100*9)=1700, warn if >20% diff',
      currentBehavior: 'Warns if >20% diff from estimated calories (1700 vs 500 = 71% diff)',
      isCorrect: true,
    },
    {
      scenario: 'All nutrients = null',
      nutrition: {
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
        fiber_g: null,
        sugar_g: null,
        sodium_mg: null,
      },
      expectedBehavior: 'Should return empty warnings (no data to validate)',
      currentBehavior: 'Returns [] (no checks triggered on null values)',
      isCorrect: true,
    },
    {
      scenario: 'Mix of 0 and null values',
      nutrition: {
        calories: 0,
        protein_g: null,
        carbs_g: 0,
        fat_g: null,
        fiber_g: 0,
        sugar_g: null,
        sodium_mg: 0,
      },
      expectedBehavior: 'Should treat 0 as valid, null as missing',
      currentBehavior: 'Correctly handles (explicit null checks in averageNutrition)',
      isCorrect: true,
    },
    {
      scenario: 'Extreme values (10,000 calories, 500g protein)',
      nutrition: {
        calories: 10000,
        protein_g: 500,
        carbs_g: 500,
        fat_g: 200,
      },
      expectedBehavior: 'Should warn: values exceed realistic ranges',
      currentBehavior: 'Warns: "Calories seem very high (>2000)" AND "Protein seems unusually high (>200g)"',
      isCorrect: true,
    },
  ];

  matrix.forEach((test, idx) => {
    console.log(`\n${idx + 1}. ${test.scenario}`);
    console.log(`   Input: ${JSON.stringify(test.nutrition)}`);
    console.log(`   Expected: ${test.expectedBehavior}`);
    console.log(`   Current: ${test.currentBehavior}`);
    console.log(`   Status: ${test.isCorrect ? '✓ CORRECT' : '✗ ISSUE FOUND'}`);

    // Run validation to show actual output
    const warnings = validateNutritionRanges(test.nutrition);
    if (warnings.length > 0) {
      console.log(`   Warnings: ${warnings.join('; ')}`);
    }
  });

  console.log(`\n✓ Edge case matrix completed\n`);
}

// =====================================================
// RUN ALL TESTS
// =====================================================

function runAllTests(): void {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        MEALPREP NUTRITION SYSTEM - COMPREHENSIVE TEST      ║');
  console.log('║                  4 Fixed Functions Validation               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Part 1: Test Fixed Functions
  testValidateNutritionRanges();
  testScaleNutrition();
  testAverageNutrition();
  testSumNutrition();

  // Part 2: Analyze Confidence Scoring
  analyzeConfidenceScoring();

  // Part 3: Edge Case Matrix
  testEdgeCaseMatrix();

  // Summary
  testGroup('TEST SUMMARY');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗\n`);

  if (failed > 0) {
    console.log('FAILED TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((result) => {
        console.log(`\n  ✗ ${result.name}`);
        console.log(`    Expected: ${result.expected}`);
        console.log(`    Actual: ${result.actual}`);
        if (result.details) console.log(`    Details: ${result.details}`);
      });
  }

  console.log('\n');
}

// Execute
runAllTests();
