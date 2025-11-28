# Meal Prep Planner

Your personal meal prep assistant that helps you plan weekly meals based on the ingredients you have, discover new recipes, and generate smart shopping lists for your Sunday grocery runs!

## Features

- **Smart Ingredient Matching**: Input your available ingredients and discover recipes you can make right now
- **Weekly Meal Planning**: Generate complete meal plans for the week with breakfast, lunch, and dinner options
- **Intelligent Shopping Lists**: Automatically create organized shopping lists based on your meal plans
- **Recipe Database**: Diverse collection of recipes across all meal categories (breakfast, lunch, dinner, snacks)
- **Pantry Management**: Track your ingredients and find recipes that maximize what you already have
- **Meal Prep Friendly**: Prioritizes recipes that are perfect for batch cooking and weekly prep

## Getting Started

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd MealPrepRecipes
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Quick Start

Run the application:
```bash
python meal_prep.py
```

Or if you made it executable:
```bash
./meal_prep.py
```

## How to Use

### 1. Set Up Your Pantry

Start by adding ingredients you currently have:
- Choose option `2` from the main menu
- Enter ingredients separated by commas
- Example: `chicken breast, rice, onion, garlic, olive oil, tomatoes`

### 2. Discover Recipes

Find recipes you can make:
- **Option 5**: See recipes you can make with current ingredients (100% match)
- **Option 6**: See recipes where you're only missing a few ingredients
- **Option 7**: Browse all recipes by category
- **Option 8**: Search for specific recipes by name

### 3. Generate a Meal Plan

Create your weekly meal plan:
- **Option 10**: Generate a meal plan from all available recipes
- **Option 11**: Generate a meal plan based on your pantry ingredients (smart option!)

The planner will:
- Create varied meals for each day
- Prioritize meal-prep-friendly recipes
- Show you what ingredients you're missing
- Organize meals by breakfast, lunch, and dinner

### 4. Create a Shopping List

Once you have a meal plan:
- **Option 13**: Generate a shopping list from your meal plan
- The list automatically excludes ingredients you already have
- Items are organized by category (Produce, Meat, Dairy, etc.)
- Shows amounts needed and which recipes use each ingredient

### 5. Sunday Routine

Your weekly workflow:
1. **Saturday**: Generate your weekly meal plan (Option 11)
2. **Saturday**: Create shopping list from the plan (Option 13)
3. **Sunday**: Go shopping with your organized list
4. **Sunday**: Update your pantry with new ingredients (Option 2)
5. **Sunday**: Start meal prepping!

## Recipe Database

The application includes diverse recipes across categories:

### Breakfast (4 recipes)
- Overnight Oats with Berries (no-cook, meal-prep)
- Vegetable Egg Muffins (high-protein, meal-prep)
- Avocado Toast with Poached Egg (quick)
- Protein Pancakes (high-protein)

### Lunch (4 recipes)
- Mediterranean Quinoa Bowl (vegan, meal-prep)
- Asian Chicken Lettuce Wraps (low-carb)
- Southwest Black Bean Bowl (vegan, meal-prep)
- Greek Chicken Pita (high-protein)

### Dinner (6 recipes)
- Sheet Pan Lemon Herb Chicken (one-pan, meal-prep)
- Teriyaki Salmon with Broccoli (quick, healthy)
- Slow Cooker Beef Stew (comfort-food, meal-prep)
- Vegetarian Stuffed Bell Peppers (meal-prep)
- Thai Basil Chicken Stir-Fry (quick)
- Baked Ziti with Italian Sausage (comfort-food, meal-prep)

### Snacks (3 recipes)
- Energy Balls (no-cook, healthy)
- Hummus with Veggie Sticks (vegan, no-cook)
- Greek Yogurt Parfait (high-protein, quick)

## Adding Your Own Recipes

You can easily add your own recipes to the database:

1. Navigate to the `recipes/` directory
2. Open the appropriate category file (breakfast.json, lunch.json, dinner.json, or snacks.json)
3. Add your recipe following this format:

```json
{
  "id": "d007",
  "name": "Your Recipe Name",
  "category": "dinner",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy",
  "tags": ["meal-prep-friendly", "healthy"],
  "ingredients": [
    {"item": "chicken breast", "amount": "2 lbs"},
    {"item": "vegetables", "amount": "2 cups"}
  ],
  "instructions": [
    "Step 1 of your recipe",
    "Step 2 of your recipe"
  ]
}
```

## Project Structure

```
MealPrepRecipes/
├── meal_prep.py              # Main application
├── requirements.txt          # Python dependencies
├── README.md                # This file
├── data/                    # User data (gitignored)
│   ├── pantry.json          # Your ingredient inventory
│   ├── preferences.json     # Your preferences
│   └── meal_plans/          # Saved meal plans
├── recipes/                 # Recipe database
│   ├── breakfast.json
│   ├── lunch.json
│   ├── dinner.json
│   └── snacks.json
└── src/                     # Application modules
    ├── recipe_manager.py    # Recipe loading and searching
    ├── pantry.py           # Ingredient inventory
    ├── ingredient_matcher.py # Recipe matching logic
    ├── meal_planner.py     # Meal plan generation
    └── shopping_list.py    # Shopping list creation
```

## Tips for Best Results

1. **Be Specific with Ingredients**: Add specific items like "chicken breast" rather than just "chicken"
2. **Update Your Pantry Regularly**: Keep your pantry current for accurate recipe matching
3. **Use Meal-Prep Friendly Recipes**: These are designed for batch cooking
4. **Try New Things**: The planner includes creative recipes to expand your cooking repertoire
5. **Plan Ahead**: Generate your meal plan a day before shopping

## Advanced Features

### Ingredient Matching Intelligence
The system uses smart matching that:
- Ignores common modifiers (fresh, frozen, chopped, etc.)
- Handles plural/singular variations
- Performs partial matching (e.g., "cherry tomatoes" matches "tomatoes")
- Automatically includes common staples (salt, pepper, olive oil, etc.)

### Meal Plan Variety
The meal planner ensures:
- No repeated recipes in the same week (unless there aren't enough recipes)
- Balanced nutrition across meals
- Mix of quick and longer-cooking recipes
- Priority to meal-prep-friendly options

### Smart Shopping Lists
Shopping lists are:
- Organized by grocery store sections
- Show total amounts needed
- Indicate which recipes need each ingredient
- Exclude items already in your pantry

## Contributing

Want to add more recipes? Feel free to:
1. Add recipes to the JSON files in the `recipes/` directory
2. Follow the existing recipe format
3. Use descriptive tags to help with categorization
4. Test your recipes with the app

## Future Enhancements

Potential features for future development:
- Nutritional information and calorie tracking
- Dietary restriction filters (gluten-free, dairy-free, etc.)
- Recipe rating and favorites
- Cost estimation for shopping lists
- Export meal plans to PDF
- Mobile app version
- Recipe scaling for different serving sizes
- Integration with online grocery shopping

## License

This project is open source and available for personal use.

## Feedback

Found a bug or have a suggestion? Open an issue or submit a pull request!

---

Happy meal prepping! 🥗🍳🥘
