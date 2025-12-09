# Product Requirements Document (PRD)
## Babe, What's for Dinner? - Meal Planning Application

### 1. Product Overview

**Product Name:** Babe, What's for Dinner?

**Product Description:**
A comprehensive meal planning application designed for couples and families to eliminate the daily "what's for dinner?" debate. The application enables users to manage recipes, plan weekly meals, generate shopping lists, and track cooking history.

**Target Audience:**
- Couples living together
- Families with multiple members
- Individuals who want to organize their meal planning

**Core Value Proposition:**
- Simplify meal planning through AI-powered recipe import
- Collaborative meal planning for households
- Automated shopping list generation
- Cooking history tracking and recipe ratings

---

### 2. Technical Stack

#### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5
- **UI Library:** shadcn/ui (Radix UI components)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **Date Handling:** date-fns, react-day-picker
- **Icons:** lucide-react
- **Theming:** next-themes
- **Notifications:** sonner

#### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **API:** Next.js API Routes + Server Actions
- **Security:** Row Level Security (RLS) policies
- **Rate Limiting:** Custom implementation

#### Integrations
- **AI:** Anthropic Claude API (recipe parsing)
- **Email:** Resend API (transactional emails)
- **Calendar:** Google Calendar API (OAuth integration)
- **Storage:** Supabase Storage (recipe images)

#### Deployment
- **Platform:** Vercel
- **PWA:** Service Worker (offline support)

---

### 3. Core Features

#### 3.1 Recipe Management
- **AI-Powered Import:** Users can paste recipe URLs and AI extracts ingredients, instructions, and cook times automatically
- **Unlimited Recipes:** Save unlimited recipes with organization capabilities
- **Smart Tagging:** Categorize recipes by protein type, cuisine, meal type, and custom tags
- **Favorites & Ratings:** Mark favorite recipes and rate them after cooking
- **Recipe Scaling:** Adjust serving sizes dynamically
- **Recipe Images:** Upload and store recipe images in Supabase Storage
- **Cooking History:** Track what users have cooked and when
- **Recipe Discovery:** Browse and discover recipes

#### 3.2 Meal Planning
- **Weekly Planning:** Plan meals for the entire week
- **Drag-and-Drop Interface:** Visual drag-and-drop interface for meal planning
- **Cook Assignment:** Assign meals to different household members
- **Google Calendar Sync:** Sync meal plans to Google Calendar (Pro feature)
- **Meal History:** Track cooking history
- **Meal Plan Finalization:** Finalize meal plans and generate shopping lists
- **Week Stats:** View statistics about planned meals

#### 3.3 Shopping Lists
- **Auto-Generation:** Automatically generated from weekly meal plan
- **Category Organization:** Items grouped by grocery store sections
- **Email Integration:** Send shopping lists via email
- **Ingredient Scaling:** Adjust serving sizes on the fly
- **Shopping List View:** Dedicated shopping list interface

#### 3.4 Household Sharing
- **Multi-User Support:** Share recipes and meal plans with partner/family
- **Collaborative Planning:** Everyone can see and contribute to meal plan
- **Individual Preferences:** Each user has their own favorites
- **Household Members:** Manage household members

#### 3.5 User Management
- **Authentication:** Email/password and Google OAuth
- **User Settings:** Customizable user settings
- **Dietary Restrictions:** Custom dietary restrictions
- **Pantry Management:** Track pantry items
- **Onboarding:** User onboarding flow

#### 3.6 Additional Features
- **PWA Support:** Progressive Web App with offline support
- **Dark Mode:** Theme switching (light/dark)
- **Responsive Design:** Mobile and desktop optimized
- **Cookie Consent:** GDPR-compliant cookie consent
- **Rate Limiting:** API rate limiting for protection
- **Meal Plan Suggestions:** AI-powered meal suggestions

---

### 4. User Flows

#### 4.1 Onboarding Flow
1. User visits landing page
2. User clicks "Sign Up Free"
3. User creates account (email/password or Google OAuth)
4. User completes onboarding dialog
5. User is redirected to main app

#### 4.2 Recipe Import Flow
1. User navigates to Recipes page
2. User clicks "Add Recipe" or "Import Recipe"
3. User pastes recipe URL
4. System scrapes URL and sends to AI for parsing
5. AI extracts ingredients, instructions, cook time
6. User reviews and saves recipe
7. Recipe appears in recipe collection

#### 4.3 Meal Planning Flow
1. User navigates to Meal Plan page
2. User views weekly calendar grid
3. User drags recipes from recipe picker to meal slots
4. User assigns cooks to meals
5. User can adjust serving sizes
6. User finalizes meal plan
7. System generates shopping list automatically

#### 4.4 Shopping List Flow
1. User navigates to Shopping List page (or from finalize page)
2. System displays auto-generated list from meal plan
3. Items organized by grocery store categories
4. User can check off items as they shop
5. User can send list via email
6. User can adjust quantities or remove items

#### 4.5 Cooking Flow
1. User navigates to recipe detail page
2. User clicks "Cook This" button
3. System records cooking event in history
4. After cooking, user can rate recipe
5. Rating updates recipe statistics

#### 4.6 Settings Flow
1. User navigates to Settings page
2. User can update profile information
3. User can set dietary restrictions
4. User can manage Google Calendar integration
5. User can manage pantry items
6. User can update household members

---

### 5. Architecture

#### 5.1 Routing Structure
- **App Routes:** `/app/*` (authenticated routes: plan, recipes, shop, settings, pantry, history, finalize)
- **Auth Routes:** `/login`, `/signup`, `/forgot-password`
- **Marketing Routes:** `/`, `/about`, `/privacy`, `/terms`, `/pricing`
- **API Routes:** `/api/parse-recipe`, `/api/scrape-url`, `/api/send-shopping-list`, `/api/google-calendar/*`

#### 5.2 Data Flow
- **Server Actions:** Next.js Server Actions for data mutations
- **API Routes:** API routes for external integrations
- **Supabase Client:** Server and client-side Supabase clients
- **Real-time:** Supabase real-time subscriptions (if applicable)

#### 5.3 Security
- **Row Level Security:** RLS policies on all database tables
- **Rate Limiting:** Custom rate limiting on API endpoints
- **SSRF Protection:** SSRF protection on URL scraping
- **Authentication:** Authentication required for sensitive operations
- **Security Headers:** CSP, HSTS, and other security headers

---

### 6. Database Schema

#### Core Tables
- `users` (profiles)
- `recipes`
- `ingredients`
- `meal_plans`
- `meal_plan_items`
- `shopping_lists`
- `shopping_list_items`
- `cooking_history`
- `household_members`
- `user_settings`
- `pantry_items`
- `recipe_images`

#### Key Relationships
- Users belong to households
- Recipes belong to users
- Meal plans belong to households
- Shopping lists generated from meal plans
- Cooking history tracks recipe usage

---

### 7. Testing Requirements

#### 7.1 Frontend Testing
- **Components:** React components with shadcn/ui
- **Interactions:** Drag-and-drop, form submissions, modal interactions
- **Routing:** Next.js App Router navigation
- **State Management:** Context providers and state updates

#### 7.2 Backend Testing
- **API Endpoints:** Rate-limited API routes
- **Server Actions:** Data mutations and queries
- **Authentication:** Protected routes and user permissions
- **Database Operations:** CRUD operations with RLS

#### 7.3 Integration Testing
- **External APIs:** Anthropic API, Resend API, Google Calendar API
- **Authentication Flows:** Email/password and OAuth flows
- **Email Functionality:** Shopping list email sending

#### 7.4 User Flow Testing
- **Onboarding:** New user signup and onboarding
- **Recipe Import:** AI-powered recipe import from URL
- **Meal Planning:** Creating and editing weekly meal plans
- **Shopping List:** Generating and finalizing shopping lists
- **Cooking:** Marking recipes as cooked and rating them
- **Settings:** Updating user settings and preferences

---

### 8. Success Metrics

#### User Engagement
- Number of recipes saved per user
- Number of meal plans created per week
- Frequency of app usage
- Recipe ratings and favorites usage

#### Feature Adoption
- AI recipe import usage rate
- Shopping list generation rate
- Google Calendar sync adoption (Pro feature)
- Email shopping list usage

#### Technical Metrics
- API response times
- Error rates
- Rate limiting effectiveness
- Database query performance

---

### 9. Future Enhancements

#### Planned Features (Pro Tier - $5/month)
- Enhanced household sharing
- Advanced Google Calendar sync
- Email shopping lists
- Recipe scaling improvements
- AI meal suggestions
- Nutrition information
- Dietary restriction filters
- Mobile app

---

### 10. Constraints and Considerations

#### Technical Constraints
- Rate limiting on API endpoints (20/hour for recipe parsing, 30/hour for URL scraping, 10/hour for email)
- Supabase RLS policies must be maintained
- PWA offline functionality limitations
- External API dependencies (Anthropic, Resend, Google)

#### Business Constraints
- Free tier vs Pro tier feature differentiation
- Google Calendar integration is Pro-only feature
- Email functionality may require Pro tier

#### User Experience Considerations
- Mobile-first responsive design
- Accessibility compliance
- Performance optimization
- Offline functionality support

---

### 11. Dependencies

#### External Services
- Supabase (Database, Auth, Storage)
- Anthropic Claude API (Recipe parsing)
- Resend API (Email sending)
- Google Calendar API (Calendar sync)
- Vercel (Hosting)

#### Internal Dependencies
- Next.js 14 App Router
- Supabase client libraries
- shadcn/ui component library
- Tailwind CSS
- Various npm packages (see package.json)

---

### 12. Risk Assessment

#### Technical Risks
- External API failures (Anthropic, Resend, Google)
- Database performance at scale
- Rate limiting bypass attempts
- Security vulnerabilities

#### Mitigation Strategies
- Error handling and fallback mechanisms
- Database indexing and query optimization
- Comprehensive rate limiting
- Regular security audits and updates

---

**Document Version:** 1.0  
**Last Updated:** 2024-12-08  
**Status:** Active

