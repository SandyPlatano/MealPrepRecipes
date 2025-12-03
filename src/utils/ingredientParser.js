/**
 * Parse and scale ingredient quantities
 */

/**
 * Parse an ingredient string into structured data
 * Examples:
 * "2 cups flour" -> { amount: 2, unit: "cups", item: "flour", original: "2 cups flour" }
 * "1/2 teaspoon salt" -> { amount: 0.5, unit: "teaspoon", item: "salt", original: "1/2 teaspoon salt" }
 * "Salt to taste" -> { amount: null, unit: null, item: "Salt to taste", original: "Salt to taste" }
 */
export function parseIngredient(ingredient) {
  const original = ingredient.trim();
  
  // Check for non-scalable items
  const nonScalablePatterns = [
    /to taste/i,
    /as needed/i,
    /for serving/i,
    /optional/i,
    /garnish/i,
  ];
  
  if (nonScalablePatterns.some(pattern => pattern.test(original))) {
    return {
      amount: null,
      unit: null,
      item: original,
      original,
      scalable: false,
    };
  }

  // Match patterns like "2 cups", "1/2 tsp", "3-4 cloves"
  const quantityPattern = /^(\d+(?:\/\d+)?(?:\.\d+)?|\d+\.\d+)(?:\s*-\s*(\d+(?:\/\d+)?(?:\.\d+)?|\d+\.\d+))?\s*([a-zA-Z]+)?/;
  const match = original.match(quantityPattern);

  if (!match) {
    // No quantity found, return as-is
    return {
      amount: null,
      unit: null,
      item: original,
      original,
      scalable: false,
    };
  }

  const amountStr = match[1];
  const rangeEnd = match[2];
  const unit = match[3] || '';
  const item = original.substring(match[0].length).trim();

  // Parse fraction or decimal
  let amount = parseAmount(amountStr);
  let hasRange = false;
  let rangeEndAmount = null;

  if (rangeEnd) {
    hasRange = true;
    rangeEndAmount = parseAmount(rangeEnd);
  }

  return {
    amount,
    rangeEndAmount,
    hasRange,
    unit: unit.toLowerCase(),
    item: item || original,
    original,
    scalable: true,
  };
}

/**
 * Parse amount string (handles fractions and decimals)
 */
function parseAmount(str) {
  if (str.includes('/')) {
    const [num, den] = str.split('/').map(Number);
    return num / den;
  }
  return parseFloat(str);
}

/**
 * Scale an ingredient by a multiplier
 */
export function scaleIngredient(ingredient, multiplier) {
  const parsed = typeof ingredient === 'string' 
    ? parseIngredient(ingredient)
    : ingredient;

  if (!parsed.scalable || parsed.amount === null) {
    return parsed.original;
  }

  const scaledAmount = parsed.amount * multiplier;
  const scaledRangeEnd = parsed.hasRange && parsed.rangeEndAmount
    ? parsed.rangeEndAmount * multiplier
    : null;

  // Format the scaled amount nicely
  let amountStr = formatAmount(scaledAmount);
  if (scaledRangeEnd) {
    amountStr += `-${formatAmount(scaledRangeEnd)}`;
  }

  if (parsed.unit) {
    return `${amountStr} ${parsed.unit} ${parsed.item}`.trim();
  }

  return `${amountStr} ${parsed.item}`.trim();
}

/**
 * Format amount nicely (convert decimals to fractions when appropriate)
 */
function formatAmount(amount) {
  // If it's a whole number, return as integer
  if (amount % 1 === 0) {
    return amount.toString();
  }

  // Try common fractions
  const fractions = [
    { decimal: 0.125, fraction: '1/8' },
    { decimal: 0.25, fraction: '1/4' },
    { decimal: 0.333, fraction: '1/3' },
    { decimal: 0.5, fraction: '1/2' },
    { decimal: 0.667, fraction: '2/3' },
    { decimal: 0.75, fraction: '3/4' },
  ];

  for (const { decimal, fraction } of fractions) {
    if (Math.abs(amount - decimal) < 0.01) {
      return fraction;
    }
  }

  // Otherwise return as decimal with 1 decimal place
  return amount.toFixed(1);
}

/**
 * Scale all ingredients in a recipe
 */
export function scaleRecipeIngredients(ingredients, multiplier) {
  return ingredients.map(ing => scaleIngredient(ing, multiplier));
}

