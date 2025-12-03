/**
 * Categorize ingredients by grocery store aisle
 */

const AISLE_KEYWORDS = {
  '🥬 Produce': [
    'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'berry', 'strawberry', 'blueberry',
    'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower', 'carrot',
    'celery', 'onion', 'garlic', 'ginger', 'pepper', 'bell pepper', 'tomato', 'cucumber',
    'zucchini', 'squash', 'potato', 'sweet potato', 'avocado', 'mushroom', 'herb', 'basil',
    'parsley', 'cilantro', 'rosemary', 'thyme', 'oregano', 'mint', 'corn', 'peas', 'bean',
    'green bean', 'asparagus', 'artichoke', 'eggplant', 'radish', 'turnip', 'beet',
  ],
  '🥩 Meat & Seafood': [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'prosciutto',
    'salmon', 'tuna', 'cod', 'halibut', 'shrimp', 'prawn', 'crab', 'lobster', 'scallop',
    'mussel', 'clam', 'oyster', 'fish', 'fillet', 'steak', 'ground', 'chop', 'breast',
    'thigh', 'wing', 'drumstick',
  ],
  '🥛 Dairy & Eggs': [
    'milk', 'cream', 'cheese', 'butter', 'yogurt', 'sour cream', 'cottage cheese',
    'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'feta', 'goat cheese', 'cream cheese',
    'egg', 'yolk', 'white',
  ],
  '🍞 Bakery & Bread': [
    'bread', 'baguette', 'roll', 'bun', 'pita', 'naan', 'tortilla', 'wrap', 'croissant',
    'muffin', 'biscuit', 'bagel', 'crouton', 'breadcrumb',
  ],
  '🥫 Canned & Pantry': [
    'flour', 'sugar', 'brown sugar', 'powdered sugar', 'honey', 'maple syrup', 'molasses',
    'oil', 'olive oil', 'vegetable oil', 'canola oil', 'sesame oil', 'coconut oil',
    'vinegar', 'balsamic', 'rice vinegar', 'apple cider vinegar', 'soy sauce', 'worcestershire',
    'broth', 'stock', 'bouillon', 'tomato paste', 'tomato sauce', 'marinara', 'pasta sauce',
    'canned', 'can', 'jar', 'diced tomato', 'crushed tomato', 'bean', 'black bean',
    'kidney bean', 'chickpea', 'lentil', 'rice', 'pasta', 'noodle', 'spaghetti', 'penne',
    'macaroni', 'quinoa', 'couscous', 'bulgur', 'barley', 'oats', 'oatmeal', 'cereal',
    'cracker', 'chip', 'nut', 'almond', 'walnut', 'pecan', 'peanut', 'cashew', 'pistachio',
    'seed', 'sesame seed', 'sunflower seed', 'pumpkin seed', 'chocolate', 'cocoa', 'vanilla',
    'baking powder', 'baking soda', 'yeast', 'cornstarch', 'arrowroot',
  ],
  '🧊 Frozen': [
    'frozen', 'ice cream', 'sorbet', 'gelato', 'frozen vegetable', 'frozen fruit',
    'frozen berry', 'frozen pea', 'frozen corn',
  ],
  '🧂 Spices & Condiments': [
    'salt', 'pepper', 'black pepper', 'red pepper', 'cayenne', 'paprika', 'cumin',
    'coriander', 'turmeric', 'curry', 'garam masala', 'cinnamon', 'nutmeg', 'clove',
    'allspice', 'cardamom', 'star anise', 'bay leaf', 'mustard', 'ketchup', 'mayonnaise',
    'hot sauce', 'sriracha', 'salsa', 'relish', 'pickle', 'olive', 'capers',
  ],
};

/**
 * Categorize an ingredient by store aisle
 */
export function categorizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase();
  
  for (const [aisle, keywords] of Object.entries(AISLE_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return aisle;
    }
  }
  
  return '🧴 Other';
}

/**
 * Sort ingredients by grocery store aisle order
 */
export function sortByAisle(ingredients) {
  const aisleOrder = [
    '🥬 Produce',
    '🥩 Meat & Seafood',
    '🥛 Dairy & Eggs',
    '🍞 Bakery & Bread',
    '🥫 Canned & Pantry',
    '🧊 Frozen',
    '🧂 Spices & Condiments',
    '🧴 Other',
  ];

  const categorized = ingredients.map(ing => ({
    ingredient: ing,
    aisle: categorizeIngredient(ing),
  }));

  categorized.sort((a, b) => {
    const aIndex = aisleOrder.indexOf(a.aisle);
    const bIndex = aisleOrder.indexOf(b.aisle);
    return aIndex - bIndex;
  });

  return categorized;
}

/**
 * Group ingredients by aisle
 */
export function groupByAisle(ingredients) {
  const grouped = {};
  
  ingredients.forEach(ing => {
    const aisle = categorizeIngredient(ing);
    if (!grouped[aisle]) {
      grouped[aisle] = [];
    }
    grouped[aisle].push(ing);
  });

  // Sort aisles in store order
  const aisleOrder = [
    '🥬 Produce',
    '🥩 Meat & Seafood',
    '🥛 Dairy & Eggs',
    '🍞 Bakery & Bread',
    '🥫 Canned & Pantry',
    '🧊 Frozen',
    '🧂 Spices & Condiments',
    '🧴 Other',
  ];

  const sorted = {};
  aisleOrder.forEach(aisle => {
    if (grouped[aisle]) {
      sorted[aisle] = grouped[aisle];
    }
  });

  return sorted;
}

