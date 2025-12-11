# PRD Brief: Premium Features for "Babe, What's for Dinner?" Meal Planning App

## Context
You are creating detailed Product Requirement Documents (PRDs) for a Next.js 14 meal planning app targeting couples and families. The app helps users plan weekly meals, generate shopping lists, and reduce the "what's for dinner?" decision fatigue.

**Current State:** Free app with basic meal planning, recipe management, and shopping lists
**Goal:** Add premium features worth $7-12/month subscription to drive monetization

---

## TECHNICAL FOUNDATION

### Tech Stack
- **Framework:** Next.js 14.2.33 (App Router, React 18, TypeScript 5)
- **Database:** Supabase (PostgreSQL + Row-Level Security)
- **AI:** Anthropic Claude API (already integrated for recipe parsing)
- **Email:** Resend v6.5.2 (already integrated)
- **UI:** Tailwind CSS + shadcn/ui (20+ components installed)
- **Auth:** Supabase Auth with magic links + passwords

### Existing Infrastructure You Can Leverage

#### Database Tables (Already Exists)
```
profiles           → User accounts (id, email, name, avatar)
households         → Family/couple groups (shared meal planning)
household_members  → Membership tracking
recipes            → Full recipe data (ingredients[], instructions[], allergen_tags[], rating, etc.)
cooking_history    → When recipes were cooked (timestamp, rating, notes, photo_url)
meal_plans         → Weekly meal calendars (week_start, household_id)
meal_assignments   → Recipes assigned to days (day_of_week, cook, recipe_id)
shopping_lists     → Auto-generated from meal plans (custom_items[], checked)
pantry_items       → Household inventory (ingredient, category, last_restocked)
user_settings      → Preferences (cook_names[], allergen_alerts[], custom_dietary_restrictions[])
substitutions      → Built-in ingredient swaps (15 pre-populated)
user_substitutions → Personal ingredient preferences
```

#### Server Actions Available (Already Built)
- `getRecipes()` - Fetch all user recipes
- `getRecipe(id)` - Single recipe with full data
- `getCookingHistory(limit)` - Recent cooking log
- `getRecentlyCooked()` - Last 2 weeks (for "Make Again" suggestions)
- `getFavoriteRecipes()` - User's favorited recipes
- `getSuggestedRecipes()` - ML-style recommendations based on history
- `getMealPlanWithAssignments(weekStart)` - Full week with recipes
- `getOrCreateShoppingList()` - Current shopping list
- `getPantryItems()` - Household inventory
- `getSettings()` - User preferences including allergen_alerts[], custom_dietary_restrictions[]

#### AI Capabilities (Already Integrated)
- **Recipe Parsing:** Claude API extracts structured data from URLs/text/HTML
  - Returns: title, ingredients, instructions, servings, cook times, allergen detection
  - Rate limit: 20 requests/hour per user
  - Endpoint: `POST /api/parse-recipe`
- **Allergen Detection:** Auto-detects 9 FDA allergens + sesame from ingredients
  - Pattern matching against normalized ingredient names
  - Manual override support in `allergen_tags[]`

#### UI Components Available
- Star rating widget, markdown editor, drag-drop calendar
- Toast notifications (sonner), dialog/modal system
- Dark mode support, mobile-responsive layouts
- All shadcn/ui primitives (buttons, cards, badges, alerts, etc.)

---

## FEATURES TO BUILD (5 Premium Features)

### 1. AI Smart Meal Suggestions
**User Problem:** "I don't know what to cook this week. Planning takes too long."

**Goal:** AI suggests 7 meals for the week based on user preferences, cooking history, and variety needs.

**Technical Hooks:**
- Claude API already integrated (use same endpoint as recipe parsing)
- `cooking_history` table has rating, timestamp, notes
- `favorites` table tracks liked recipes
- `meal_assignments` shows past meal plans
- `user_settings` has `allergen_alerts[]` and `custom_dietary_restrictions[]`

**Data Available to AI:**
- User's recipe library (title, category, protein_type, tags, rating)
- Cooking frequency (last cooked date, total times cooked)
- User ratings (1-5 stars per cook event)
- Seasonal context (current date)
- Household size (servings preferences)
- Dietary restrictions (allergen_alerts, custom_dietary_restrictions)
- Past meal plans (avoid repeats from last 2-4 weeks)

**Expected Flow:**
1. User clicks "Suggest This Week's Meals" button
2. Backend gathers context (recent cooking history, favorites, ratings, restrictions)
3. Calls Claude API with prompt: "Suggest 7 diverse meals for the week"
4. AI returns recipe IDs or new recipe suggestions
5. User can accept all, swap individual meals, or regenerate
6. One-click "Add to Meal Plan" populates the week

**Constraints:**
- Must respect allergen alerts and dietary restrictions
- Suggest variety (different protein types, cuisines)
- Balance prep complexity (not all hard recipes)
- Consider what's already planned or recently cooked

---

### 2. Advanced Nutrition Tracking & Macro Planning
**User Problem:** "I want to eat healthier but don't know the nutrition info of my meals."

**Goal:** Auto-calculate nutrition from recipes, show weekly dashboards, set macro targets.

**Technical Hooks:**
- Claude API can parse nutrition data from recipe text/URLs
- `recipes` table has `ingredients[]` (can be analyzed for nutrition)
- `cooking_history` tracks what was actually eaten
- `meal_assignments` shows planned meals for the week
- `user_settings` can store macro targets (new fields: `daily_calories`, `daily_protein`, `daily_carbs`, `daily_fat`)

**Data to Track (New Fields):**
```sql
-- Add to recipes table
nutrition_info JSONB  → {calories, protein, carbs, fat, fiber, sugar, sodium}
nutrition_per_serving JSONB → Same as above, divided by base_servings

-- Add to user_settings table
daily_calorie_target INTEGER
daily_protein_target INTEGER  (grams)
daily_carb_target INTEGER
daily_fat_target INTEGER
track_macros BOOLEAN  → Enable/disable feature
```

**Expected Flow:**
1. **Recipe Import:** When parsing recipe, Claude extracts nutrition (if available)
2. **Manual Entry:** User can override or add nutrition manually
3. **Weekly Dashboard:** Shows total macros planned for the week
4. **Daily View:** Breakdown per day (breakfast/lunch/dinner slots)
5. **Targets:** User sets goals (e.g., "1800 calories, 120g protein")
6. **Smart Suggestions:** "Add salmon tomorrow to hit protein goal"
7. **History Tracking:** See nutrition trends over time (graph)

**API Integration:**
- Use Claude to parse nutrition from recipe text: "Extract nutrition info: [ingredients list]"
- Fallback to USDA nutrition database API (optional, free)
- Allow manual entry for user-created recipes

**Constraints:**
- Nutrition is per serving (must scale based on servings eaten)
- Some recipes won't have nutrition data (show "Unknown" or estimate)
- Weekly totals calculated from meal_assignments

---

### 3. Fridge/Pantry Camera Integration
**User Problem:** "I don't remember what ingredients I have. I waste food by buying duplicates."

**Goal:** Take photo of fridge/pantry, AI recognizes ingredients, suggests recipes.

**Technical Hooks:**
- Claude Vision API (Anthropic supports image input)
- `pantry_items` table already tracks household inventory
- `recipes.ingredients[]` can be matched against pantry
- `shopping_list_items` can exclude pantry items

**Data Flow:**
1. User takes photo of fridge/pantry shelf
2. Upload to Supabase Storage (same bucket as recipe images)
3. Send image to Claude Vision API with prompt:
   ```
   "Identify visible food ingredients in this photo. Return as list: {ingredient, quantity (if visible), confidence}."
   ```
4. Claude returns structured list: `[{ingredient: "milk", quantity: "1 carton", confidence: 0.95}, ...]`
5. User reviews and confirms detected items
6. Auto-add to `pantry_items` table
7. Show "You can make these 5 recipes" based on pantry matching

**Technical Implementation:**
- New API endpoint: `POST /api/pantry/scan-image`
- Image upload to Supabase Storage: `pantry-scans/` bucket
- Claude Vision prompt engineering for food detection
- Ingredient normalization (e.g., "whole milk" → "milk")
- Confidence threshold: only show items >80% confidence

**UI Flow:**
- "Scan Fridge" button in Pantry page
- Camera capture or upload from gallery
- Loading state: "Analyzing your fridge..."
- Review screen: checkboxes for each detected item
- "Add to Pantry" saves confirmed items

**Constraints:**
- Limit 10 scans/month for Pro tier (prevent abuse)
- Image size limit: 5MB max
- Only supports common grocery items (not exotic ingredients)

---

### 4. Social Features (Recipe Sharing & Reviews)
**User Problem:** "I want to share my favorite recipes with friends or see what others are cooking."

**Goal:** Public recipe sharing, community reviews, follow other users, trending recipes.

**Technical Hooks:**
- `recipes` table has `is_shared_with_household` (expand to public sharing)
- `cooking_history` has `rating` and `notes` (can be public reviews)
- `favorites` shows what users like
- `profiles` has `avatar_url` for user identity

**New Database Tables:**
```sql
-- Public recipe sharing
recipe_shares (
  recipe_id UUID → recipes.id
  is_public BOOLEAN  → Make recipe discoverable
  share_token VARCHAR(32)  → Unique link for private sharing
  view_count INTEGER  → Popularity metric
  created_at TIMESTAMPTZ
)

-- Community reviews (separate from personal cooking_history)
recipe_reviews (
  id UUID PRIMARY KEY
  recipe_id UUID → recipes.id (only public recipes)
  user_id UUID → profiles.id
  rating INTEGER  (1-5 stars)
  review_text TEXT
  helpful_count INTEGER  → Upvotes
  created_at TIMESTAMPTZ
)

-- User following
user_follows (
  follower_id UUID → profiles.id
  following_id UUID → profiles.id
  created_at TIMESTAMPTZ
  UNIQUE(follower_id, following_id)
)

-- Activity feed
user_activity (
  id UUID PRIMARY KEY
  user_id UUID → profiles.id
  activity_type VARCHAR(50)  → 'cooked', 'shared_recipe', 'reviewed'
  recipe_id UUID (optional)
  metadata JSONB  → {photo_url, rating, notes}
  created_at TIMESTAMPTZ
)
```

**Expected Flow:**
1. **Share Recipe:** User clicks "Share" → get shareable link or make public
2. **Public Gallery:** Browse trending/popular recipes from community
3. **User Profiles:** See what others are cooking (public activity feed)
4. **Reviews:** Leave reviews on public recipes (5-star + text)
5. **Follow Users:** Follow friends or favorite cooks
6. **Feed:** See activity from followed users ("Sarah cooked Lasagna ⭐⭐⭐⭐⭐")

**Privacy Controls:**
- Default: recipes are private (only household sees)
- Opt-in public sharing per recipe
- Activity feed visibility: public/private toggle in settings
- Block/report system for abuse

**Constraints:**
- Reviews only for public recipes
- User profiles show only public data (name, avatar, public recipes)
- Activity feed pagination (limit 50 items)

---

### 5. Multi-Week Planning (Monthly Calendar)
**User Problem:** "I want to plan meals for the whole month, not just one week."

**Goal:** Extend meal planning to 4-week view, reuse templates, bulk operations.

**Technical Hooks:**
- `meal_plans` table uses `week_start` (Monday ISO date)
- `meal_plan_templates` already supports reusable patterns
- Current UI: `react-big-calendar` supports monthly view
- `meal_assignments` links recipes to specific days

**Database Changes:**
```sql
-- No schema changes needed! Just UI enhancement.
-- Existing tables already support multi-week:
meal_plans (week_start)  → Can create 4 entries for 4 weeks
meal_assignments (meal_plan_id, day_of_week, recipe_id)
```

**New Features:**
1. **Monthly Calendar View:**
   - Show 4 weeks at once (grid layout)
   - Color-coded by cook (existing `cook_colors` in user_settings)
   - Drag-drop between weeks

2. **Template Auto-Fill:**
   - "Apply template to all weeks this month"
   - Rotate templates week-by-week (Template A, B, A, B...)

3. **Bulk Operations:**
   - "Copy last week to this week"
   - "Clear all meals in Week 3"
   - "Shuffle recipes across weeks"

4. **Shopping List Aggregation:**
   - "Generate shopping list for all 4 weeks"
   - Group by week: "Week 1 needs milk, Week 3 needs milk"

5. **Recipe Rotation Suggestions:**
   - "You cooked Tacos 3 times this month. Try something new?"
   - Diversity score per month

**UI Components:**
- Month switcher: "November 2025" with arrows
- Week headers: "Week 1 (Nov 4-10)", "Week 2 (Nov 11-17)", etc.
- Collapsible weeks for mobile (accordion view)
- "Quick Fill" toolbar: Apply templates, copy weeks, clear all

**Expected Flow:**
1. User switches to "Monthly View" tab
2. Sees 4 weeks at once (or all weeks in current month)
3. Can drag recipes between weeks
4. Click "Auto-Fill" → AI suggests diverse meals for all 4 weeks
5. Click "Generate Shopping" → Combined list for the month
6. Export to calendar: all 4 weeks sync to Google Calendar

**Constraints:**
- Performance: Limit to current month + next month (max 8 weeks loaded)
- Mobile: Collapsible accordion for smaller screens
- Shopping list: Paginate if >100 items

---

## PRD REQUIREMENTS (What to Include in Each PRD)

For each feature above, create a detailed PRD with these sections:

### 1. Executive Summary
- Feature name
- Target user problem (pain point)
- Success metrics (how we measure success)
- Priority (P0/P1/P2)

### 2. User Stories
- As a [user type], I want to [action], so that [benefit]
- At least 5 user stories per feature
- Include edge cases

### 3. Functional Requirements
- Detailed list of what the feature must do
- Input/output specifications
- Business logic rules

### 4. Technical Specification
- Database schema changes (SQL)
- New API endpoints (route, method, request/response)
- Server actions to create/modify
- Claude API integration details (prompts, context)
- UI components needed (list shadcn/ui components to use)

### 5. User Interface Design
- Wireframe descriptions (text-based)
- User flow diagrams (step-by-step)
- Mobile vs desktop considerations
- Accessibility requirements (WCAG 2.1 AA)

### 6. Data Model
- New tables/columns (PostgreSQL schema)
- Indexes for performance
- RLS policies (Row-Level Security rules)
- Data relationships (foreign keys)

### 7. API Design
- Endpoint definitions (REST or Server Actions)
- Request/response payloads (JSON schema)
- Error handling (status codes, messages)
- Rate limiting strategy

### 8. AI/ML Integration
- Claude API prompt engineering
- Context gathering (what data to send)
- Response parsing (expected format)
- Fallback behavior (if AI fails)
- Cost estimation (tokens per request)

### 9. Security & Privacy
- Authentication requirements
- Authorization (who can access what)
- Data encryption (at rest/in transit)
- PII handling (if applicable)
- GDPR compliance considerations

### 10. Performance Requirements
- Response time targets (< 2s for AI calls)
- Scalability limits (e.g., max recipes per user)
- Caching strategy
- Database query optimization

### 11. Testing Strategy
- Unit tests (which functions to test)
- Integration tests (API endpoints)
- E2E tests (user flows)
- Load testing (if needed)

### 12. Rollout Plan
- Feature flags (gradual rollout)
- Beta testing group
- Success metrics to monitor
- Rollback plan

### 13. Open Questions
- Unresolved decisions
- Risks and mitigation
- Dependencies on other features

### 14. Future Enhancements
- V2 ideas (out of scope for initial release)
- Long-term vision

---

## MONETIZATION CONTEXT

### Pricing Tiers (For Reference)
**Free Tier:**
- Unlimited recipes
- 1-week meal planning
- Basic shopping lists
- Household sharing (2 people)

**Pro Tier - $7/month or $60/year:**
- ✅ AI meal suggestions (3/week)
- ✅ Nutrition tracking
- ✅ Fridge scanning (10/month)
- ✅ Multi-week planning (4 weeks)
- ✅ Social features (share recipes, follow users)
- Priority support

**Premium Tier - $12/month or $100/year:**
- Everything in Pro
- Unlimited AI suggestions
- Unlimited fridge scans
- Advanced analytics
- Early access to features

### Feature Priority for PRDs:
1. **AI Smart Meal Suggestions** (P0) - Highest revenue driver
2. **Nutrition Tracking** (P0) - Competitive with $15/month apps
3. **Fridge Camera** (P1) - Viral/shareable, unique differentiator
4. **Social Features** (P1) - Network effects, retention
5. **Multi-Week Planning** (P2) - Power user feature

---

## EXAMPLE CLAUDE API PROMPTS (For PRDs)

### AI Meal Suggestions Prompt
```
You are a meal planning assistant for a family of [X] people. Based on their cooking history, dietary restrictions, and preferences, suggest 7 diverse meals for the week.

Context:
- Recently cooked: [recipe titles from last 2 weeks]
- Favorite recipes: [top 5 rated recipes]
- Dietary restrictions: [allergen_alerts + custom_dietary_restrictions]
- Protein variety: [ensure mix of chicken, beef, fish, vegetarian]
- Cuisine variety: [Italian, Mexican, Asian, American]
- Complexity: [balance easy weeknight meals with weekend projects]
- Season: [current month for seasonal ingredients]

Return JSON array:
[
  {
    "day": "Monday",
    "recipe_id": "uuid-if-existing" or null,
    "suggested_title": "recipe name",
    "reason": "why this fits (e.g., 'You loved this last time', 'New Italian dish for variety')"
  },
  ...
]
```

### Nutrition Extraction Prompt
```
Extract nutrition information from this recipe:

Title: [recipe title]
Servings: [base_servings]
Ingredients:
[ingredients list]

Return JSON:
{
  "per_serving": {
    "calories": integer,
    "protein": integer (grams),
    "carbs": integer,
    "fat": integer,
    "fiber": integer,
    "sugar": integer,
    "sodium": integer (mg)
  },
  "confidence": float (0-1),
  "notes": "any caveats or assumptions"
}
```

### Fridge Scanning Prompt
```
Identify food ingredients visible in this refrigerator/pantry photo. Focus on whole foods, packaged items, and common groceries.

Return JSON array:
[
  {
    "ingredient": "normalized name (e.g., 'milk' not 'whole milk')",
    "quantity": "estimated quantity (e.g., '1 carton', '500g', 'half bottle')" or null,
    "category": "Produce/Dairy/Meat/Pantry/Other",
    "confidence": float (0-1)
  },
  ...
]

Only include items with confidence > 0.8. Ignore unclear items.
```

---

## SUCCESS METRICS (For PRD Reference)

### AI Meal Suggestions
- Acceptance rate: % of suggested meals added to plan
- User retention: Do users return weekly?
- Time saved: Compare manual planning time vs AI-assisted

### Nutrition Tracking
- Engagement: % of users who set macro targets
- Accuracy: User-reported satisfaction with nutrition data
- Conversion: Free → Pro tier upgrade rate

### Fridge Camera
- Scan volume: Average scans per month
- Pantry accuracy: % of detected items confirmed by user
- Recipe discovery: Recipes cooked from pantry suggestions

### Social Features
- Network growth: New users from shared recipes
- Engagement: Comments/reviews per public recipe
- Retention: Users with followers cook 2x more

### Multi-Week Planning
- Planning horizon: Average weeks planned ahead
- Template usage: % using templates vs manual planning
- Power users: % planning >2 weeks

---

## CONSTRAINTS & GUIDELINES

### Development Constraints
- Must use existing Supabase schema where possible (minimize migrations)
- All new features must have RLS policies (security first)
- Claude API calls must be rate-limited (20/hour per user)
- Mobile-first UI design (80% users on mobile)

### Business Constraints
- Free tier must remain valuable (don't paywall existing features)
- Pro tier must deliver clear ROI ($7/month = saves 2+ hours/week)
- Features must work offline where possible (PWA support)

### Technical Debt to Avoid
- Don't create new auth system (use Supabase Auth)
- Don't duplicate recipe storage (extend existing schema)
- Don't bypass RLS (all queries go through Supabase client)
- Don't ignore rate limiting (Claude API costs add up)

---

## OUTPUT FORMAT

For each feature, generate a **complete, production-ready PRD** in Markdown format with all 14 sections listed above. Be specific about:
- Exact SQL schema changes
- Exact API endpoint signatures
- Exact Claude prompts to use
- Exact UI component names (shadcn/ui)
- Exact database queries (with indexes)

Make it detailed enough that a developer can implement without asking questions.

---

## FEATURES TO GENERATE PRDs FOR:

1. ✅ **AI Smart Meal Suggestions**
2. ✅ **Advanced Nutrition Tracking & Macro Planning**
3. ✅ **Fridge/Pantry Camera Integration**
4. ✅ **Social Features (Recipe Sharing & Reviews)**
5. ✅ **Multi-Week Planning (Monthly Calendar)**

Generate all 5 PRDs as separate documents. Start with Feature #1 (AI Smart Meal Suggestions) as the highest priority.
