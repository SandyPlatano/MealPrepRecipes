# Meal Prep Recipe Manager - Web App

A modern, responsive web application for managing and searching meal prep recipes. Built with React, Vite, and Tailwind CSS.

## Features

### 1. Protein-Based Recipe Search
- Search recipes by protein type (chicken, beef, salmon, tofu, vegetarian, etc.)
- View matching recipes with key information:
  - Recipe title and protein type
  - Total time (prep + cook)
  - Number of servings
  - Key ingredients preview
  - Recipe tags
- Clean, scannable results display

### 2. Ingredient-Based Recipe Matching
- Enter ingredients you have on hand (comma-separated)
- Smart ingredient matching algorithm:
  - Partial matching (e.g., "tomato" matches "cherry tomatoes")
  - Match percentage calculation
  - Results ranked by match percentage
- Color-coded match indicators:
  - Green: 100% match (you have everything!)
  - Yellow: 70-99% match (missing a few ingredients)
  - Orange: Below 70% match
- Shows both matched and missing ingredients for each recipe

### 3. Add New Recipes
- Comprehensive form with validation:
  - Recipe title *
  - Protein type *
  - Prep time and cook time *
  - Number of servings *
  - Ingredients list (one per line) *
  - Instructions (one step per line) *
  - Tags (comma-separated, optional)
- Real-time validation with error messages
- Generates properly formatted markdown files
- Success confirmation message
- Automatically adds to recipe database

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **JavaScript (ES6+)** - Programming language

## Project Structure

```
MealPrepRecipes/
├── recipes/                          # Recipe markdown files
│   ├── sheet-pan-lemon-herb-chicken.md
│   ├── teriyaki-salmon-with-broccoli.md
│   ├── vegetarian-stuffed-bell-peppers.md
│   ├── honey-garlic-pork-chops.md
│   └── beef-and-broccoli-stir-fry.md
├── src/
│   ├── components/
│   │   ├── ProteinSearch.jsx        # Protein search component
│   │   ├── IngredientSearch.jsx     # Ingredient matching component
│   │   └── AddRecipe.jsx            # Add recipe form component
│   ├── utils/
│   │   ├── recipeParser.js          # Markdown parsing utilities
│   │   └── searchUtils.js           # Search algorithms
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # App entry point
│   └── index.css                    # Global styles + Tailwind
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── postcss.config.js                # PostCSS configuration
```

## Installation

1. **Prerequisites:**
   - Node.js 18+ and npm installed

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App

### Development Mode
Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
Build the app for production:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

### Preview Production Build
Preview the production build locally:

```bash
npm run preview
```

## Recipe Markdown Format

All recipes follow this consistent markdown format:

```markdown
# Recipe Title

## Protein Type
[Chicken/Beef/Pork/Fish/Vegetarian/etc.]

## Prep Time
[X minutes]

## Cook Time
[X minutes]

## Servings
[Number]

## Ingredients
- Ingredient 1
- Ingredient 2
- Ingredient 3

## Instructions
1. Step 1
2. Step 2
3. Step 3

## Tags
tag1, tag2, tag3
```

## Usage Guide

### Searching by Protein

1. Click the "Search by Protein" tab
2. Enter a protein type (e.g., "chicken", "salmon", "vegetarian")
3. Click "Search"
4. Browse results with full recipe details
5. Click "Clear" to start a new search

### Searching by Ingredients

1. Click the "Search by Ingredients" tab
2. Enter ingredients you have, separated by commas
   - Example: `chicken, garlic, broccoli, soy sauce, honey`
3. Click "Find Recipes"
4. View results ranked by match percentage
5. Check which ingredients you have vs. which you need
6. Recipes with 100% match show in green (you can make them now!)

### Adding a New Recipe

1. Click the "Add Recipe" tab
2. Fill out all required fields (marked with *)
3. Enter ingredients one per line in the ingredients field
4. Enter instructions one step per line
5. Add tags separated by commas (optional)
6. Click "Add Recipe"
7. Success message appears and recipe is added to the database
8. Check browser console for generated markdown

## Search Algorithm Features

### Protein Search
- Case-insensitive matching
- Partial string matching
- Returns all recipes containing the protein type

### Ingredient Matching
- Intelligent partial matching
  - "tomato" matches "cherry tomatoes"
  - "garlic" matches "garlic cloves, minced"
- Match percentage calculation
- Sorting by best match first
- Detailed breakdown of matched vs. missing ingredients

## Responsive Design

The app is fully responsive and mobile-friendly:
- **Mobile (< 768px):** Single column layout, touch-friendly buttons
- **Tablet (768px - 1024px):** Two-column grid for recipe details
- **Desktop (> 1024px):** Full multi-column layout with optimized spacing

Perfect for use while meal prepping in the kitchen!

## Sample Recipes Included

The app comes with 5 sample recipes to test functionality:

1. **Sheet Pan Lemon Herb Chicken** - One-pan, meal-prep-friendly
2. **Teriyaki Salmon with Broccoli** - Quick, healthy, Asian-inspired
3. **Vegetarian Stuffed Bell Peppers** - Healthy vegetarian option
4. **Honey Garlic Pork Chops** - Quick weeknight meal
5. **Beef and Broccoli Stir-Fry** - Asian stir-fry classic

## Adding More Recipes

### Option 1: Use the Web Interface
1. Click "Add Recipe" tab
2. Fill out the form
3. Recipe is added to the in-memory database
4. (Note: Currently logs markdown to console - file saving would require backend)

### Option 2: Create Markdown Files Manually
1. Create a new `.md` file in the `/recipes` directory
2. Follow the markdown format above
3. Add the recipe to the sample data in `src/utils/recipeParser.js`

## Future Enhancements

Potential features for future development:

- [ ] Backend API for persistent recipe storage
- [ ] Save recipes to actual markdown files
- [ ] Upload recipe images
- [ ] Recipe rating system
- [ ] Nutritional information
- [ ] Dietary filters (keto, vegan, gluten-free)
- [ ] Print-friendly recipe view
- [ ] Share recipes via link
- [ ] Import recipes from URLs
- [ ] Shopping list generation
- [ ] Meal planning calendar
- [ ] Recipe collections/favorites

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

### Hot Module Replacement
Vite provides instant HMR during development. Changes to React components update immediately without full page reload.

### Tailwind CSS
Utility classes are purged in production builds for optimal file size.

### Code Organization
- Components are self-contained and reusable
- Utilities are separated from UI logic
- Search algorithms are modular and testable

## Troubleshooting

**Issue:** Port 3000 is already in use
**Solution:** Change port in `vite.config.js` or kill the process using port 3000

**Issue:** Styles not loading
**Solution:** Make sure Tailwind directives are in `src/index.css` and the file is imported in `main.jsx`

**Issue:** Search not working
**Solution:** Check browser console for errors. Verify recipe data structure matches expected format.

## Contributing

To add features or fix bugs:

1. Create a new branch
2. Make your changes
3. Test thoroughly (all three features)
4. Submit a pull request with description

## License

This project is open source and available for personal use.

---

**Happy meal prepping!** 🍽️
