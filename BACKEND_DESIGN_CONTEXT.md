# Backend Design Context - "Babe, What's for Dinner?"

## Application Overview

**"Babe, What's for Dinner?"** is a comprehensive meal planning and recipe management web application designed for couples/families to plan weekly dinners, organize recipes, generate smart shopping lists, and streamline meal prep workflows. The app focuses primarily on **dinner planning** and **meal prep**, optimized for the Saturday planning → Sunday shopping → Sunday prep routine.

### Current State
- **Frontend**: Fully functional React SPA with Vite
- **Storage**: Currently using localStorage (primary) with optional Supabase sync
- **Backend**: Minimal - only API routes for recipe parsing (Vercel serverless functions)
- **Deployment**: Vercel (frontend + API routes)
- **Status**: Operational as a frontend-only app with cloud sync option

---

## Core Features & Functionality

### 1. Recipe Management
- **Recipe Database**: Store and manage recipes with multiple types:
  - Dinner (primary focus)
  - Baking
  - Breakfast
  - Dessert
  - Snack
  - Side Dish
- **Recipe Properties**:
  - Title, recipeType, category, proteinType
  - Prep time, cook time, servings
  - Ingredients (array with quantities)
  - Instructions (step-by-step array)
  - Tags (array: protein type, cuisine, meal-prep-friendly, etc.)
  - Notes, sourceUrl
  - Rating (1-5 stars), createdAt
- **Recipe Search**: 
  - Search by name, protein type, category, recipe type
  - Ingredient-based matching with intelligent partial matching
  - Match percentage calculation (100% = can make now, 70-99% = missing few items)
- **Recipe Actions**:
  - Add recipes manually via form
  - Import from URLs using Chrome extension + AI parsing
  - Edit, delete recipes
  - Mark as favorites
  - Rate recipes (1-5 stars)
  - Track cooking history (when cooked, rating, notes)

### 2. Weekly Meal Planning
- **Week Selection**: Choose any week to plan (defaults to next Monday)
- **Cart System**: Add recipes to cart, then assign to days
- **Meal Assignment**: 
  - Assign recipes to specific days (Monday-Sunday)
  - Assign to specific cooks (customizable names, default: "You", "Morgan")
  - Multiple cooks per week
- **Views**:
  - List view: Table showing day, cook, recipe
  - Calendar view: Visual calendar with meals
- **Templates**: Save and reuse weekly meal plans
- **Schedule Export**: Generate formatted weekly schedule

### 3. Shopping List Generation
- **Automatic Generation**: Creates shopping lists from assigned meals
- **Aisle Organization**: Ingredients organized by grocery store sections:
  - Produce
  - Meat & Seafood
  - Dairy & Refrigerated
  - Pantry & Dry Goods
  - Bakery
  - Frozen
  - Other
- **Features**:
  - Interactive checkboxes for shopping
  - Excludes pantry items (if pantry tracking implemented)
  - Shows total amounts needed
  - Indicates which recipes need each ingredient
  - Supports user-added items
- **Export Formats**:
  - Markdown (.md)
  - Plain text
  - HTML (for email)
  - Interactive shopping list page (with state persistence)

### 4. Email & Calendar Integration
- **Email Service (EmailJS)**:
  - Send shopping lists via email
  - Multiple recipients (primary + additional emails)
  - Beautifully formatted weekly schedule
  - HTML email templates
- **Google Calendar Integration**:
  - OAuth 2.0 authentication
  - Create calendar events for each meal
  - Include recipe details in event descriptions
  - Send invites to multiple people
  - Automatic token refresh
  - Callback handling for OAuth flow

### 5. Statistics & Insights
- **Cooking Statistics**:
  - Total recipes cooked
  - Monthly counts
  - Most-made recipe
  - Average rating
  - Favorite category/protein
  - Recipes by type breakdown
- **History Tracking**:
  - When recipes were cooked
  - Ratings given
  - Notes per cooking instance

### 6. Chrome Extension
- **Recipe Capture**: Extract recipes from any website
- **One-Click Import**: Add recipes directly to database
- **AI Parsing**: Uses Anthropic API to intelligently parse recipe content
- **Permissions**: activeTab, storage, host_permissions for all URLs

### 7. Settings & Customization
- **Dark Mode**: Full dark mode support
- **Cook Names**: Customize names for multiple cooks (default: "You", "Morgan")
- **Email Configuration**: 
  - Primary email address
  - Additional email recipients (array)
- **API Keys Configuration**:
  - Anthropic API key (for recipe parsing)
  - EmailJS credentials (serviceId, templateId, publicKey)
  - Google OAuth (clientId, clientSecret, accessToken, refreshToken)
  - Supabase credentials (url, anonKey)
- **Settings Backup**: Export/import settings as JSON

---

## Current Architecture

### Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Radix UI primitives
  - shadcn/ui components
  - Lucide React icons
- **State Management**: React Context API
  - RecipeContext (recipes, favorites, history)
  - CartContext (cart items, meal assignments)
  - SettingsContext (user settings, API keys)
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)

### Storage Strategy (Current)
- **Primary**: Browser localStorage
- **Optional Cloud Sync**: Supabase (PostgreSQL + JSONB)
- **Storage Abstraction**: Dual-layer system that falls back to localStorage if Supabase not configured
- **Data Sync**: Polling every 5 seconds when Supabase enabled (checks updated_at timestamps)
- **Migration**: One-time migration from localStorage to Supabase

### Current Backend/API
- **Deployment**: Vercel serverless functions
- **API Routes**:
  - `/api/parse-recipe.js`: Recipe parsing using Anthropic API
  - `/api/add-recipe.js`: (Likely exists, need to verify)
- **Third-Party APIs**:
  - Anthropic API (Claude) - Recipe parsing
  - EmailJS - Email sending
  - Google Calendar API - Calendar events
  - Supabase - Database and storage

### Database Schema (Supabase)
Current schema uses a simplified approach with JSONB storage:

```sql
-- All tables follow this pattern:
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables:
- recipes: Array of recipe objects
- favorites: Array of recipe IDs
- cart: Array of cart items {recipeId, recipe, cook, day}
- cooking_history: Array of history entries {recipeId, date, rating, notes}
- templates: Array of saved meal plan templates
- shopping_list_state: Individual shopping list item states (for interactive lists)
- shopping_list_data: Complete shopping list data (for interactive lists)
```

**Note**: Current schema uses single-row-per-table with JSONB arrays. This works for shared household but isn't scalable for multi-user.

---

## Data Models

### Recipe Object
```typescript
{
  id: string,                    // Unique identifier
  title: string,                 // Recipe name
  recipeType: 'Dinner' | 'Baking' | 'Breakfast' | 'Dessert' | 'Snack' | 'Side Dish',
  category: string,              // e.g., "Chicken", "Cookies", "Eggs"
  proteinType: string,           // "Chicken" | "Beef" | "Pork" | "Fish" | "Seafood" | "Vegetarian" | "Vegan" | "Mixed Protein"
  prepTime: string,              // e.g., "15 minutes"
  cookTime: string,              // e.g., "30 minutes"
  servings: string,               // e.g., "4" or "Makes 24 cookies"
  ingredients: string[],          // Array of ingredient strings with quantities
  instructions: string[],         // Array of step-by-step instructions
  tags: string[],                 // Array of tags (protein type, cuisine, meal-prep-friendly, etc.)
  notes: string,                 // Optional notes or modifications
  sourceUrl?: string,            // Original URL if imported
  rating?: number,               // 1-5 star rating (optional)
  createdAt: string,            // ISO timestamp
}
```

### Cart Item
```typescript
{
  recipeId: string,
  recipe: Recipe,               // Full recipe object
  cook: string | null,          // Cook name (e.g., "You", "Morgan")
  day: string | null,           // Day of week (Monday-Sunday)
}
```

### Cooking History Entry
```typescript
{
  recipeId: string,
  date: string,                 // ISO date string
  rating: number | null,        // 1-5 stars
  notes: string,                // Optional notes
}
```

### Meal Plan Template
```typescript
{
  id: string,
  name: string,
  cartItems: CartItem[],        // Saved cart items with assignments
  createdAt: string,
}
```

### Shopping List
```typescript
{
  listId: string,               // Unique identifier for the list
  weekRange: string,            // e.g., "Dec 2 - Dec 8, 2024"
  schedule: CartItem[],         // Assigned meals for the week
  itemsByCategory: {            // Ingredients grouped by aisle
    "Produce": string[],
    "Meat & Seafood": string[],
    "Dairy & Refrigerated": string[],
    // ... etc
  },
  checkedItems: Set<string>,    // Set of checked item IDs (for interactive lists)
}
```

### Settings Object
```typescript
{
  darkMode: boolean,
  cookNames: string[],          // e.g., ["You", "Morgan"]
  emailAddress: string,
  additionalEmails: string[],
  anthropicApiKey: string,
  emailjsServiceId: string,
  emailjsTemplateId: string,
  emailjsPublicKey: string,
  googleClientId: string,
  googleClientSecret: string,
  googleAccessToken: string,
  googleRefreshToken: string,
  googleConnectedAccount: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
}
```

---

## User Workflows

### Primary Workflow: Weekly Meal Planning
1. **Saturday Evening**:
   - User opens app
   - Searches/browses recipes
   - Adds 7 recipes to cart
   - Assigns each to a day and cook
   - Generates shopping list
   - Sends email with shopping list
   - Creates Google Calendar events

2. **Sunday Morning**:
   - User checks email for shopping list
   - Goes grocery shopping with organized, aisle-sorted list

3. **Sunday Afternoon**:
   - User meal preps for the week
   - Marks recipes as cooked in the app
   - Rates recipes

4. **Throughout the Week**:
   - User follows meal plan
   - Uses calendar events as reminders
   - Tracks cooking history and stats

### Recipe Import Workflow
1. User finds recipe on website
2. Clicks Chrome extension
3. Extension captures page content
4. Sends to `/api/parse-recipe` with Anthropic API
5. AI parses and structures recipe
6. Recipe added to database
7. User can edit/refine if needed

---

## Technical Integration Points

### Anthropic API (Recipe Parsing)
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-sonnet-4-5-20250929`
- **Use Case**: Parse unstructured recipe text/HTML into structured format
- **Current Implementation**: Vercel serverless function at `/api/parse-recipe.js`
- **Input**: Recipe text or HTML content + source URL
- **Output**: Structured recipe JSON

### EmailJS (Email Sending)
- **Use Case**: Send shopping lists and schedules via email
- **Configuration**: Service ID, Template ID, Public Key
- **Current Implementation**: Client-side integration
- **Templates**: HTML templates for shopping lists

### Google Calendar API
- **Use Case**: Create calendar events for meals
- **Authentication**: OAuth 2.0
- **Scopes**: `https://www.googleapis.com/auth/calendar.events`
- **Current Implementation**: Client-side with OAuth popup
- **Token Management**: Access token + refresh token stored in settings
- **Callback**: `/auth/google/callback.html`

### Supabase (Current Cloud Storage)
- **Use Case**: Optional cloud sync for multi-device access
- **Tables**: recipes, favorites, cart, cooking_history, templates, shopping_list_state, shopping_list_data
- **Storage**: JSONB arrays in single-row tables
- **RLS**: Currently public read/write (for shared household)
- **Sync**: Polling every 5 seconds, checks `updated_at` timestamps

---

## Chrome Extension Details

### Manifest
- **Version**: 3
- **Name**: "Babe, What's for Dinner?"
- **Permissions**: activeTab, storage, host_permissions for all URLs
- **Files**:
  - `background.js`: Service worker
  - `content.js`: Content script for page extraction
  - `popup.html/js`: Extension popup UI
  - `options.html/js`: Extension settings

### Functionality
- Captures page content (HTML/text)
- Sends to backend API for parsing
- Returns structured recipe
- User can review/edit before adding

---

## Deployment Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/auth/google/callback",
      "destination": "/auth/google/callback.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Configuration
- **Entry**: `src/main.jsx`
- **Output**: `dist/` directory
- **Code Splitting**: Manual chunks for vendors (React, Radix, Supabase, etc.)
- **Port**: 3000 (development)

---

## Current Limitations & Backend Needs

### Current Limitations
1. **No User Authentication**: App assumes shared household with public Supabase access
2. **Scalability**: JSONB array storage doesn't scale for multiple users
3. **API Keys in Frontend**: Sensitive keys stored in localStorage (not secure)
4. **No Server-Side Validation**: All validation happens client-side
5. **Limited Backend Logic**: Most logic in frontend, minimal server functions
6. **No Image Storage**: Recipes don't have images
7. **No Recipe Sharing**: Can't share recipes between users
8. **No Collaboration Features**: Limited multi-user support
9. **No Analytics**: No usage tracking or analytics
10. **No Backup/Restore**: Only manual settings export

### Backend Requirements for Full-Stack App

#### 1. User Authentication & Authorization
- User registration/login
- JWT or session-based auth
- Multi-user support (not just shared household)
- User profiles
- Household/family grouping (optional)

#### 2. Database Architecture
- **Proper relational schema** (not JSONB arrays):
  - `users` table
  - `recipes` table (one row per recipe)
  - `ingredients` table (normalized)
  - `recipe_ingredients` junction table
  - `favorites` table (user_id, recipe_id)
  - `cooking_history` table (user_id, recipe_id, date, rating, notes)
  - `meal_plans` table (user_id, week_start_date)
  - `meal_assignments` table (meal_plan_id, recipe_id, day, cook)
  - `shopping_lists` table
  - `shopping_list_items` table
  - `templates` table
  - `pantry_items` table (if pantry tracking added)

#### 3. API Endpoints Needed
- **Authentication**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/refresh`

- **Recipes**:
  - `GET /api/recipes` (list with filters, pagination)
  - `GET /api/recipes/:id`
  - `POST /api/recipes` (create)
  - `PUT /api/recipes/:id` (update)
  - `DELETE /api/recipes/:id`
  - `POST /api/recipes/:id/favorite` (toggle favorite)
  - `GET /api/recipes/search` (search with filters)
  - `POST /api/recipes/parse` (AI parsing - already exists)

- **Meal Planning**:
  - `GET /api/meal-plans` (user's meal plans)
  - `GET /api/meal-plans/:id`
  - `POST /api/meal-plans` (create)
  - `PUT /api/meal-plans/:id` (update)
  - `DELETE /api/meal-plans/:id`
  - `POST /api/meal-plans/:id/assign` (assign recipe to day)
  - `GET /api/meal-plans/week/:date` (get meal plan for specific week)

- **Shopping Lists**:
  - `GET /api/shopping-lists/:id`
  - `POST /api/shopping-lists` (generate from meal plan)
  - `PUT /api/shopping-lists/:id/items/:itemId` (update item state)
  - `GET /api/shopping-lists/:id/export` (export in various formats)

- **History & Stats**:
  - `GET /api/history` (user's cooking history)
  - `POST /api/history` (mark recipe as cooked)
  - `PUT /api/history/:id` (update rating/notes)
  - `GET /api/stats` (user statistics)

- **Templates**:
  - `GET /api/templates`
  - `POST /api/templates`
  - `PUT /api/templates/:id`
  - `DELETE /api/templates/:id`

- **Settings**:
  - `GET /api/settings`
  - `PUT /api/settings`

- **Integrations**:
  - `POST /api/integrations/google-calendar/connect` (OAuth flow)
  - `POST /api/integrations/google-calendar/events` (create events)
  - `POST /api/integrations/email/send` (send shopping list)

#### 4. Security Requirements
- **API Key Management**: Move sensitive keys to backend environment variables
- **Rate Limiting**: Prevent abuse of AI parsing endpoint
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize user inputs
- **CORS Configuration**: Proper CORS setup
- **HTTPS**: Enforce HTTPS in production

#### 5. File Storage
- **Recipe Images**: Store recipe images (S3, Cloudinary, or Supabase Storage)
- **Shopping List Exports**: Generate and store export files
- **User Avatars**: If user profiles added

#### 6. Background Jobs
- **Email Sending**: Queue emails for async processing
- **Calendar Sync**: Sync calendar events in background
- **Data Cleanup**: Clean up old shopping lists, expired tokens

#### 7. Caching
- **Recipe Search**: Cache search results
- **Statistics**: Cache computed statistics
- **Popular Recipes**: Cache frequently accessed recipes

#### 8. Monitoring & Analytics
- **Error Tracking**: Sentry or similar
- **Performance Monitoring**: Track API response times
- **Usage Analytics**: Track feature usage
- **Logging**: Structured logging for debugging

---

## Technology Recommendations for Backend

### Option 1: Node.js/Express + PostgreSQL
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL (Supabase or standalone)
- **ORM**: Prisma or TypeORM
- **Auth**: JWT with Passport.js or NextAuth
- **File Storage**: Supabase Storage or AWS S3
- **Deployment**: Vercel (serverless) or Railway/Render (traditional)

### Option 2: Next.js Full-Stack
- **Framework**: Next.js 14+ (App Router)
- **API Routes**: Built-in API routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Deployment**: Vercel (native support)

### Option 3: Python/FastAPI + PostgreSQL
- **Framework**: FastAPI
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy
- **Auth**: JWT with python-jose
- **File Storage**: Supabase Storage or AWS S3
- **Deployment**: Railway, Render, or AWS

### Option 4: Keep Supabase, Add Edge Functions
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL (current)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Supabase (native)

---

## Migration Strategy

### Phase 1: Backend Foundation
1. Set up backend framework and database
2. Create proper relational schema
3. Implement user authentication
4. Migrate existing data from JSONB arrays to relational tables

### Phase 2: API Development
1. Build REST API endpoints
2. Move API key management to backend
3. Implement server-side validation
4. Add rate limiting and security

### Phase 3: Frontend Integration
1. Update frontend to use new API endpoints
2. Remove localStorage dependency (keep as fallback)
3. Implement proper error handling
4. Add loading states and optimistic updates

### Phase 4: Enhanced Features
1. Add recipe images
2. Implement recipe sharing
3. Add collaboration features
4. Enhance analytics and stats

---

## Key Files Reference

### Frontend Core
- `src/App.jsx` - Main app component
- `src/main.jsx` - Entry point
- `src/context/RecipeContext.jsx` - Recipe state management
- `src/context/CartContext.jsx` - Cart state management
- `src/context/SettingsContext.jsx` - Settings state management

### Components
- `src/components/Search.jsx` - Recipe search
- `src/components/Cart.jsx` - Meal planning cart
- `src/components/AddRecipe.jsx` - Add recipe form
- `src/components/MyRecipes.jsx` - Recipe collection view
- `src/components/Stats.jsx` - Statistics dashboard
- `src/components/Settings.jsx` - Settings page

### Utilities
- `src/utils/recipeParser.js` - Recipe parsing utilities
- `src/utils/supabaseStorage.js` - Supabase storage abstraction
- `src/utils/localStorage.js` - LocalStorage utilities
- `src/utils/googleCalendarService.js` - Google Calendar integration
- `src/utils/emailService.js` - Email sending
- `src/utils/anthropicService.js` - Anthropic API client

### Backend/API
- `api/parse-recipe.js` - Recipe parsing API endpoint
- `api/add-recipe.js` - (Verify if exists)

### Configuration
- `package.json` - Dependencies
- `vite.config.js` - Vite configuration
- `vercel.json` - Vercel deployment config
- `supabase-schema.sql` - Current database schema

### Documentation
- `README.md` - Main README
- `WEB_APP_README.md` - Web app specific docs
- `SUPABASE_SETUP.md` - Supabase setup guide
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup
- `APPLICATION_CONTEXT_FOR_NAMING.md` - App context for naming

---

## Environment Variables Needed

### Frontend (Public)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

### Backend (Private)
- `ANTHROPIC_API_KEY` - Anthropic API key
- `EMAILJS_SERVICE_ID` - EmailJS service ID
- `EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `EMAILJS_PUBLIC_KEY` - EmailJS public key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

---

## Success Metrics to Consider

- Number of recipes in database
- Weekly meal plans created
- Shopping lists generated
- Recipes cooked (history entries)
- Average rating
- Most popular recipes
- User engagement (daily/weekly active users)
- Feature usage (calendar integration, email sending)

---

## Questions for Backend Design

1. **Multi-tenancy**: Single user per database, or shared database with user isolation?
2. **Household Sharing**: Should multiple users be able to share recipes/meal plans within a household?
3. **Recipe Ownership**: Can users share recipes publicly, or keep them private?
4. **Image Storage**: Where to store recipe images? (S3, Cloudinary, Supabase Storage)
5. **Search**: Use database full-text search, or external service (Algolia, Typesense)?
6. **Real-time Updates**: WebSockets for real-time collaboration, or polling?
7. **Mobile App**: Plan for native mobile apps, or PWA sufficient?
8. **Offline Support**: How important is offline functionality?
9. **Analytics**: What analytics platform? (Google Analytics, Mixpanel, custom)
10. **Cost Optimization**: Budget constraints for API usage (Anthropic, email, storage)?

---

This document provides comprehensive context for designing a full-stack backend for "Babe, What's for Dinner?". Use this as input for backend architecture discussions and implementation planning.

