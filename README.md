# Weekly Dinner Planner

Your personal dinner planning assistant! Plan your weekly dinners based on ingredients you have, discover new dinner recipes, and generate smart shopping lists for your Sunday grocery runs.

## Features

- **Smart Ingredient Matching**: Input your available ingredients and discover dinners you can make tonight
- **Weekly Dinner Planning**: Generate complete dinner plans for the week (7 days or customize)
- **Intelligent Shopping Lists**: Automatically create organized shopping lists based on your dinner plans
- **20 Diverse Dinner Recipes**: Collection spans comfort food, healthy options, quick meals, and meal-prep favorites
- **Pantry Management**: Track your ingredients and find dinners that maximize what you already have
- **Meal Prep Friendly**: Prioritizes recipes perfect for batch cooking and weekly prep

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
- Example: `chicken breast, rice, onion, garlic, olive oil, tomatoes, broccoli`

### 2. Discover Dinners

Find dinners you can make:
- **Option 5**: See dinners you can make with current ingredients (100% match)
- **Option 6**: See dinners where you're only missing a few ingredients
- **Option 7**: Browse all 20 dinner recipes
- **Option 8**: Search for specific recipes by name

### 3. Generate Your Weekly Dinner Plan

Create your week of dinners:
- **Option 10**: Generate a dinner plan from all available recipes
- **Option 11**: Generate a dinner plan based on your pantry ingredients (recommended!)

The planner will:
- Create varied dinners for each day of the week
- Prioritize meal-prep-friendly recipes
- Show you what ingredients you're missing
- Ensure no repeated meals

### 4. Create a Shopping List

Once you have a dinner plan:
- **Option 13**: Generate a shopping list from your dinner plan
- The list automatically excludes ingredients you already have
- Items are organized by category (Produce, Meat, Dairy, etc.)
- Shows amounts needed and which recipes use each ingredient

### 5. Your Sunday Routine

Weekly workflow for dinner planning:
1. **Saturday Evening**: Generate your weekly dinner plan (Option 11)
2. **Saturday Evening**: Create shopping list from the plan (Option 13)
3. **Sunday Morning**: Go shopping with your organized list
4. **Sunday Afternoon**: Update your pantry with new ingredients (Option 2)
5. **Sunday Afternoon**: Start meal prepping dinners for the week!

## Dinner Recipe Collection

The application includes 20 diverse dinner recipes:

### Chicken Dinners
- **Sheet Pan Lemon Herb Chicken** - One-pan, meal-prep-friendly
- **Thai Basil Chicken Stir-Fry** - Quick Asian-inspired
- **Chicken Fajita Bowls** - Mexican, healthy, meal-prep
- **Greek Chicken Bowls** - Mediterranean, meal-prep-friendly
- **Cajun Chicken Alfredo** - Comfort food, pasta
- **Balsamic Glazed Chicken** - Healthy, quick
- **One-Pot Chicken and Rice** - Easy cleanup, comfort food

### Beef & Pork
- **Slow Cooker Beef Stew** - Comfort food, meal-prep-friendly
- **Beef and Broccoli Stir-Fry** - Asian, quick
- **Mongolian Beef** - Asian, quick
- **Honey Garlic Pork Chops** - Quick, meal-prep-friendly
- **BBQ Pulled Pork** - Slow cooker, meal-prep-friendly
- **Spicy Sausage and Peppers** - Quick, Italian, one-pan

### Seafood
- **Teriyaki Salmon with Broccoli** - Healthy, quick, high-protein
- **Lemon Garlic Shrimp Pasta** - Quick, Italian
- **Mediterranean Baked Cod** - Healthy, quick

### Vegetarian
- **Vegetarian Stuffed Bell Peppers** - Healthy, meal-prep-friendly
- **Vegetarian Chickpea Curry** - Vegan, Indian, meal-prep-friendly

### Italian & Pasta
- **Baked Ziti with Italian Sausage** - Comfort food, meal-prep-friendly
- **Turkey Meatballs in Marinara** - Healthy, meal-prep-friendly

## Recipe Tags

Recipes are tagged to help you find what you need:
- **meal-prep-friendly**: Perfect for batch cooking
- **quick**: 30 minutes or less total time
- **healthy**: Nutritious, balanced meals
- **comfort-food**: Hearty, satisfying dinners
- **one-pan**: Minimal cleanup
- **slow-cooker**: Set it and forget it
- **asian**, **italian**, **mexican**, **mediterranean**: Cuisine styles

## Adding Your Own Recipes

Easily add your own dinner recipes:

1. Open `/recipes/dinners.json`
2. Add your recipe following this format:

```json
{
  "id": "d021",
  "name": "Your Dinner Recipe",
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
│   └── preferences.json.example
├── recipes/                 # Recipe database
│   └── dinners.json         # 20 dinner recipes
└── src/                     # Application modules
    ├── recipe_manager.py    # Recipe loading and searching
    ├── pantry.py           # Ingredient inventory
    ├── ingredient_matcher.py # Recipe matching logic
    ├── meal_planner.py     # Dinner plan generation
    └── shopping_list.py    # Shopping list creation
```

## Tips for Best Results

1. **Be Specific with Ingredients**: Add "chicken breast" rather than just "chicken"
2. **Update Your Pantry Weekly**: Keep it current for accurate recipe matching
3. **Use Meal-Prep Friendly Recipes**: These are designed for batch cooking
4. **Plan Ahead**: Generate your dinner plan Saturday evening for Sunday shopping
5. **Try New Things**: Mix familiar favorites with new recipes each week
6. **Batch Cook on Sunday**: Many recipes can be made in larger quantities

## Advanced Features

### Intelligent Ingredient Matching
The system uses smart matching that:
- Ignores common modifiers (fresh, frozen, chopped, diced, etc.)
- Handles plural/singular variations
- Performs partial matching (e.g., "cherry tomatoes" matches "tomatoes")
- Automatically includes common staples (salt, pepper, olive oil, etc.)

### Variety in Dinner Planning
The planner ensures:
- No repeated recipes in the same week
- Balanced mix of proteins and cooking styles
- Mix of quick and longer-cooking recipes
- Priority to meal-prep-friendly options

### Organized Shopping Lists
Shopping lists are:
- Categorized by grocery store sections (Produce, Meat, Dairy, Grains, etc.)
- Show total amounts needed for the week
- Indicate which recipes need each ingredient
- Automatically exclude items already in your pantry

## Example Workflow

```
Monday: Sheet Pan Lemon Herb Chicken (meal-prep 2 servings for Wed)
Tuesday: Lemon Garlic Shrimp Pasta (quick weeknight meal)
Wednesday: Leftover Lemon Herb Chicken
Thursday: Slow Cooker Beef Stew (started in morning)
Friday: Thai Basil Chicken Stir-Fry (quick)
Saturday: Baked Ziti with Italian Sausage
Sunday: BBQ Pulled Pork (slow cooker) + meal prep for next week
```

## Why Dinner-Only Focus?

This planner is specifically designed for dinner planning because:
- Dinners typically require more planning and preparation
- Sunday meal prep is primarily for dinners
- Shopping lists are mainly driven by dinner ingredients
- Breakfast and lunch are often simpler or more repetitive
- Dinner is usually the main family meal of the day

## Contributing

Want to add more dinner recipes? Feel free to:
1. Add recipes to `recipes/dinners.json`
2. Follow the existing recipe format
3. Use descriptive tags to help with categorization
4. Include accurate prep and cook times

## Future Enhancements

Potential features for future development:
- Nutritional information and calorie tracking
- Dietary restriction filters (gluten-free, dairy-free, keto, etc.)
- Recipe rating and favorites system
- Cost estimation for shopping lists
- Leftover management and planning
- Integration with online grocery delivery
- Mobile app version
- Recipe scaling for different serving sizes
- Meal prep instructions and timing

## License

This project is open source and available for personal use.

## Feedback

Found a bug or have a suggestion? Open an issue or submit a pull request!

---

Happy dinner planning! 🍽️
