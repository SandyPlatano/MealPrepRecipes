# Copy Areas for Meal Prep Recipe Manager

This document outlines all areas in your application where you can create or customize copy (text content). Use this as a reference when rebranding or updating your application's messaging.

## 1. Application Header & Branding

**Location:** `src/App.jsx` (lines 90-91)

- **Main Title:** "Meal Prep Recipe Manager"
- **Tagline/Subtitle:** "Plan, cook, and organize your meals"
- **Footer Brand Name:** "Meal Prep Recipe Manager"
- **Footer Version:** "v1.0.0"
- **Footer Tech Stack:** "Built with React & Tailwind"

**HTML Title:** `index.html` (line 10)
- **Page Title:** "Meal Prep Recipe Manager"

---

## 2. Navigation Tabs

**Location:** `src/App.jsx` (lines 118-137)

- **Search Tab:** "Search" (with SearchIcon)
- **Add Recipe Tab:** "Add Recipe" (with Plus icon)
- **My Recipes Tab:** "My Recipes" (with BookOpen icon)
- **Stats Tab:** "Stats" (with BarChart3 icon)
- **Settings Tab:** "Settings" (with SettingsIcon)

---

## 3. Search Page (`Search.jsx`)

**Card Header:**
- **Title:** "Search Recipes"
- **Description:** "Find recipes by type, proteins, or search term"

**Input Placeholders:**
- **Search Input:** "Search recipes..."
- **Type Select:** "Type" / "All Types"
- **Category Select:** "Proteins" / "All Proteins"

**Empty States:**
- **With Filters Active:** "No recipes found matching your search."
- **No Recipes:** "No recipes yet. Add your first recipe to get started!"

**Recipe Type Options:**
- "Dinner", "Baking", "Breakfast", "Dessert", "Snack", "Side Dish"

---

## 4. Add Recipe Page (`AddRecipe.jsx`)

**Card Header:**
- **Title:** "Add New Recipe"
- **Description:** "Paste recipe text or import from a URL"

**Tabs:**
- **Tab 1:** "Free-form Text"
- **Tab 2:** "Import from URL"

**Form Fields:**
- **Recipe Text Label:** "Recipe Text"
- **Recipe Text Placeholder:** "Paste your recipe here. For example:\nGrilled Lemon Chicken\nIngredients: 2 lbs chicken breast, 2 tbsp honey, 1 lemon...\nInstructions: Marinate chicken, grill for 10 minutes..."
- **URL Label:** "Recipe URL"
- **URL Placeholder:** "https://example.com/recipe"
- **URL Help Text:** "Works with most recipe websites. If the site blocks access, copy the recipe text and use the free-form input instead."

**Buttons:**
- **Parse Button:** "Parse with AI" / "Parsing..." (when loading)
- **Fetch Button:** "Fetch & Parse Recipe" / "Fetching..." (when loading)

**Review Section:**
- **Title:** "Review & Edit Recipe"
- **Description:** "Make any corrections before saving"

**Form Labels:**
- "Recipe Title"
- "Recipe Type" (placeholder: "Dinner, Baking, Breakfast, etc.")
- "Category" (placeholder: "Chicken, Cookies, etc.")
- "Servings"
- "Prep Time"
- "Cook Time"
- "Ingredients (one per line)"
- "Instructions (one per line)"
- "Tags (comma-separated)"

**Action Buttons:**
- "Save Recipe"
- "Cancel"

**Toast Messages:**
- "Please enter recipe text"
- "Please set your Anthropic API key in Settings"
- "Recipe parsed successfully! Review and edit if needed."
- "Failed to parse recipe: [error]"
- "Please enter a URL"
- "Recipe fetched and parsed! Review and edit if needed."
- "Failed to fetch recipe: [error]"
- "Please parse a recipe first"
- "Recipe \"[title]\" added!"

---

## 5. My Recipes Page (`MyRecipes.jsx`)

**Card Header:**
- **Title:** "My Recipes"
- **Description:** "Your favorites and cooking history"

**Tabs:**
- "Favorites"
- "Recently Made"
- "All History"

**Empty States:**
- **Favorites:** "No favorite recipes yet. Click the heart icon on any recipe to add it here."
- **Recently Made:** "No cooking history yet. Mark recipes as cooked to see them here."
- **All History:** "No cooking history yet. Mark recipes as cooked to see them here."

**Card Content:**
- **Date Format:** "Made on [MMM d, yyyy]"
- **Rating Display:** "[rating]/5 ⭐"
- **Make Again Button:** "Make Again"

**Toast Messages:**
- "Added to meal plan!"
- "Already in meal plan"

---

## 6. Stats Page (`Stats.jsx`)

**Card Header:**
- **Title:** "Cooking Statistics"
- **Description:** "Your meal prep insights and achievements"

**Stat Cards:**
- **Total Recipes Cooked:** "Total Recipes Cooked" / "[count] this month"
- **Most-Made Recipe:** "Most-Made Recipe" / "Made [count] time(s)" / "No recipes cooked yet"
- **Average Rating:** "Average Rating" / "[rating]/5 ⭐" / "No ratings yet"
- **Favorite Category:** "Favorite Category" / "[category]" / "None yet"
- **Recipes by Type:** "Recipes by Type" / "No cooking history yet"

---

## 7. Settings Page (`Settings.jsx`)

**Card Header:**
- **Title:** "Settings"
- **Description:** "Configure your meal prep app"

**Sections:**

### Appearance
- **Label:** "Appearance"
- **Dark Mode Label:** "Dark Mode"

### Cook Names
- **Label:** "Cook Names"
- **Input Placeholder:** "Cook [number] name"
- **Add Button:** "+ Add Cook"

### Email Address
- **Label:** "Email Address"
- **Primary Email Label:** "Primary Email"
- **Primary Email Placeholder:** "your@email.com"
- **Primary Email Help:** "Your email address where you will receive shopping lists and calendar invites."
- **Additional Recipients Label:** "Additional Recipients"
- **Additional Recipients Placeholder:** "additional@email.com"
- **Add Recipient Button:** "+ Add Recipient"
- **Additional Recipients Help:** "Additional email addresses that will also receive shopping lists and calendar invites."

### Anthropic API Key
- **Label:** "Anthropic API Key"
- **Placeholder:** "sk-ant-api03-..."
- **Help Text:** "Required for recipe parsing. Get your key at console.anthropic.com"

### EmailJS Credentials
- **Label:** "EmailJS Credentials"
- **Service ID Label:** "Service ID" (placeholder: "service_xxxxx")
- **Template ID Label:** "Template ID" (placeholder: "template_xxxxx")
- **Public Key Label:** "Public Key" (placeholder: "xxxxxxxxxxxxx")
- **Help Text:** "Get these from emailjs.com"

### Google Calendar
- **Label:** "Google Calendar"
- **Client ID Label:** "Client ID" (placeholder: "xxxxx.apps.googleusercontent.com")
- **Client Secret Label:** "Client Secret" (placeholder: "GOCSPX-xxxxx")
- **Connected Account Label:** "Connected Account"
- **Help Text:** "Set up OAuth credentials in Google Cloud Console"

### Supabase Configuration
- **Label:** "Supabase (Shared Data)"
- **Description:** "Configure Supabase to sync recipes, favorites, and cart between devices. Both you and your partner should use the same credentials."
- **Project URL Label:** "Project URL" (placeholder: "https://xxxxx.supabase.co")
- **Anon Key Label:** "Anon Key" (placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
- **Help Text:** "Get these from your Supabase Dashboard (Project Settings → API)"
- **Migrate Button:** "Migrate Local Data to Supabase"
- **Migrate Help:** "One-time migration: copies all recipes, favorites, cart, and history from this device to Supabase."

### Backup & Restore
- **Label:** "Backup & Restore"
- **Description:** "Export your settings to a file for backup, or import previously saved settings."
- **Export Button:** "Export Settings"
- **Import Button:** "Import Settings"
- **Help Text:** "Export creates a JSON file with all your credentials and settings. Keep this file secure!"

**Action Button:**
- "Save Settings"

**Toast Messages:**
- "Settings saved successfully!"
- "Settings saved, but verification failed. Please check your browser storage."
- "Failed to save settings. Check browser console for details."
- "Settings exported successfully!"
- "Failed to export settings"
- "Settings imported successfully!"
- "Failed to import settings. Invalid file format."
- "Please configure Supabase URL and Anon Key first"
- "Migrating data to Supabase..."
- "Data migrated to Supabase successfully!"
- "Migration failed. Check console for details."

---

## 8. Cart/Meal Plan (`Cart.jsx`)

**Sheet Header:**
- **Title:** "Shopping Cart & Meal Plan"
- **Description:** "Assign recipes to cooks and days, then generate your shopping list"

**Templates Section:**
- **Title:** "Saved Templates"
- **Description:** "Load a previously saved meal plan"
- **Load Button:** "[Template Name]"
- **Delete Icon:** (Trash icon)

**Week Selector:**
- **Title:** "Select Week"

**Meal Assignment:**
- **Title:** "Meal Assignment"
- **Description:** "Assign each recipe to a cook and day"
- **View Buttons:** "List" / "Calendar"

**Shopping List:**
- **Title:** "Shopping List"
- **Description:** "[count] items organized by store aisle"

**Save Template Dialog:**
- **Title:** "Save Meal Plan Template"
- **Description:** "Save this week's meal plan to reuse later"
- **Input Label:** "Template Name"
- **Input Placeholder:** "e.g., Healthy Week, Quick Meals"
- **Buttons:** "Save" / "Cancel"

**Action Buttons:**
- "Save as Template"
- "Send Email & Calendar Invites" / "Sending..." (when loading)
- "Clear Cart"

**Toast Messages:**
- "Please assign cooks and days to all recipes"
- "Please set your email address in Settings"
- "Please configure EmailJS credentials in Settings"
- "Email sent successfully to [count] recipient(s)!"
- "Email sent to [count] recipient(s), but [count] failed. Check console for details."
- "Email failed to send to all recipients. Check console for details."
- "Email failed: [error]. Check console for details."
- "Created [count] calendar event(s)!"
- "[count] event(s) failed. Check console for details."
- "Failed to create calendar events: [errors]"
- "Google Calendar authentication expired. Please reconnect in Settings."
- "Google Calendar permission denied. Please check your OAuth scopes."
- "Calendar events failed: [error]. Check console for details."
- "Email sent! Connect Google Calendar in Settings to also create calendar invites."
- "Meal plan sent successfully!"
- "Failed to send meal plan: [error]. Check console for details."
- "Please enter a template name"
- "Please assign recipes to days before saving"
- "Template \"[name]\" saved!"
- "Template \"[name]\" loaded!"
- "Template deleted"
- "Cart cleared"

---

## 9. Recipe Card (`RecipeCard.jsx`)

**Card Content:**
- **Key Ingredients Label:** "Key Ingredients:"
- **Add to Meal Plan Button:** "Add to Meal Plan"
- **Remove from Meal Plan Button:** "Remove from Meal Plan"

**Delete Dialog:**
- **Title:** "Delete Recipe"
- **Description:** "Are you sure you want to delete \"[recipe title]\"? This action cannot be undone and will remove the recipe from your collection, favorites, and any meal plans."
- **Buttons:** "Cancel" / "Delete"

**Toast Messages:**
- "Added to meal plan"
- "Already in meal plan"
- "Removed from meal plan"
- "Removed from favorites" / "Added to favorites"
- "Recipe exported as Markdown"
- "Opening PDF preview"
- "Recipe deleted"

**Badge Text:**
- "Made [time ago]" (e.g., "Made 2 days ago")

---

## 10. Recipe Detail Dialog (`RecipeDetailDialog.jsx`)

**Dialog Content:**
- **Serving Scale Label:** "Scale Servings:"
- **Scale Buttons:** "0.5x", "1x", "1.5x", "2x", "3x"
- **Servings Display:** "([count] servings)"

**Section Headers:**
- "Ingredients"
- "Instructions"
- "Rating"
- "Notes"

**Form Fields:**
- **Notes Label:** "Notes"
- **Notes Placeholder:** "Add notes about this recipe (e.g., 'Morgan loved this!', 'Double the garlic next time')"

**Action Buttons:**
- "Mark as Cooked"
- **Help Text:** "Mark this recipe as cooked to rate it and add notes"
- "Add to Meal Plan"
- "Remove from Meal Plan"

**Toast Messages:**
- "Recipe marked as cooked! Now you can rate it."
- "Rated [rating] stars!"
- "Added to meal plan"
- "Already in meal plan"
- "Removed from meal plan"

**Badge Text:**
- "Made [time ago]" (e.g., "Made 2 days ago")

---

## 11. Loading States

**Location:** Various components

- **Tab Loader:** (Spinner with no text)
- **Parse Loading:** "Parsing..."
- **Fetch Loading:** "Fetching..."
- **Send Loading:** "Sending..."
- **Migration Loading:** "Migrating data to Supabase..."

---

## 12. Empty States & Placeholders

**Search:**
- "No recipes found matching your search."
- "No recipes yet. Add your first recipe to get started!"

**My Recipes:**
- "No favorite recipes yet. Click the heart icon on any recipe to add it here."
- "No cooking history yet. Mark recipes as cooked to see them here."

**Stats:**
- "No recipes cooked yet"
- "No ratings yet"
- "None yet"
- "No cooking history yet"

---

## 13. Error Messages

**General:**
- "Failed to parse recipe: [error]"
- "Failed to fetch recipe: [error]"
- "Failed to save settings: [error]"
- "Failed to export settings"
- "Failed to import settings. Invalid file format."
- "Migration failed. Check console for details."
- "Email failed: [error]. Check console for details."
- "Failed to send meal plan: [error]. Check console for details."

**Validation:**
- "Please enter recipe text"
- "Please set your Anthropic API key in Settings"
- "Please enter a URL"
- "Please parse a recipe first"
- "Please assign cooks and days to all recipes"
- "Please set your email address in Settings"
- "Please configure EmailJS credentials in Settings"
- "Please enter a template name"
- "Please assign recipes to days before saving"
- "Please configure Supabase URL and Anon Key first"

---

## 14. Success Messages

- "Recipe parsed successfully! Review and edit if needed."
- "Recipe fetched and parsed! Review and edit if needed."
- "Recipe \"[title]\" added!"
- "Settings saved successfully!"
- "Settings exported successfully!"
- "Settings imported successfully!"
- "Data migrated to Supabase successfully!"
- "Email sent successfully to [count] recipient(s)!"
- "Created [count] calendar event(s)!"
- "Meal plan sent successfully!"
- "Template \"[name]\" saved!"
- "Template \"[name]\" loaded!"
- "Template deleted"
- "Cart cleared"
- "Added to meal plan"
- "Removed from meal plan"
- "Removed from favorites" / "Added to favorites"
- "Recipe exported as Markdown"
- "Opening PDF preview"
- "Recipe deleted"
- "Recipe marked as cooked! Now you can rate it."
- "Rated [rating] stars!"

---

## 15. Informational Messages

- "Already in meal plan"
- "Email sent! Connect Google Calendar in Settings to also create calendar invites."
- "Email sent to [count] recipient(s), but [count] failed. Check console for details."
- "[count] event(s) failed. Check console for details."
- "Settings saved, but verification failed. Please check your browser storage."

---

## 16. Shopping List Page (`public/shopping-list.html`)

**Meta Tags:**
- **Description:** "Interactive Shopping List - Meal Prep Recipe Manager"
- **Page Title:** "Shopping List - Meal Prep Recipe Manager"

**Header:**
- **Title:** "🛒 Shopping List"
- **Subtitle:** "Loading..." (dynamic, shows week range when loaded)

**Progress Indicator:**
- **Progress Text:** "[count] of [total] items" (e.g., "0 of 0 items", "5 of 10 items")

**Loading States:**
- **Loading:** "Loading shopping list..."
- **No Items:** "No items in shopping list"

**Buttons:**
- **Add Item Button:** "+ Add Item"
- **Share Button:** "Share ↗"

**Add Item Dialog:**
- **Title:** "Add Item"
- **Input Placeholder:** "e.g., Milk (1 gallon)"
- **Category Select:** "Select category..."
- **Cancel Button:** "Cancel"
- **Add Button:** "Add"

**Offline Indicator:**
- **Message:** "◉ Offline - Changes saved locally"

**Share Dialog:**
- **Share Title:** "Shopping List - [weekRange]"
- **Share Text:** "Check out our shopping list!"

**Error Messages:**
- **No ID:** "No shopping list ID provided" / "Please use a valid shopping list link from your email."
- **Not Found:** "Shopping list not found" / "This shopping list may have expired or been deleted."
- **Load Error:** "Error loading shopping list" / "[error message]"

**Success Messages:**
- **Link Copied:** "Link copied!"

**Footer:**
- **Brand Name:** "Meal Prep Recipe Manager"
- **Version:** "v1.0.0"

**Category Headers:**
- Dynamic category names (e.g., "Produce", "Meat", "Dairy", "Grains", etc.)

---

## 17. Chrome Extension (`chrome-extension/`)

**Popup HTML (`popup.html`):**
- **Page Title:** "Meal Prep Recipe Manager"
- **Header Title:** "Meal Prep"
- **Loading Message:** "Parsing recipe..."
- **Initial State Text:** "Click the button below to capture the recipe from this page."
- **Capture Button:** "Capture Recipe"
- **Error Retry Button:** "Try Again"

**Form Labels:**
- "Recipe Title"
- "Type" (placeholder: "Dinner")
- "Category" (placeholder: "Chicken")
- "Prep Time" (placeholder: "15 minutes")
- "Cook Time" (placeholder: "30 minutes")
- "Servings" (placeholder: "4")
- "Ingredients (one per line)" (placeholder: "2 lbs chicken breast\n1 cup flour")
- "Instructions (one per line)" (placeholder: "Preheat oven to 425°F\nMix ingredients")
- "Tags (comma-separated)" (placeholder: "healthy, quick, meal-prep")

**Form Buttons:**
- "Add to Recipes"
- "Cancel"

**Success State:**
- **Success Icon:** "✓"
- **Success Message:** (dynamic, e.g., "Recipe \"[title]\" added successfully!")
- **Open App Button:** "Open App"
- **New Recipe Button:** "Capture Another"

**Footer:**
- "Settings" (link)

**Error Messages (`popup.js`):**
- "Failed to capture recipe. Please try again."
- "Failed to save recipe. Please try again."
- "Please enter a recipe title"

**Options Page (`options.js`):**
- **Status Messages:**
  - "Failed to save settings: [error]"
  - "Testing connection..."
  - "Connection failed: [error]. Make sure your app is deployed and the URL is correct."
- **Test Button:** "Test Connection" / "Testing..."

---

## Summary

Your application has **approximately 280+ copy areas** including:

- **Branding & Navigation:** ~10 items
- **Page Headers & Descriptions:** ~15 items
- **Form Labels & Placeholders:** ~35 items
- **Button Labels:** ~35 items
- **Toast/Success Messages:** ~45 items
- **Error Messages:** ~25 items
- **Empty States:** ~10 items
- **Help Text:** ~10 items
- **Dialog Content:** ~8 items
- **Stat Labels:** ~10 items
- **Shopping List Page:** ~15 items
- **Chrome Extension:** ~20 items
- **Other UI Text:** ~30+ items

All of these can be customized to match your new brand name and messaging style. The copy is primarily focused on meal prep, recipe management, shopping lists, and meal planning functionality.

