# Application Context for Name Generation

## Current Names
- **Repository/Folder Name**: `MealPrepRecipes`
- **App Title (in UI)**: "Meal Prep Recipe Manager"
- **Package Name**: "meal-prep-web-app"
- **Tagline**: "Plan, cook, and organize your meals"

## Core Purpose & Value Proposition

This is a comprehensive meal planning and recipe management application designed to help people (especially couples/families) plan their weekly dinners, organize their recipes, generate smart shopping lists, and streamline their meal prep workflow. The app focuses primarily on **dinner planning** and **meal prep**, making it perfect for the Sunday meal prep routine.

### Primary Use Case
Users plan their weekly dinners on Saturday evening, generate shopping lists, shop on Sunday morning, and meal prep on Sunday afternoon for the week ahead.

## Key Features & Capabilities

### 1. Recipe Management
- **Recipe Database**: Store and manage recipes (Dinner, Baking, Breakfast, Dessert, Snack, Side Dish)
- **Recipe Search**: Search by name, protein type, category, or recipe type
- **Recipe Details**: Full recipe view with ingredients, instructions, prep/cook times, servings, tags
- **Add Recipes**: Manual entry via form or import from URLs using Chrome extension
- **Recipe Parsing**: AI-powered recipe parsing from web URLs (using Anthropic API)
- **Recipe History**: Track which recipes you've cooked and when
- **Recipe Ratings**: Star rating system (1-5 stars)
- **Favorites**: Mark favorite recipes

### 2. Smart Ingredient Matching
- **Ingredient-Based Search**: Enter ingredients you have, find recipes you can make
- **Intelligent Matching**: 
  - Partial matching (e.g., "tomato" matches "cherry tomatoes")
  - Ignores modifiers (fresh, frozen, chopped, diced)
  - Handles plural/singular variations
  - Match percentage calculation
- **Color-Coded Results**: 
  - Green: 100% match (can make now)
  - Yellow: 70-99% match (missing a few ingredients)
  - Orange: Below 70% match

### 3. Weekly Meal Planning
- **Week Selection**: Choose any week to plan
- **Meal Assignment**: Assign recipes to specific days and cooks
- **Calendar View**: Visual calendar showing meals for the week
- **List View**: Table view for meal assignments
- **Multiple Cooks**: Support for multiple people (e.g., couples) with custom cook names
- **Meal Plan Templates**: Save and reuse weekly meal plans

### 4. Shopping List Generation
- **Automatic Generation**: Creates shopping lists from assigned meals
- **Aisle Organization**: Ingredients organized by grocery store sections (Produce, Meat, Dairy, Grains, etc.)
- **Checklist Format**: Interactive checkboxes for shopping
- **Excludes Pantry Items**: Automatically excludes ingredients you already have
- **Multiple Export Formats**: 
  - Markdown (.md)
  - Plain text
  - HTML (for email)

### 5. Email & Calendar Integration
- **Email Shopping Lists**: Send organized shopping lists via EmailJS
- **Multiple Recipients**: Send to primary email + additional recipients
- **Google Calendar Integration**: 
  - Create calendar events for each meal
  - Include recipe details in event descriptions
  - Send invites to multiple people
  - Automatic token refresh
- **Schedule Formatting**: Beautifully formatted weekly schedule in emails

### 6. Statistics & Insights
- **Cooking Statistics**: Track total recipes cooked, monthly counts
- **Most-Made Recipe**: See your favorite/go-to recipes
- **Average Rating**: Overall recipe rating average
- **Favorite Category**: Most cooked protein/category
- **Recipes by Type**: Breakdown of cooking by recipe type (Dinner, Breakfast, etc.)

### 7. Chrome Extension
- **Recipe Capture**: Extract recipes from any website
- **One-Click Import**: Add recipes directly to your database
- **AI Parsing**: Uses Anthropic API to intelligently parse recipe content

### 8. Data Sync & Storage
- **Local Storage**: Works offline with browser localStorage
- **Supabase Integration**: Optional cloud sync for multi-device access
- **Shared Data**: Recipes, favorites, cart, and history sync between devices
- **Settings Export/Import**: Backup and restore all settings

### 9. Settings & Customization
- **Dark Mode**: Full dark mode support
- **Cook Names**: Customize names for multiple cooks
- **Email Configuration**: Primary + additional email recipients
- **API Keys**: Anthropic, EmailJS, Google OAuth, Supabase configuration
- **Settings Backup**: Export/import settings as JSON

## Target Users

### Primary Users
- **Couples/Families**: People who share cooking responsibilities
- **Meal Preppers**: People who batch cook on weekends
- **Busy Professionals**: Those who want to plan ahead and save time
- **Home Cooks**: People who enjoy cooking but want better organization

### User Personas
- **The Planner**: Plans meals Saturday evening for the week ahead
- **The Shopper**: Uses organized shopping lists for efficient grocery trips
- **The Meal Prepper**: Batch cooks on Sundays for the week
- **The Recipe Collector**: Saves recipes from websites and builds a personal collection

## Unique Selling Points

1. **Dinner-Focused**: Specifically designed for dinner planning (not breakfast/lunch)
2. **Multi-Person Support**: Built for couples/families with cook assignment features
3. **Smart Ingredient Matching**: Find recipes based on what you have, not just what you want
4. **Complete Workflow**: From planning → shopping → cooking → tracking
5. **Meal Prep Optimized**: Prioritizes recipes perfect for batch cooking
6. **Calendar Integration**: Not just planning, but actual calendar events
7. **Email Integration**: Send shopping lists and schedules to partners
8. **Recipe Import**: Chrome extension for easy recipe capture
9. **Offline-First**: Works with localStorage, optional cloud sync
10. **Beautiful UI**: Modern React app with Tailwind CSS, dark mode, responsive design

## Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui components
- **Storage**: localStorage (primary), Supabase (optional cloud sync)
- **APIs**: 
  - Anthropic (recipe parsing)
  - EmailJS (email sending)
  - Google Calendar API (calendar events)
  - Supabase (cloud storage)
- **Chrome Extension**: For recipe capture
- **Deployment**: Vercel (likely)

## Brand Personality & Tone

### Current Tone
- **Practical**: Focused on solving real problems
- **Organized**: Emphasizes planning and structure
- **Helpful**: Assists users in their meal prep journey
- **Modern**: Clean, contemporary design
- **Efficient**: Streamlines the meal planning process

### Desired Brand Attributes
- **Catchy**: Memorable and easy to say
- **Modern**: Contemporary, not old-fashioned
- **Friendly**: Approachable, not intimidating
- **Smart**: Intelligent features (ingredient matching, AI parsing)
- **Organized**: Conveys structure and planning
- **Efficient**: Suggests time-saving and convenience

## Current Naming Issues

1. **Too Generic**: "Meal Prep Recipe Manager" is descriptive but not memorable
2. **Too Long**: Hard to say quickly or remember
3. **Not Catchy**: Doesn't have personality or stickiness
4. **Technical**: Sounds like a tool rather than a lifestyle product

## What Makes This App Special

1. **The Sunday Routine**: Built around the Saturday planning → Sunday shopping → Sunday prep workflow
2. **Couple-Friendly**: Designed for shared cooking responsibilities
3. **Ingredient-First Thinking**: Start with what you have, not what you want
4. **Complete Solution**: Not just recipes, but planning, shopping, and tracking
5. **Smart & Automated**: AI parsing, intelligent matching, automatic organization

## Naming Considerations

### Should Convey:
- Meal planning/meal prep
- Organization/efficiency
- Weekly routine/workflow
- Recipe management
- Smart/intelligent features
- Modern, friendly approach

### Should Avoid:
- Generic terms like "Manager", "App", "Tool"
- Overly technical language
- Too long or complex
- Hard to pronounce or spell
- Already taken/common names

### Potential Directions:
- **Action-Oriented**: Names that suggest doing/making (e.g., "Prep", "Plan", "Cook")
- **Time-Based**: References to weekly routine (e.g., "Sunday", "Week", "Weekly")
- **Smart/Intelligent**: Suggests AI/intelligence (e.g., "Smart", "Auto", "AI")
- **Friendly/Casual**: Approachable, friendly tone
- **Compound Words**: Two words that work together
- **Made-Up Words**: Unique, brandable names

## Example Workflow (User Story)

**Saturday Evening:**
- User opens app
- Searches recipes or browses collection
- Adds 7 recipes to cart
- Assigns each to a day and cook
- Generates shopping list
- Sends email with shopping list and calendar invites

**Sunday Morning:**
- User checks email for shopping list
- Goes grocery shopping with organized, aisle-sorted list

**Sunday Afternoon:**
- User meal preps for the week
- Marks recipes as cooked in the app
- Rates recipes

**Throughout the Week:**
- User follows meal plan
- Uses calendar events as reminders
- Tracks cooking history and stats

---

## Summary for Name Generation

This is a **meal planning and recipe management app** that helps people (especially couples) **plan weekly dinners**, **generate smart shopping lists**, and **organize their meal prep workflow**. It's **dinner-focused**, **meal-prep-optimized**, and includes **smart ingredient matching**, **calendar integration**, and **recipe import from websites**. The app is **modern**, **practical**, and designed for the **Saturday planning → Sunday shopping → Sunday prep** routine.

The name should be **catchy**, **memorable**, **modern**, and convey the app's purpose while being **friendly and approachable** rather than technical or generic.

