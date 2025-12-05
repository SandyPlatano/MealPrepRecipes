# Claude Code Prompt: "Babe, What's for Dinner?" Full-Stack SaaS Conversion

## Project Context

I'm converting my existing React/Vite meal planning app into a full-stack Next.js SaaS application. The app is called **"Babe, What's for Dinner?"** - a meal planning and recipe management app for couples and families.

### Current State
- **Frontend**: Working React SPA with Vite (`src/` directory)
- **Storage**: localStorage with optional Supabase sync (JSONB arrays)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Features**: Recipe management, meal planning, shopping list generation, Google Calendar integration, email shopping lists

### Target State
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL with proper relational schema + RLS
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Email**: Resend (replacing EmailJS)
- **Testing**: Playwright E2E
- **Monitoring**: Sentry
- **Deployment**: Vercel

---

## Key Architectural Decisions (ALREADY MADE)

1. **Auth**: Supabase Auth (NOT NextAuth)
2. **Database**: Supabase Client directly (NO Prisma ORM)
3. **Migration**: Convert existing Vite app to Next.js (preserve components)
4. **Email**: Switch from EmailJS to Resend
5. **Testing**: E2E tests are essential before launch
6. **Monitoring**: Sentry for error tracking

---

## Brand Guidelines (CRITICAL - PRESERVE THESE)

### Voice & Tone
- **Playful, witty, self-aware** - NOT corporate or sterile
- Error messages with personality, not generic text
- Self-deprecating humor is on-brand

### Copy Bank (Use These Exact Phrases)
- "Babe, What's for Dinner?" (app title)
- "Finally, an answer." (tagline)
- "Assign everyone first. No free rides." (cart validation)
- "Give it a name" (template naming prompt)
- "Starting fresh" (clear cart)
- "Boom. Plan sent!" (success message)
- "wandering around like a lost puppy" (shopping list description)
- "Made with love (and mild guilt)" (footer)

### Tab/Navigation Names
- "Find Food" (not "Search")
- "The Vault" (not "My Recipes")
- "Receipts" (not "Stats" or "History")

### Visual Design
- Tally.so-inspired: generous whitespace, soft shadows, rounded elements
- Warm, approachable color palette (refine existing, don't replace)
- Monospace font for app title
- Dark mode as first-class citizen
- Mobile-first responsive

---

## Database Schema (NEW RELATIONAL DESIGN)

Replace the current JSONB array pattern with proper relational tables:

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Households (for family/couple sharing)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Household',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household membership
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Household invitations
CREATE TABLE household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes (one row per recipe, not JSONB array)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  recipe_type TEXT NOT NULL DEFAULT 'Dinner' CHECK (recipe_type IN ('Dinner', 'Baking', 'Breakfast', 'Dessert', 'Snack', 'Side Dish')),
  category TEXT,
  protein_type TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  source_url TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  
  -- Ownership
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  is_shared_with_household BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites (user-recipe junction)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Cooking history
CREATE TABLE cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TIMESTAMPTZ DEFAULT NOW(),
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  notes TEXT
);

-- Meal plans (weekly, tied to household)
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, week_start)
);

-- Meal assignments (recipe to day)
CREATE TABLE meal_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  cook TEXT, -- Name of person cooking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping lists
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE UNIQUE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  custom_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping list items
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  quantity TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  checked BOOLEAN DEFAULT false,
  recipe_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plan templates
CREATE TABLE meal_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assignments JSONB NOT NULL DEFAULT '[]', -- Array of {recipe_id, day_of_week, cook}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  dark_mode BOOLEAN DEFAULT false,
  cook_names TEXT[] DEFAULT ARRAY['You', 'Partner'],
  email_address TEXT,
  additional_emails TEXT[] DEFAULT '{}',
  
  -- Google Calendar tokens (encrypted in production)
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_connected_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies (CRITICAL FOR SECURITY)
- Users can only see/modify their own data
- Household members can see shared recipes and meal plans
- Invitations visible only to sender and recipient (by email match)

---

## Implementation Phases

### Phase 1: Project Setup & Conversion Foundation
1. Create Next.js 14 project in same repo
2. Configure Tailwind + shadcn/ui with existing theme
3. Move existing `src/components/ui/` (shadcn components are compatible)
4. Set up environment variables
5. Configure Supabase client for Next.js SSR (`@supabase/ssr`)

**Key files:**
- `app/layout.tsx` - Root layout with providers
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client  
- `middleware.ts` - Auth middleware

### Phase 2: Database Schema
1. Create SQL migrations for new schema
2. Set up RLS policies
3. Create database triggers (profile creation on signup, updated_at)
4. Test RLS policies thoroughly

### Phase 3: Authentication
1. Auth pages: `/login`, `/signup`, `/forgot-password`
2. Google OAuth callback handling
3. Email verification flow
4. Middleware for protected routes (`/app/*`)
5. Profile creation trigger on signup

### Phase 4: Core Features
**4A: Recipes** - CRUD, search, favorites with RLS
**4B: Meal Planning** - Week selection, assignments, calendar view
**4C: Shopping Lists** - Generation, aisle categorization, interactive checkboxes

### Phase 5: Household Sharing
1. Household creation on signup
2. Email invitation system
3. Accept/decline flow
4. Shared data visibility via RLS

### Phase 6: Integrations
**6A: Google Calendar** - Server-side OAuth, event creation
**6B: Resend Email** - Shopping list emails, invitation emails

### Phase 7: Landing Page
- Hero, features, pricing, FAQ sections
- Legal pages (privacy, terms)
- Tally.so-inspired design with brand voice

### Phase 8: Polish
- E2E tests with Playwright
- Sentry error monitoring
- Loading states, error boundaries
- Mobile responsiveness audit
- SEO optimization

---

## File Structure (Target)

```
/
├── app/
│   ├── (marketing)/           # Public pages
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (auth)/                # Auth pages
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (app)/                 # Protected app
│   │   ├── layout.tsx         # App shell with nav
│   │   └── app/
│   │       ├── page.tsx       # Dashboard
│   │       ├── recipes/
│   │       ├── plan/
│   │       ├── shopping-list/
│   │       ├── stats/
│   │       └── settings/
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   └── webhooks/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn (migrated from existing)
│   ├── features/              # Feature components
│   ├── layout/                # App shell, nav
│   └── marketing/             # Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── resend.ts
│   ├── google-calendar.ts
│   └── utils.ts
├── actions/                   # Server actions
├── hooks/
├── types/
├── tests/                     # Playwright E2E
└── middleware.ts
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend
RESEND_API_KEY=

# Anthropic (for recipe parsing)
ANTHROPIC_API_KEY=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Existing Code Reference

The current app has these key files to migrate/reference:
- `src/components/ui/*` - shadcn components (copy directly)
- `src/components/*.jsx` - Feature components (convert to .tsx, update for new data layer)
- `src/context/*.jsx` - Context providers (replace with server actions + hooks)
- `src/utils/aisleCategories.js` - Shopping list categorization logic (keep)
- `src/utils/googleCalendarService.js` - Google Calendar integration (move to server)
- `api/parse-recipe.js` - Anthropic recipe parsing (keep as API route)

---

## MVP Features (Launch With)

1. ✅ User authentication (email + Google OAuth)
2. ✅ Recipe CRUD with search
3. ✅ Weekly meal planning with assignments
4. ✅ Shopping list generation (aisle-organized)
5. ✅ Household sharing with invitations
6. ✅ Google Calendar integration
7. ✅ Email shopping lists (Resend)
8. ✅ Landing page with pricing
9. ✅ E2E tests for critical flows

## Post-MVP (Later)

- Stripe subscription billing
- Chrome extension update
- Recipe image uploads
- Pantry tracking
- PWA support

---

## Instructions

Start with **Phase 1**. Work incrementally through each phase. After each phase:
1. Verify the feature works
2. Test on mobile
3. Commit with clear message

Keep the existing Vite app running during development - don't break what works. The new Next.js app can live alongside until ready to switch.

**Begin with Phase 1: Create the Next.js project foundation.**

