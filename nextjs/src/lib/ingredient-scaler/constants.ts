/**
 * Unit conversion tables and lookup maps for ingredient parsing
 */

import type { IngredientCategory } from "@/types/shopping-list";

// Unit conversion tables
export const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  "fl oz": 29.574,
  "fluid oz": 29.574,
  cup: 236.588,
  cups: 236.588,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  gallon: 3785.41,
  gallons: 3785.41,
};

export const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

// Common unit aliases for normalization
export const UNIT_ALIASES: Record<string, string> = {
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  "t.": "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  "T.": "tbsp",
  "tbs.": "tbsp",
  cup: "cup",
  cups: "cup",
  c: "cup",
  "c.": "cup",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
  package: "package",
  packages: "package",
  pkg: "package",
  bunch: "bunch",
  bunches: "bunch",
  head: "head",
  heads: "head",
  large: "large",
  medium: "medium",
  small: "small",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
};

// Common fractions and their decimal equivalents
export const FRACTIONS: Record<string, number> = {
  "1/8": 0.125,
  "1/4": 0.25,
  "1/3": 0.333,
  "1/2": 0.5,
  "2/3": 0.667,
  "3/4": 0.75,
};

// Regex patterns for parsing quantities
export const FRACTION_PATTERN = /(\d+\/\d+)/;
export const MIXED_NUMBER_PATTERN = /(\d+)\s+(\d+\/\d+)/;
export const DECIMAL_PATTERN = /(\d+\.?\d*)/;
export const RANGE_PATTERN = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;

// Define which units belong to which system
export const IMPERIAL_VOLUME_UNITS = ["tsp", "tbsp", "cup", "fl oz", "pint", "quart", "gallon"];
export const METRIC_VOLUME_UNITS = ["ml", "l"];
export const IMPERIAL_WEIGHT_UNITS = ["oz", "lb"];
export const METRIC_WEIGHT_UNITS = ["g", "kg"];

/**
 * Expanded descriptor lists for ingredient normalization
 */
export const PREPARATION_DESCRIPTORS = [
  "chopped", "diced", "sliced", "minced", "crushed", "ground",
  "shredded", "grated", "peeled", "julienned", "cubed", "quartered",
  "halved", "torn", "crumbled", "mashed", "pureed", "zested",
  "trimmed", "deveined", "pitted", "seeded", "cored", "deboned",
  "butterflied", "thinly", "thickly", "roughly", "finely", "coarsely",
];

export const STATE_DESCRIPTORS = [
  "fresh", "frozen", "dried", "canned", "raw", "cooked",
  "softened", "melted", "room temperature", "cold", "warm", "hot",
  "chilled", "thawed", "refrigerated", "ripe", "unripe", "rinsed",
  "drained", "packed", "loosely packed", "firmly packed",
];

export const QUALITY_DESCRIPTORS = [
  "organic", "free-range", "grass-fed", "low-sodium", "reduced-fat",
  "extra-virgin", "virgin", "light", "dark", "unsalted", "salted",
  "sweetened", "unsweetened", "plain", "vanilla", "whole", "skim",
  "fat-free", "low-fat", "nonfat", "2%", "1%", "boneless", "skinless",
  "bone-in", "skin-on", "lean", "extra-lean", "kosher", "gluten-free",
];

/**
 * Category keyword map for intelligent categorization
 */
export const CATEGORY_KEYWORDS: Record<IngredientCategory | string, string[]> = {
  "Produce": [
    // Vegetables
    "lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "celery",
    "potato", "spinach", "kale", "broccoli", "cauliflower", "zucchini",
    "squash", "mushroom", "cucumber", "cabbage", "asparagus", "artichoke",
    "eggplant", "beet", "radish", "turnip", "parsnip", "leek", "shallot",
    "scallion", "green onion", "chive", "corn", "pea", "bean sprout",
    "bok choy", "brussels sprout", "fennel", "arugula", "watercress",
    "endive", "radicchio", "swiss chard", "collard", "mustard green",
    // Fruits
    "apple", "banana", "orange", "lemon", "lime", "grapefruit", "avocado",
    "grape", "strawberry", "blueberry", "raspberry", "blackberry", "cherry",
    "peach", "plum", "nectarine", "apricot", "mango", "pineapple", "papaya",
    "kiwi", "melon", "watermelon", "cantaloupe", "honeydew", "pomegranate",
    "fig", "date", "pear", "coconut", "passion fruit", "dragon fruit",
    // Herbs
    "basil", "cilantro", "parsley", "mint", "thyme", "rosemary", "oregano",
    "dill", "sage", "tarragon", "chervil", "marjoram", "bay leaf", "lemongrass",
  ],
  "Meat & Seafood": [
    // Meat
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "veal", "venison",
    "bison", "rabbit", "goat", "bacon", "sausage", "ham", "prosciutto",
    "pancetta", "chorizo", "salami", "pepperoni", "hot dog", "bratwurst",
    "steak", "ground beef", "ground turkey", "ground pork", "ground chicken",
    "roast", "chop", "rib", "tenderloin", "sirloin", "filet", "brisket",
    "flank", "skirt", "breast", "thigh", "drumstick", "wing", "liver",
    // Seafood
    "salmon", "tuna", "cod", "tilapia", "halibut", "trout", "bass",
    "snapper", "mahi", "swordfish", "mackerel", "sardine", "anchovy",
    "shrimp", "prawn", "crab", "lobster", "scallop", "mussel", "clam",
    "oyster", "squid", "calamari", "octopus", "fish", "seafood",
  ],
  "Dairy & Eggs": [
    "milk", "cream", "half-and-half", "buttermilk", "evaporated milk",
    "condensed milk", "heavy cream", "whipping cream", "sour cream",
    "creme fraiche", "yogurt", "greek yogurt", "kefir",
    "butter", "margarine", "ghee",
    "cheese", "cheddar", "mozzarella", "parmesan", "feta", "gouda",
    "swiss", "provolone", "brie", "camembert", "blue cheese", "gorgonzola",
    "ricotta", "cottage cheese", "cream cheese", "mascarpone", "goat cheese",
    "gruyere", "manchego", "pecorino", "asiago", "havarti", "monterey jack",
    "colby", "american cheese", "velveeta", "queso",
    "egg", "eggs", "egg white", "egg yolk",
  ],
  "Pantry": [
    // Grains & Starches
    "flour", "bread flour", "cake flour", "whole wheat flour", "almond flour",
    "rice", "white rice", "brown rice", "jasmine rice", "basmati rice",
    "arborio rice", "wild rice", "quinoa", "couscous", "bulgur", "farro",
    "barley", "oat", "oats", "oatmeal", "cornmeal", "polenta", "grits",
    "pasta", "spaghetti", "penne", "rigatoni", "fettuccine", "linguine",
    "macaroni", "lasagna", "orzo", "noodle", "ramen", "udon", "soba",
    "bread crumb", "panko", "crouton",
    // Legumes
    "bean", "black bean", "kidney bean", "pinto bean", "navy bean",
    "cannellini", "chickpea", "garbanzo", "lentil", "split pea",
    // Oils & Vinegars
    "oil", "olive oil", "vegetable oil", "canola oil", "coconut oil",
    "sesame oil", "peanut oil", "avocado oil", "grapeseed oil",
    "vinegar", "balsamic", "red wine vinegar", "white wine vinegar",
    "apple cider vinegar", "rice vinegar", "sherry vinegar",
    // Sauces & Stocks
    "soy sauce", "tamari", "fish sauce", "worcestershire", "oyster sauce",
    "hoisin", "teriyaki", "broth", "stock", "bouillon", "tomato paste",
    "tomato sauce", "marinara", "alfredo",
    // Baking
    "sugar", "brown sugar", "powdered sugar", "confectioners sugar",
    "honey", "maple syrup", "molasses", "corn syrup", "agave",
    "baking powder", "baking soda", "yeast", "cornstarch", "arrowroot",
    "gelatin", "vanilla extract", "almond extract", "cocoa powder",
    "chocolate chip", "chocolate", "nut", "almond", "walnut", "pecan",
    "cashew", "peanut", "pistachio", "hazelnut", "macadamia", "pine nut",
    "seed", "sesame seed", "sunflower seed", "pumpkin seed", "flax seed",
    "chia seed", "poppy seed",
  ],
  "Spices": [
    "salt", "pepper", "black pepper", "white pepper", "sea salt", "kosher salt",
    "cumin", "paprika", "smoked paprika", "cayenne", "chili powder",
    "cinnamon", "nutmeg", "allspice", "clove", "cardamom", "coriander",
    "turmeric", "ginger", "curry powder", "garam masala", "five spice",
    "oregano", "thyme", "rosemary", "sage", "basil", "bay leaf", "dill",
    "tarragon", "marjoram", "parsley flakes", "chives",
    "garlic powder", "onion powder", "mustard powder", "celery salt",
    "red pepper flake", "crushed red pepper", "chili flake",
    "saffron", "sumac", "za'atar", "ras el hanout", "herbes de provence",
    "italian seasoning", "poultry seasoning", "old bay", "taco seasoning",
    "everything bagel seasoning",
  ],
  "Condiments": [
    "ketchup", "mustard", "yellow mustard", "dijon", "whole grain mustard",
    "mayonnaise", "mayo", "aioli", "hot sauce", "sriracha", "tabasco",
    "bbq sauce", "barbecue sauce", "ranch", "blue cheese dressing",
    "salsa", "pico de gallo", "guacamole", "hummus", "tahini",
    "pesto", "chimichurri", "tzatziki", "harissa", "gochujang",
    "relish", "pickle", "olive", "caper", "sun-dried tomato",
    "jam", "jelly", "preserves", "marmalade", "peanut butter", "almond butter",
    "nutella", "chutney", "horseradish", "wasabi",
  ],
  "Frozen": [
    "frozen", "ice cream", "gelato", "sorbet", "frozen yogurt",
    "frozen vegetable", "frozen fruit", "frozen pizza", "frozen dinner",
    "frozen waffle", "frozen pie", "frozen dough",
  ],
  "Beverages": [
    "water", "sparkling water", "soda", "cola", "sprite", "ginger ale",
    "juice", "orange juice", "apple juice", "grape juice", "cranberry juice",
    "lemonade", "iced tea", "sweet tea",
    "coffee", "espresso", "cold brew", "tea", "green tea", "black tea",
    "herbal tea", "chamomile", "matcha",
    "milk", "oat milk", "almond milk", "soy milk", "coconut milk",
    "wine", "red wine", "white wine", "rose", "champagne", "prosecco",
    "beer", "ale", "lager", "stout", "cider",
    "vodka", "rum", "tequila", "whiskey", "bourbon", "gin", "brandy",
  ],
  "Bakery": [
    "bread", "white bread", "wheat bread", "sourdough", "rye bread",
    "baguette", "ciabatta", "focaccia", "brioche", "challah",
    "bagel", "english muffin", "croissant", "danish", "muffin", "scone",
    "roll", "dinner roll", "hamburger bun", "hot dog bun", "slider bun",
    "tortilla", "flour tortilla", "corn tortilla", "wrap", "pita", "naan",
    "flatbread", "lavash", "cracker", "breadstick",
    "cake", "cupcake", "brownie", "cookie", "pie", "tart", "pastry",
    "donut", "doughnut", "cinnamon roll",
  ],
  "Snacks": [
    "chip", "potato chip", "tortilla chip", "corn chip", "pita chip",
    "cracker", "pretzel", "popcorn", "nut", "trail mix",
    "granola bar", "protein bar", "energy bar", "fruit snack",
    "beef jerky", "cheese puff", "cheeto", "dorito",
  ],
};
