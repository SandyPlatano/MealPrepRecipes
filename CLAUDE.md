# MealPrepRecipes - Claude Context

## Project Overview

**"Babe, What's for Dinner?"** - A meal planning app for couples and families.

| Aspect | Details |
|--------|---------|
| Stack | Next.js 16.1 (App Router) \| TypeScript 5 \| Supabase \| Tailwind + shadcn/ui |
| Live URL | https://babewfd.com |
| Dev Server | http://localhost:3001 |
| Repo Root | Code in `nextjs/` subdirectory |

---

## Quick Commands

```bash
cd nextjs && npm run dev       # Start dev server (port 3001)
cd nextjs && npm run build     # Production build
cd nextjs && npm run lint      # Run ESLint
cd nextjs && npm run test      # Run Vitest unit tests
cd nextjs && npm run test:e2e  # Run Playwright E2E tests
```

---

## Directory Structure

```
nextjs/src/
├── app/
│   ├── (app)/app/           # Authenticated routes (/app/*)
│   │   ├── recipes/         # Recipe management
│   │   ├── plan/            # Meal planning
│   │   ├── shop/            # Shopping list
│   │   ├── nutrition/       # Nutrition tracking
│   │   ├── stats/           # Statistics dashboard
│   │   └── settings/        # User settings (14+ pages)
│   ├── (auth)/              # Auth pages (login, signup, forgot-password)
│   ├── (marketing)/         # Landing, pricing, legal pages
│   ├── (public)/            # Public profiles, shared recipes
│   ├── api/                 # API routes (25+ directories)
│   └── actions/             # Server actions
│       ├── settings/        # Modular (14 files) - PATTERN TO FOLLOW
│       ├── meal-plans/      # Modular (6 files)
│       └── *.ts             # Other actions (some need modularization)
├── components/              # React components (47 directories)
│   ├── ui/                  # shadcn/ui primitives
│   ├── landing/             # Marketing components
│   ├── recipes/             # Recipe components
│   ├── meal-plan/           # Planner components
│   └── shopping-list/       # Shopping list components
├── lib/                     # Utilities (21 directories)
│   ├── ai/                  # Claude AI prompts and extraction
│   ├── cache/               # Redis caching (Upstash)
│   ├── supabase/            # Database clients
│   └── search/              # Global search utilities
├── hooks/                   # React hooks
│   └── queries/             # TanStack Query hooks
├── contexts/                # React context providers
└── types/                   # TypeScript definitions (35+ files)

supabase/migrations/         # Database migrations
docs/                        # Documentation
.docs/                       # Internal plans (Claude format)
research/                    # UX/product research archives
```

---

## Architecture Decisions

### Data Fetching
- Server Components fetch data with parallel `Promise.all()`
- Server Actions use `"use server"` directive
- Redis caching (Upstash) for expensive queries
- Database-level smart folder cache with trigger invalidation

### Authentication
- Supabase Auth with email + Google OAuth
- Row Level Security (RLS) on all tables
- Household-based data isolation (most queries filter by household_id)

### State Management
- Server Components for initial data
- URL state for filters/views (nuqs library)
- React Context for settings and search
- TanStack Query for client-side caching

### Styling
- Tailwind CSS with `cn()` utility for conditional classes
- shadcn/ui components in `components/ui/`
- CSS variables for theming
- **Design System**: See `src/lib/brand/design-system.md` for complete styling guidelines

---

## Code Conventions

### TypeScript
- **NEVER use `any`** - look up types in `src/types/`
- Prefer explicit return types on server actions
- Use Zod for runtime validation at API boundaries

### Components
- Study neighboring files before creating new ones
- Extend existing shadcn/ui patterns
- Use `cn()` from `@/lib/utils` for class merging

### Server Actions
- Located in `app/actions/`
- Modular structure for large files (follow `settings/` pattern)
- Always validate user auth first
- Invalidate Redis cache on mutations
- Return `{ data, error }` pattern

### Error Handling
- Throw errors early, no silent failures
- Use toast notifications for user feedback
- Log errors with structured metadata

---

## Database Schema (Key Tables)

```
profiles              # User accounts (first_name, last_name, avatar_url)
households            # Family/couple groups
household_members     # Membership (user_id, household_id, role)
recipes               # Full recipe data (title, ingredients[], instructions[])
recipe_nutrition      # Nutrition facts per recipe
cooking_history       # When recipes were cooked
meal_plans            # Weekly calendars (week_start date)
meal_assignments      # Recipes assigned to days (meal_plan_id, recipe_id, day, meal_type)
shopping_lists        # Auto-generated from meal plans
shopping_list_items   # Individual items with category
pantry_items          # Household inventory
user_settings         # Preferences (complex JSONB structure)
recipe_folders        # User-created folders
smart_folder_recipe_cache  # Precomputed smart folder memberships
```

87 total tables - see `supabase/migrations/` for full schema.

---

## External Services

| Service | Purpose | Env Vars |
|---------|---------|----------|
| Supabase | Database + Auth | `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*` |
| Anthropic Claude | Recipe parsing, AI suggestions | `ANTHROPIC_API_KEY` |
| Stripe | Payments (Pro tier) | `STRIPE_*` |
| Resend | Transactional email | `RESEND_*` |
| Upstash Redis | Caching + rate limiting | `UPSTASH_*` |
| Google | OAuth + Calendar sync | `GOOGLE_*` |
| Vercel | Hosting | Automatic |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Recipe parsing (AI) | 20/hour |
| URL scraping | 30/hour |
| Shopping list email | 10/hour |
| AI meal suggestions | 10/hour |

---

## Common Gotchas

1. **Port 3001** - Dev server runs on 3001, not 3000
2. **Modular Actions** - `settings.ts` and `meal-plans.ts` are barrel exports; actual code is in subdirectories
3. **Smart Folders** - Have database trigger-based cache; mutations should invalidate
4. **RLS Everywhere** - All queries go through Supabase client with user context
5. **Household Scope** - Most data is scoped to household_id, not just user_id
6. **Large Files** - `pixel-art.tsx` (10k lines) needs refactoring

---

## Testing

### Unit Tests (Vitest)
```bash
cd nextjs && npm run test           # Single run
cd nextjs && npm run test:watch     # Watch mode
cd nextjs && npm run test:coverage  # With coverage
```
Test location: `src/lib/__tests__/`

### E2E Tests (Playwright)
```bash
cd nextjs && npm run test:e2e       # Headless
cd nextjs && npm run test:e2e:ui    # With Playwright UI
```
Test location: `e2e/` (auth, onboarding, recipes, social, subscription)

---

## Documentation

| Location | Purpose |
|----------|---------|
| `/docs/` | Architecture, features, operations, design |
| `/.docs/` | Internal Claude plans (requirements.md format) |
| `/research/` | UX/product research archives |
| `/.claude/commands/` | CLI slash commands |

See `/docs/README.md` for full navigation.

---

## CI/CD

- **GitHub Actions**: Auto code review on PRs (`.github/workflows/`)
- **Vercel**: Auto deploy on push to main
- **Region**: us-east-1 (iad1)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/actions/settings/index.ts` | Barrel export pattern (follow this) |
| `lib/cache/redis.ts` | Redis caching utilities |
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/brand/design-system.md` | **Design system** - colors, typography, components |
| `lib/brand/colors.ts` | Color constants and utility functions |
| `types/settings.ts` | Complex settings type definitions |
| `contexts/settings-context.tsx` | Global settings state |

---

## Design System (Warm & Cozy)

**Always reference `src/lib/brand/design-system.md` when building UI.**

### Quick Reference

| Element | Pattern |
|---------|---------|
| Background | `bg-background` (#FFFCF6 warm off-white) |
| Primary Button | `bg-[#1A1A1A] text-white rounded-full` |
| Accent | `bg-[#D9F99D]` (lime green) |
| Card | `bg-white rounded-xl border shadow-sm` |
| Heading | `text-3xl md:text-4xl font-bold` |

### Brand Colors

- **Primary**: `#1A1A1A` (dark, for buttons/text)
- **Lime**: `#D9F99D` (accent, CTAs, highlights)
- **Yellow**: `#FDE047` (charts, secondary)
- **Purple**: `#EDE9FE` (feature cards)
- **Orange**: `#FFF0E6` (feature cards)

### Key Rules

1. Buttons are pill-shaped (`rounded-full`)
2. Sidebar/footer are always dark (`#0D1117`)
3. Use Plus Jakarta Sans font family
4. Soft shadows, rounded corners (xl, 2xl)
5. Lime green for trust sections and CTAs
