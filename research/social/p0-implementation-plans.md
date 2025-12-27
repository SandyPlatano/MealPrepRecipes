# P0 Implementation Plans: Build Now Features

> Detailed implementation plans for all 4 P0 features based on codebase analysis.
> **Estimated Total**: 8-12 weeks for solo developer

---

## Current Foundation (What Already Exists)

Based on codebase exploration, these foundations are ready:

| System | Status | Location |
|--------|--------|----------|
| Households | ✅ Exists | `households`, `household_members` tables |
| Household Invitations | ✅ Exists | `household_invitations` table |
| Meal Plans | ✅ Exists | `meal_plans`, `meal_assignments` tables |
| User Settings | ✅ Exists | `user_settings`, SettingsContext |
| Shopping Lists | ✅ Exists | `shopping_lists`, `shopping_list_items` |
| Cook Names/Colors | ✅ Exists | `user_settings.cook_names`, `cook_colors` |
| Real-time | ❌ Not implemented | Supabase Realtime available |
| Accessibility | ⚠️ Partial | Basic Radix UI, needs enhancement |

---

# Feature 1: Household Sharing & Coordination

## 1.1 Overview

**Problem**: Families/couples struggle to coordinate meals. Current apps are single-user focused.

**Solution**: Enhanced household sharing with real-time sync, cooking schedule, and dietary aggregation.

**Who**: Couples, families, roommates sharing meal responsibilities.

### Key Functionality
1. ✅ Shared meal plans (exists, enhance)
2. ✅ Shared shopping lists (exists, enhance)
3. 🆕 Real-time sync across devices
4. 🆕 "Whose turn to cook" scheduling
5. 🆕 Dietary restriction aggregation
6. 🆕 Member activity notifications

---

## 1.2 Technical Design

### Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User A    │    │  Supabase   │    │   User B    │
│   Device    │◄──►│  Realtime   │◄──►│   Device    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────┐
│              Household Context                   │
│  - Shared meal plans                            │
│  - Aggregated dietary restrictions              │
│  - Cooking schedule                             │
│  - Shopping list sync                           │
└─────────────────────────────────────────────────┘
```

### Database Schema Changes

```sql
-- Migration: add_cooking_schedule.sql

-- Cooking schedule for household
CREATE TABLE IF NOT EXISTS cooking_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Monday
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_cook_name TEXT, -- For non-user cooks (kids, etc.)
  is_rotating BOOLEAN DEFAULT false, -- Auto-rotate weekly
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, day_of_week, meal_type)
);

-- Member dietary restrictions (per-member, aggregated at household level)
CREATE TABLE IF NOT EXISTS member_dietary_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.
  allergens TEXT[] DEFAULT '{}', -- nuts, dairy, shellfish, etc.
  dislikes TEXT[] DEFAULT '{}', -- foods they won't eat
  preferences TEXT[] DEFAULT '{}', -- foods they love
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, household_id)
);

-- Household activity feed (for notifications)
CREATE TABLE IF NOT EXISTS household_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'meal_planned', 'recipe_added', 'item_checked', etc.
  entity_type TEXT, -- 'meal_assignment', 'recipe', 'shopping_item'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast activity lookups
CREATE INDEX idx_household_activities_household_id ON household_activities(household_id, created_at DESC);

-- RLS Policies
ALTER TABLE cooking_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_dietary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_activities ENABLE ROW LEVEL SECURITY;

-- Policies: Household members can CRUD their household's data
CREATE POLICY "Household members can manage cooking schedules"
  ON cooking_schedules FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their dietary profiles"
  ON member_dietary_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Household members can view dietary profiles"
  ON member_dietary_profiles FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can view activities"
  ON household_activities FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
```

### New TypeScript Types

```typescript
// types/household-v2.ts

export interface CookingSchedule {
  id: string;
  household_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Monday
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  is_rotating: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberDietaryProfile {
  id: string;
  user_id: string;
  household_id: string;
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  preferences: string[];
  notes: string | null;
}

export interface HouseholdActivity {
  id: string;
  household_id: string;
  user_id: string;
  activity_type:
    | 'meal_planned'
    | 'meal_removed'
    | 'recipe_added'
    | 'recipe_shared'
    | 'item_checked'
    | 'item_added'
    | 'schedule_updated'
    | 'member_joined';
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AggregatedDietaryRestrictions {
  all_restrictions: string[];
  all_allergens: string[];
  all_dislikes: string[];
  by_member: Record<string, MemberDietaryProfile>;
}

export interface HouseholdWithMembers {
  id: string;
  name: string;
  owner_id: string;
  members: {
    user_id: string;
    role: 'owner' | 'member';
    profile: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
    dietary_profile: MemberDietaryProfile | null;
  }[];
  cooking_schedule: CookingSchedule[];
  aggregated_dietary: AggregatedDietaryRestrictions;
}
```

### Server Actions

```typescript
// actions/household-v2.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Get household with all member data
export async function getHouseholdWithMembers(householdId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('households')
    .select(`
      *,
      household_members(
        user_id,
        role,
        profiles(first_name, last_name, avatar_url),
        member_dietary_profiles(*)
      ),
      cooking_schedules(*)
    `)
    .eq('id', householdId)
    .single();

  if (error) throw error;
  return data;
}

// Update cooking schedule
export async function updateCookingSchedule(
  householdId: string,
  dayOfWeek: number,
  mealType: string,
  assignedUserId: string | null,
  assignedCookName: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('cooking_schedules')
    .upsert({
      household_id: householdId,
      day_of_week: dayOfWeek,
      meal_type: mealType,
      assigned_user_id: assignedUserId,
      assigned_cook_name: assignedCookName,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'household_id,day_of_week,meal_type'
    });

  if (error) throw error;

  // Log activity
  await logHouseholdActivity(householdId, 'schedule_updated', 'cooking_schedule', null, {
    day_of_week: dayOfWeek,
    meal_type: mealType
  });

  revalidatePath('/app/settings/household');
  revalidatePath('/app/plan');
}

// Update member dietary profile
export async function updateMemberDietaryProfile(
  userId: string,
  householdId: string,
  profile: Partial<MemberDietaryProfile>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('member_dietary_profiles')
    .upsert({
      user_id: userId,
      household_id: householdId,
      ...profile,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,household_id'
    });

  if (error) throw error;
  revalidatePath('/app/settings/dietary');
}

// Get aggregated dietary restrictions for household
export async function getAggregatedDietaryRestrictions(householdId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('member_dietary_profiles')
    .select('*')
    .eq('household_id', householdId);

  if (error) throw error;

  const all_restrictions = new Set<string>();
  const all_allergens = new Set<string>();
  const all_dislikes = new Set<string>();
  const by_member: Record<string, MemberDietaryProfile> = {};

  data?.forEach(profile => {
    profile.dietary_restrictions?.forEach(r => all_restrictions.add(r));
    profile.allergens?.forEach(a => all_allergens.add(a));
    profile.dislikes?.forEach(d => all_dislikes.add(d));
    by_member[profile.user_id] = profile;
  });

  return {
    all_restrictions: Array.from(all_restrictions),
    all_allergens: Array.from(all_allergens),
    all_dislikes: Array.from(all_dislikes),
    by_member
  };
}

// Log household activity
async function logHouseholdActivity(
  householdId: string,
  activityType: string,
  entityType: string | null,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('household_activities').insert({
    household_id: householdId,
    user_id: user.id,
    activity_type: activityType,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}

// Get recent household activities
export async function getHouseholdActivities(householdId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('household_activities')
    .select(`
      *,
      profiles:user_id(first_name, last_name, avatar_url)
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

### Real-Time Sync Hook

```typescript
// hooks/use-household-realtime.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useHouseholdRealtime(householdId: string | null) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!householdId) return;

    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      channel = supabase
        .channel(`household:${householdId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'meal_assignments',
            filter: `household_id=eq.${householdId}`
          },
          (payload) => {
            console.log('Meal assignment change:', payload);
            setLastUpdate(new Date());
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shopping_list_items',
            filter: `household_id=eq.${householdId}`
          },
          (payload) => {
            console.log('Shopping list change:', payload);
            setLastUpdate(new Date());
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'household_activities',
            filter: `household_id=eq.${householdId}`
          },
          (payload) => {
            console.log('New activity:', payload);
            // Could trigger toast notification here
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [householdId]);

  return { lastUpdate };
}
```

---

## 1.3 Implementation Steps

### Phase 1A: Database & Types (Day 1-2)
- [ ] Create migration `add_cooking_schedule.sql`
- [ ] Create migration `add_member_dietary_profiles.sql`
- [ ] Create migration `add_household_activities.sql`
- [ ] Add TypeScript types `types/household-v2.ts`
- [ ] Run migrations, verify RLS policies

### Phase 1B: Server Actions (Day 3-4)
- [ ] Create `actions/household-v2.ts`
- [ ] Add `getHouseholdWithMembers`
- [ ] Add `updateCookingSchedule`
- [ ] Add `updateMemberDietaryProfile`
- [ ] Add `getAggregatedDietaryRestrictions`
- [ ] Add `logHouseholdActivity`
- [ ] Add `getHouseholdActivities`

### Phase 1C: Real-Time Infrastructure (Day 5-6)
- [ ] Create `hooks/use-household-realtime.ts`
- [ ] Enable Supabase Realtime for relevant tables
- [ ] Test real-time updates between devices
- [ ] Add optimistic UI updates

### Phase 1D: UI Components (Day 7-10)
- [ ] Create `CookingScheduleEditor` component
- [ ] Create `MemberDietaryProfile` component
- [ ] Create `HouseholdActivityFeed` component
- [ ] Update Settings/Household page with new features
- [ ] Add "Who's cooking tonight?" indicator to meal planner
- [ ] Add dietary warning badges to recipe cards

### Phase 1E: Integration & Polish (Day 11-14)
- [ ] Integrate dietary aggregation into recipe suggestions
- [ ] Add allergen warnings when planning meals
- [ ] Add toast notifications for household activity
- [ ] Test multi-device sync
- [ ] Error handling and edge cases
- [ ] Loading states and skeletons

---

## 1.4 File Changes

### New Files
```
src/types/household-v2.ts
src/actions/household-v2.ts
src/hooks/use-household-realtime.ts
src/components/household/CookingScheduleEditor.tsx
src/components/household/MemberDietaryProfile.tsx
src/components/household/HouseholdActivityFeed.tsx
src/components/household/WhoCookingTonight.tsx
src/components/household/DietaryWarningBadge.tsx
supabase/migrations/XXXXXX_add_cooking_schedule.sql
supabase/migrations/XXXXXX_add_member_dietary_profiles.sql
supabase/migrations/XXXXXX_add_household_activities.sql
```

### Modified Files
```
src/app/(app)/app/settings/household/page.tsx (add new sections)
src/app/(app)/app/plan/page.tsx (add who's cooking indicator)
src/components/meal-plan/MealPlanGrid.tsx (add dietary warnings)
src/components/recipes/RecipeCard.tsx (add dietary badges)
src/contexts/settings-context.tsx (add household realtime)
src/lib/supabase/database.types.ts (regenerate)
```

---

## 1.5 Success Criteria

- [ ] Two household members can see same meal plan in real-time
- [ ] Cooking schedule shows "Your turn tonight!" correctly
- [ ] Dietary restrictions aggregate across all members
- [ ] Recipe suggestions exclude household allergens
- [ ] Activity feed shows recent household actions
- [ ] Changes sync within 2 seconds across devices
- [ ] Works offline with sync on reconnect

---

# Feature 2: Meal Prep Specific Workflows

## 2.1 Overview

**Problem**: Existing apps focus on "what to eat" not "how to prep efficiently". No platform owns meal prep.

**Solution**: Purpose-built workflows for batch cooking, container planning, and prep optimization.

**Who**: Busy professionals, fitness enthusiasts, budget-conscious families who batch cook.

### Key Functionality
1. 🆕 Batch cooking mode (cook multiple recipes at once)
2. 🆕 Prep Day vs Eat Day distinction
3. 🆕 Container/portion planning
4. 🆕 Ingredient overlap optimization
5. 🆕 Reheating instructions per recipe
6. 🆕 Week variety scoring
7. 🆕 Prep timeline optimizer

---

## 2.2 Technical Design

### Data Flow
```
┌─────────────────┐
│   Week View     │
│  (Eat Days)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Prep Day      │────►│  Batch Cooking  │
│   Planner       │     │     Mode        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Container     │     │   Prep Timeline │
│   Calculator    │     │   (Gantt-like)  │
└─────────────────┘     └─────────────────┘
```

### Database Schema Changes

```sql
-- Migration: add_meal_prep_features.sql

-- Extend recipes with meal prep data
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_data JSONB DEFAULT '{}';
-- prep_data structure:
-- {
--   "reheating_instructions": "Microwave 2-3 min, stir halfway",
--   "storage_instructions": "Refrigerate up to 5 days, freeze up to 3 months",
--   "container_type": "medium",
--   "freezer_friendly": true,
--   "prep_notes": "Can prep vegetables day before"
-- }

-- Meal prep sessions (a prep day event)
CREATE TABLE IF NOT EXISTS prep_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  prep_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes included in a prep session
CREATE TABLE IF NOT EXISTS prep_session_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prep_session_id UUID NOT NULL REFERENCES prep_sessions(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  portions_to_prep INTEGER NOT NULL DEFAULT 4,
  container_count INTEGER,
  container_type TEXT, -- 'small', 'medium', 'large', 'custom'
  prep_order INTEGER, -- Order to prep recipes
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(prep_session_id, recipe_id)
);

-- Container inventory (optional - for advanced users)
CREATE TABLE IF NOT EXISTS container_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  container_type TEXT NOT NULL, -- 'small', 'medium', 'large', 'custom'
  capacity_oz INTEGER, -- Optional capacity
  quantity_owned INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(household_id, container_type)
);

-- RLS Policies
ALTER TABLE prep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_session_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage prep sessions"
  ON prep_sessions FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can manage prep session recipes"
  ON prep_session_recipes FOR ALL
  USING (
    prep_session_id IN (
      SELECT id FROM prep_sessions WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Household members can manage containers"
  ON container_inventory FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
```

### New TypeScript Types

```typescript
// types/meal-prep.ts

export interface RecipePrepData {
  reheating_instructions?: string;
  storage_instructions?: string;
  container_type?: 'small' | 'medium' | 'large' | 'custom';
  freezer_friendly?: boolean;
  prep_notes?: string;
  active_prep_time_minutes?: number; // Hands-on time
  passive_time_minutes?: number; // Oven/simmer time
}

export interface PrepSession {
  id: string;
  household_id: string;
  meal_plan_id: string | null;
  prep_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrepSessionRecipe {
  id: string;
  prep_session_id: string;
  recipe_id: string;
  portions_to_prep: number;
  container_count: number | null;
  container_type: string | null;
  prep_order: number | null;
  is_completed: boolean;
  notes: string | null;
  // Joined data
  recipe?: Recipe;
}

export interface PrepSessionWithRecipes extends PrepSession {
  recipes: PrepSessionRecipe[];
  total_prep_time: number;
  total_containers: number;
}

export interface ContainerInventory {
  id: string;
  household_id: string;
  container_type: string;
  capacity_oz: number | null;
  quantity_owned: number;
  notes: string | null;
}

export interface IngredientOverlap {
  ingredient: string;
  recipes: string[]; // Recipe IDs
  total_quantity: number;
  unit: string;
}

export interface PrepTimeline {
  start_time: Date;
  end_time: Date;
  tasks: PrepTimelineTask[];
}

export interface PrepTimelineTask {
  recipe_id: string;
  recipe_title: string;
  task_type: 'active' | 'passive';
  description: string;
  start_minute: number;
  duration_minutes: number;
  can_multitask: boolean;
}

export interface WeekVarietyScore {
  score: number; // 0-100
  protein_variety: number;
  cuisine_variety: number;
  cooking_method_variety: number;
  issues: string[]; // "Chicken 4 times this week"
}
```

### Server Actions

```typescript
// actions/meal-prep.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Create a prep session from meal plan
export async function createPrepSession(
  householdId: string,
  mealPlanId: string,
  prepDate: string,
  recipeIds: string[]
) {
  const supabase = await createClient();

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('prep_sessions')
    .insert({
      household_id: householdId,
      meal_plan_id: mealPlanId,
      prep_date: prepDate
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Add recipes
  const recipeInserts = recipeIds.map((recipeId, index) => ({
    prep_session_id: session.id,
    recipe_id: recipeId,
    prep_order: index + 1
  }));

  const { error: recipesError } = await supabase
    .from('prep_session_recipes')
    .insert(recipeInserts);

  if (recipesError) throw recipesError;

  revalidatePath('/app/prep');
  return session;
}

// Get prep session with recipes
export async function getPrepSession(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prep_sessions')
    .select(`
      *,
      prep_session_recipes(
        *,
        recipes(*)
      )
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

// Calculate ingredient overlap for selected recipes
export async function calculateIngredientOverlap(recipeIds: string[]) {
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, ingredients')
    .in('id', recipeIds);

  if (error) throw error;

  const ingredientMap = new Map<string, {
    ingredient: string;
    recipes: string[];
    quantities: { amount: number; unit: string }[];
  }>();

  recipes?.forEach(recipe => {
    recipe.ingredients?.forEach((ing: any) => {
      const key = ing.name.toLowerCase();
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, {
          ingredient: ing.name,
          recipes: [],
          quantities: []
        });
      }
      const entry = ingredientMap.get(key)!;
      entry.recipes.push(recipe.id);
      entry.quantities.push({ amount: ing.amount || 0, unit: ing.unit || '' });
    });
  });

  // Filter to overlapping ingredients (used in 2+ recipes)
  const overlaps = Array.from(ingredientMap.values())
    .filter(entry => entry.recipes.length > 1)
    .map(entry => ({
      ingredient: entry.ingredient,
      recipes: entry.recipes,
      total_quantity: entry.quantities.reduce((sum, q) => sum + q.amount, 0),
      unit: entry.quantities[0]?.unit || ''
    }));

  return overlaps;
}

// Calculate week variety score
export async function calculateWeekVariety(mealPlanId: string) {
  const supabase = await createClient();

  const { data: assignments, error } = await supabase
    .from('meal_assignments')
    .select(`
      *,
      recipes(protein_type, category, tags)
    `)
    .eq('meal_plan_id', mealPlanId);

  if (error) throw error;

  const proteinCounts = new Map<string, number>();
  const cuisineCounts = new Map<string, number>();
  const issues: string[] = [];

  assignments?.forEach(a => {
    const protein = a.recipes?.protein_type;
    const category = a.recipes?.category;

    if (protein) {
      proteinCounts.set(protein, (proteinCounts.get(protein) || 0) + 1);
    }
    if (category) {
      cuisineCounts.set(category, (cuisineCounts.get(category) || 0) + 1);
    }
  });

  // Check for repetition issues
  proteinCounts.forEach((count, protein) => {
    if (count >= 4) {
      issues.push(`${protein} appears ${count} times this week`);
    }
  });

  // Calculate variety scores (higher = more variety)
  const proteinVariety = Math.min(100, (proteinCounts.size / 5) * 100);
  const cuisineVariety = Math.min(100, (cuisineCounts.size / 5) * 100);

  const score = Math.round((proteinVariety + cuisineVariety) / 2);

  return {
    score,
    protein_variety: proteinVariety,
    cuisine_variety: cuisineVariety,
    cooking_method_variety: 50, // TODO: implement
    issues
  };
}

// Generate prep timeline (Gantt-like)
export async function generatePrepTimeline(sessionId: string) {
  const session = await getPrepSession(sessionId);
  if (!session) throw new Error('Session not found');

  const tasks: PrepTimelineTask[] = [];
  let currentMinute = 0;

  // Sort recipes by prep order
  const sortedRecipes = [...session.prep_session_recipes]
    .sort((a, b) => (a.prep_order || 0) - (b.prep_order || 0));

  sortedRecipes.forEach(pr => {
    const recipe = pr.recipe;
    if (!recipe) return;

    const prepData = recipe.prep_data as RecipePrepData || {};
    const activeTime = prepData.active_prep_time_minutes || recipe.prep_time || 15;
    const passiveTime = prepData.passive_time_minutes || recipe.cook_time || 0;

    // Active prep task
    tasks.push({
      recipe_id: recipe.id,
      recipe_title: recipe.title,
      task_type: 'active',
      description: `Prep ${recipe.title}`,
      start_minute: currentMinute,
      duration_minutes: activeTime,
      can_multitask: false
    });

    currentMinute += activeTime;

    // Passive cooking task (can overlap with next active task)
    if (passiveTime > 0) {
      tasks.push({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        task_type: 'passive',
        description: `Cook ${recipe.title} (passive)`,
        start_minute: currentMinute,
        duration_minutes: passiveTime,
        can_multitask: true
      });
    }
  });

  return {
    start_time: new Date(),
    end_time: new Date(Date.now() + currentMinute * 60 * 1000),
    tasks
  };
}

// Update recipe prep data
export async function updateRecipePrepData(
  recipeId: string,
  prepData: Partial<RecipePrepData>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('recipes')
    .update({
      prep_data: prepData,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipeId);

  if (error) throw error;
  revalidatePath(`/app/recipes/${recipeId}`);
}
```

---

## 2.3 Implementation Steps

### Phase 2A: Database & Types (Day 1-2)
- [ ] Create migration `add_meal_prep_features.sql`
- [ ] Add `prep_data` column to recipes
- [ ] Create `prep_sessions` table
- [ ] Create `prep_session_recipes` table
- [ ] Create `container_inventory` table
- [ ] Add TypeScript types `types/meal-prep.ts`
- [ ] Run migrations, verify RLS

### Phase 2B: Server Actions (Day 3-5)
- [ ] Create `actions/meal-prep.ts`
- [ ] Add `createPrepSession`
- [ ] Add `getPrepSession`
- [ ] Add `calculateIngredientOverlap`
- [ ] Add `calculateWeekVariety`
- [ ] Add `generatePrepTimeline`
- [ ] Add `updateRecipePrepData`

### Phase 2C: Prep Day Planner UI (Day 6-9)
- [ ] Create `/app/prep` route
- [ ] Create `PrepDayPlanner` page component
- [ ] Create `PrepSessionCard` component
- [ ] Create `RecipeSelectionForPrep` component
- [ ] Create `IngredientOverlapView` component
- [ ] Create `ContainerCalculator` component

### Phase 2D: Batch Cooking Mode (Day 10-13)
- [ ] Create `BatchCookingMode` component (fullscreen)
- [ ] Create `PrepTimeline` Gantt-like view
- [ ] Create `ActiveTaskIndicator` component
- [ ] Create `RecipeStepTracker` for each recipe
- [ ] Add timer integration
- [ ] Add voice announcements (optional)

### Phase 2E: Week Variety & Polish (Day 14-17)
- [ ] Create `WeekVarietyScore` component
- [ ] Add variety warnings to meal planner
- [ ] Create `ReheatingInstructions` display
- [ ] Create `StorageInstructions` display
- [ ] Add prep data to recipe edit form
- [ ] Integration testing
- [ ] Loading states and error handling

---

## 2.4 File Changes

### New Files
```
src/types/meal-prep.ts
src/actions/meal-prep.ts
src/app/(app)/app/prep/page.tsx
src/app/(app)/app/prep/[sessionId]/page.tsx
src/components/meal-prep/PrepDayPlanner.tsx
src/components/meal-prep/PrepSessionCard.tsx
src/components/meal-prep/IngredientOverlapView.tsx
src/components/meal-prep/ContainerCalculator.tsx
src/components/meal-prep/BatchCookingMode.tsx
src/components/meal-prep/PrepTimeline.tsx
src/components/meal-prep/WeekVarietyScore.tsx
src/components/meal-prep/ReheatingInstructions.tsx
src/components/recipes/PrepDataEditor.tsx
supabase/migrations/XXXXXX_add_meal_prep_features.sql
```

### Modified Files
```
src/app/(app)/app/layout.tsx (add Prep nav item)
src/components/navigation/NavigationBar.tsx (add Prep link)
src/components/recipes/RecipeForm.tsx (add prep data fields)
src/components/recipes/RecipeDetail.tsx (show prep data)
src/app/(app)/app/plan/page.tsx (add variety score)
```

---

## 2.5 Success Criteria

- [ ] Can create prep session from meal plan
- [ ] Ingredient overlap calculated correctly
- [ ] Container count estimation works
- [ ] Batch cooking mode shows timeline
- [ ] Week variety score displays issues
- [ ] Reheating instructions show on recipe
- [ ] Prep timeline is helpful (user testing)

---

# Feature 3: Accessibility Excellence

## 3.1 Overview

**Problem**: Only 35% of apps meet basic accessibility. Recipe apps especially bad for cooking scenarios (hands dirty, poor lighting).

**Solution**: WCAG AA compliance (target AAA), voice navigation, high contrast mode, screen reader support.

**Who**: Elderly users, visually impaired, motor impairments, and everyone cooking with messy hands.

### Key Functionality
1. 🆕 WCAG AA compliance audit & fixes
2. 🆕 Large text mode
3. 🆕 High contrast mode
4. 🆕 Full keyboard navigation
5. 🆕 Screen reader optimization
6. 🆕 Voice navigation (hands-free cooking)
7. 🆕 Reduced motion option

---

## 3.2 Technical Design

### Accessibility State in Settings

```typescript
// types/accessibility.ts

export interface AccessibilitySettings {
  // Visual
  font_scale: number; // 1.0, 1.25, 1.5, 2.0
  high_contrast: boolean;
  reduced_motion: boolean;

  // Screen reader
  screen_reader_mode: boolean;
  announce_changes: boolean;

  // Voice
  voice_navigation_enabled: boolean;
  voice_commands_language: string;

  // Keyboard
  focus_visible_always: boolean;
  skip_links_enabled: boolean;
}

export type VoiceCommand =
  | 'next_step'
  | 'previous_step'
  | 'repeat'
  | 'read_ingredients'
  | 'start_timer'
  | 'stop_timer'
  | 'go_home'
  | 'scroll_down'
  | 'scroll_up';
```

### CSS Variables for Accessibility

```css
/* globals.css additions */

:root {
  --font-scale: 1;
  --min-touch-target: 44px;
  --focus-ring-width: 3px;
  --focus-ring-color: hsl(var(--ring));
}

/* Font scaling */
[data-font-scale="1.25"] { --font-scale: 1.25; }
[data-font-scale="1.5"] { --font-scale: 1.5; }
[data-font-scale="2"] { --font-scale: 2; }

html {
  font-size: calc(16px * var(--font-scale));
}

/* High contrast mode */
[data-high-contrast="true"] {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 60 100% 50%;
  --primary-foreground: 0 0% 0%;
  --border: 0 0% 100%;

  * {
    border-color: hsl(var(--border)) !important;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

[data-reduced-motion="true"] {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible always */
[data-focus-visible="always"] *:focus {
  outline: var(--focus-ring-width) solid var(--focus-ring-color) !important;
  outline-offset: 2px !important;
}

/* Minimum touch targets */
button, a, input, select, [role="button"] {
  min-height: var(--min-touch-target);
  min-width: var(--min-touch-target);
}
```

### Voice Navigation Hook

```typescript
// hooks/use-voice-navigation.ts

import { useEffect, useCallback, useState } from 'react';

interface VoiceNavigationOptions {
  onCommand: (command: VoiceCommand) => void;
  enabled: boolean;
  language?: string;
}

export function useVoiceNavigation({
  onCommand,
  enabled,
  language = 'en-US'
}: VoiceNavigationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.toLowerCase().trim();
      setTranscript(text);

      // Map speech to commands
      const commandMap: Record<string, VoiceCommand> = {
        'next': 'next_step',
        'next step': 'next_step',
        'previous': 'previous_step',
        'go back': 'previous_step',
        'repeat': 'repeat',
        'say again': 'repeat',
        'ingredients': 'read_ingredients',
        'read ingredients': 'read_ingredients',
        'start timer': 'start_timer',
        'stop timer': 'stop_timer',
        'home': 'go_home',
        'scroll down': 'scroll_down',
        'scroll up': 'scroll_up',
      };

      const command = commandMap[text];
      if (command) {
        onCommand(command);
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Restart if still enabled
      if (enabled) {
        setTimeout(() => recognition.start(), 100);
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [enabled, language, onCommand]);

  return { isListening, transcript };
}
```

### Skip Links Component

```typescript
// components/accessibility/SkipLinks.tsx

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-2 left-2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded focus:not-sr-only"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute top-2 left-40 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded focus:not-sr-only"
      >
        Skip to navigation
      </a>
    </div>
  );
}
```

### Screen Reader Announcer

```typescript
// components/accessibility/Announcer.tsx

import { useEffect, useRef } from 'react';

interface AnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export function Announcer({ message, politeness = 'polite' }: AnnouncerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      ref.current.textContent = '';
      // Force reflow
      void ref.current.offsetHeight;
      ref.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
```

---

## 3.3 Implementation Steps

### Phase 3A: Audit & Foundation (Day 1-3)
- [ ] Run axe-core audit on all pages
- [ ] Document all WCAG violations
- [ ] Add `AccessibilitySettings` type
- [ ] Create accessibility settings UI section
- [ ] Add CSS variables for accessibility
- [ ] Add data attributes to root element

### Phase 3B: Visual Accessibility (Day 4-6)
- [ ] Implement font scaling (1x, 1.25x, 1.5x, 2x)
- [ ] Implement high contrast mode
- [ ] Implement reduced motion
- [ ] Fix all color contrast issues (4.5:1 minimum)
- [ ] Add focus indicators to all interactive elements
- [ ] Ensure minimum 44x44px touch targets

### Phase 3C: Keyboard Navigation (Day 7-9)
- [ ] Add `SkipLinks` component to layout
- [ ] Ensure logical tab order on all pages
- [ ] Add keyboard shortcuts for common actions
- [ ] Test all forms with keyboard only
- [ ] Add focus trapping for modals/dialogs
- [ ] Document keyboard shortcuts

### Phase 3D: Screen Reader Support (Day 10-12)
- [ ] Add proper ARIA labels to all components
- [ ] Add live regions for dynamic content
- [ ] Create `Announcer` component
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Fix any announced content issues

### Phase 3E: Voice Navigation (Day 13-15)
- [ ] Create `useVoiceNavigation` hook
- [ ] Add voice commands to Cook Mode
- [ ] Test speech recognition accuracy
- [ ] Add visual feedback for voice commands
- [ ] Document supported voice commands

### Phase 3F: Testing & Polish (Day 16-18)
- [ ] Re-run axe-core audit (should pass)
- [ ] Manual testing with assistive tech
- [ ] Add accessibility statement page
- [ ] Update documentation
- [ ] Test on mobile devices

---

## 3.4 File Changes

### New Files
```
src/types/accessibility.ts
src/hooks/use-voice-navigation.ts
src/hooks/use-announcer.ts
src/components/accessibility/SkipLinks.tsx
src/components/accessibility/Announcer.tsx
src/components/accessibility/AccessibilitySettings.tsx
src/components/accessibility/KeyboardShortcutsDialog.tsx
src/app/(app)/app/settings/accessibility/page.tsx
src/app/(marketing)/accessibility/page.tsx (statement)
```

### Modified Files
```
src/app/layout.tsx (add SkipLinks, data attributes)
src/globals.css (accessibility CSS variables)
src/components/ui/*.tsx (add ARIA labels, fix contrast)
src/components/recipes/CookMode.tsx (add voice nav)
src/contexts/settings-context.tsx (add accessibility state)
src/types/settings.ts (extend with accessibility)
```

---

## 3.5 Success Criteria

- [ ] axe-core audit passes with 0 violations
- [ ] All pages navigable by keyboard only
- [ ] VoiceOver reads all content correctly
- [ ] High contrast mode provides 7:1 contrast
- [ ] Font scaling works without layout breaks
- [ ] Voice commands work in Cook Mode
- [ ] Reduced motion eliminates all animations

---

# Feature 4: Privacy-First Design

## 4.1 Overview

**Problem**: Research shows privacy concerns limit social adoption. Users worry about data exposure.

**Solution**: Make privacy the default. All sharing is opt-in. Transparent data practices.

**Who**: Everyone, but especially privacy-conscious users who avoid social features due to data concerns.

### Key Functionality
1. 🆕 All social features opt-in by default
2. 🆕 Granular sharing controls
3. 🆕 Clear data collection explanation
4. 🆕 Data export (GDPR-style)
5. 🆕 Complete account deletion
6. 🆕 Activity visibility controls

---

## 4.2 Technical Design

### Privacy Settings Type

```typescript
// types/privacy.ts

export interface PrivacySettings {
  // Profile visibility
  profile_visibility: 'private' | 'household' | 'friends' | 'public';
  show_real_name: boolean;
  show_avatar: boolean;

  // Recipe sharing defaults
  default_recipe_visibility: 'private' | 'household' | 'public';
  allow_recipe_forking: boolean;

  // Activity visibility
  show_cooking_activity: boolean;
  show_meal_plans: boolean;
  show_favorites: boolean;

  // Data collection
  allow_analytics: boolean;
  allow_personalization: boolean;
  allow_ai_training: boolean; // Always false by default

  // Communication
  email_from_platform: boolean;
  email_from_partners: boolean;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  download_url: string | null;
  expires_at: string | null;
}

export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  scheduled_deletion_at: string; // 30 days grace period
  status: 'pending' | 'cancelled' | 'completed';
  reason: string | null;
}
```

### Database Schema

```sql
-- Migration: add_privacy_features.sql

-- Privacy settings (extend user_settings or create new)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{
  "profile_visibility": "private",
  "show_real_name": false,
  "show_avatar": true,
  "default_recipe_visibility": "private",
  "allow_recipe_forking": false,
  "show_cooking_activity": false,
  "show_meal_plans": false,
  "show_favorites": false,
  "allow_analytics": true,
  "allow_personalization": true,
  "allow_ai_training": false,
  "email_from_platform": true,
  "email_from_partners": false
}';

-- Data export requests
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'expired')),
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account deletion requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their export requests"
  ON data_export_requests FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their deletion requests"
  ON account_deletion_requests FOR ALL
  USING (user_id = auth.uid());
```

### Server Actions

```typescript
// actions/privacy.ts

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Update privacy settings
export async function updatePrivacySettings(settings: Partial<PrivacySettings>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Get current settings
  const { data: current } = await supabase
    .from('user_settings')
    .select('privacy')
    .eq('user_id', user.id)
    .single();

  const newPrivacy = {
    ...(current?.privacy || {}),
    ...settings
  };

  const { error } = await supabase
    .from('user_settings')
    .update({ privacy: newPrivacy })
    .eq('user_id', user.id);

  if (error) throw error;
  revalidatePath('/app/settings/privacy');
}

// Request data export
export async function requestDataExport() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check for existing pending request
  const { data: existing } = await supabase
    .from('data_export_requests')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existing) {
    throw new Error('You already have a pending export request');
  }

  const { data, error } = await supabase
    .from('data_export_requests')
    .insert({ user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  // Trigger background job to generate export
  // In production, this would be a queue job
  // For now, we'll process synchronously
  await generateDataExport(data.id);

  return data;
}

// Generate data export (background job)
async function generateDataExport(requestId: string) {
  const adminClient = createAdminClient();

  // Get request
  const { data: request } = await adminClient
    .from('data_export_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) throw new Error('Request not found');

  // Update status
  await adminClient
    .from('data_export_requests')
    .update({ status: 'processing' })
    .eq('id', requestId);

  // Gather all user data
  const userId = request.user_id;

  const [
    profile,
    settings,
    recipes,
    mealPlans,
    shoppingLists,
    cookingHistory,
    favorites
  ] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', userId).single(),
    adminClient.from('user_settings').select('*').eq('user_id', userId).single(),
    adminClient.from('recipes').select('*').eq('user_id', userId),
    adminClient.from('meal_plans').select('*, meal_assignments(*)').eq('user_id', userId),
    adminClient.from('shopping_lists').select('*, shopping_list_items(*)').eq('user_id', userId),
    adminClient.from('cooking_history').select('*').eq('user_id', userId),
    adminClient.from('favorites').select('*, recipes(title)').eq('user_id', userId)
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    settings: settings.data,
    recipes: recipes.data,
    meal_plans: mealPlans.data,
    shopping_lists: shoppingLists.data,
    cooking_history: cookingHistory.data,
    favorites: favorites.data
  };

  // In production: Upload to storage, generate signed URL
  // For now: Store as JSON in the request
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Upload to storage
  const { data: uploadData, error: uploadError } = await adminClient
    .storage
    .from('exports')
    .upload(`${userId}/${requestId}.json`, blob, {
      contentType: 'application/json'
    });

  if (uploadError) throw uploadError;

  // Generate signed URL (expires in 7 days)
  const { data: urlData } = await adminClient
    .storage
    .from('exports')
    .createSignedUrl(`${userId}/${requestId}.json`, 60 * 60 * 24 * 7);

  // Update request
  await adminClient
    .from('data_export_requests')
    .update({
      status: 'ready',
      download_url: urlData?.signedUrl,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', requestId);
}

// Request account deletion
export async function requestAccountDeletion(reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Schedule deletion for 30 days from now
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 30);

  const { data, error } = await supabase
    .from('account_deletion_requests')
    .insert({
      user_id: user.id,
      scheduled_deletion_at: scheduledDate.toISOString(),
      reason
    })
    .select()
    .single();

  if (error) throw error;

  // Send confirmation email
  // await sendDeletionConfirmationEmail(user.email, scheduledDate);

  return data;
}

// Cancel account deletion
export async function cancelAccountDeletion(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('account_deletion_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('user_id', user.id)
    .eq('status', 'pending');

  if (error) throw error;
  revalidatePath('/app/settings/data');
}

// Get user's data summary
export async function getDataSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const [recipes, mealPlans, cookingHistory] = await Promise.all([
    supabase.from('recipes').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('meal_plans').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('cooking_history').select('id', { count: 'exact' }).eq('user_id', user.id)
  ]);

  return {
    recipes: recipes.count || 0,
    meal_plans: mealPlans.count || 0,
    cooking_sessions: cookingHistory.count || 0,
    account_created: user.created_at
  };
}
```

---

## 4.3 Implementation Steps

### Phase 4A: Database & Types (Day 1-2)
- [ ] Create migration `add_privacy_features.sql`
- [ ] Add `privacy` column to user_settings
- [ ] Create `data_export_requests` table
- [ ] Create `account_deletion_requests` table
- [ ] Add TypeScript types `types/privacy.ts`
- [ ] Run migrations

### Phase 4B: Server Actions (Day 3-4)
- [ ] Create `actions/privacy.ts`
- [ ] Add `updatePrivacySettings`
- [ ] Add `requestDataExport`
- [ ] Add `generateDataExport`
- [ ] Add `requestAccountDeletion`
- [ ] Add `cancelAccountDeletion`
- [ ] Add `getDataSummary`

### Phase 4C: Privacy Settings UI (Day 5-7)
- [ ] Create `/app/settings/privacy/page.tsx`
- [ ] Create `ProfileVisibilitySettings` component
- [ ] Create `DataCollectionSettings` component
- [ ] Create `CommunicationPreferences` component
- [ ] Create privacy onboarding flow for new users

### Phase 4D: Data Management UI (Day 8-10)
- [ ] Create `/app/settings/data/page.tsx`
- [ ] Create `DataSummary` component
- [ ] Create `DataExportCard` component
- [ ] Create `AccountDeletionCard` component
- [ ] Create confirmation dialogs

### Phase 4E: Privacy Enforcement (Day 11-13)
- [ ] Update recipe queries to respect visibility
- [ ] Update profile queries to respect privacy
- [ ] Add privacy checks to all public endpoints
- [ ] Test all sharing paths respect settings
- [ ] Add privacy badges to UI

### Phase 4F: Documentation & Legal (Day 14)
- [ ] Create `/privacy-policy` page
- [ ] Create `/terms` page
- [ ] Add data handling documentation
- [ ] Cookie consent banner (if needed)

---

## 4.4 File Changes

### New Files
```
src/types/privacy.ts
src/actions/privacy.ts
src/app/(app)/app/settings/privacy/page.tsx
src/app/(app)/app/settings/data/page.tsx
src/components/privacy/ProfileVisibilitySettings.tsx
src/components/privacy/DataCollectionSettings.tsx
src/components/privacy/DataSummary.tsx
src/components/privacy/DataExportCard.tsx
src/components/privacy/AccountDeletionCard.tsx
src/components/privacy/PrivacyBadge.tsx
src/app/(marketing)/privacy-policy/page.tsx
src/app/(marketing)/terms/page.tsx
supabase/migrations/XXXXXX_add_privacy_features.sql
```

### Modified Files
```
src/app/(app)/app/settings/layout.tsx (add Privacy nav)
src/actions/recipes.ts (add privacy checks)
src/actions/social.ts (add privacy checks)
src/components/recipes/RecipeCard.tsx (add privacy badge)
src/components/profile/ProfileHeader.tsx (respect privacy)
```

---

## 4.5 Success Criteria

- [ ] New users have private profile by default
- [ ] All sharing is explicitly opt-in
- [ ] Data export generates within 24 hours
- [ ] Account deletion has 30-day grace period
- [ ] Privacy settings are clear and understandable
- [ ] Public queries respect privacy settings
- [ ] Cookie consent implemented if required

---

# Summary: P0 Implementation Timeline

## Overview

| Feature | Effort | Dependencies |
|---------|--------|--------------|
| 1. Household Sharing | 2 weeks | Auth, Supabase Realtime |
| 2. Meal Prep Workflows | 2.5 weeks | Recipe system |
| 3. Accessibility | 2.5 weeks | UI components |
| 4. Privacy-First | 2 weeks | Settings system |

**Total**: ~9 weeks sequential, ~6 weeks with parallelization

## Suggested Parallel Execution

```
Week 1-2:  [Household DB/Actions] + [Accessibility Audit]
Week 3-4:  [Household UI] + [Accessibility Fixes]
Week 5-6:  [Meal Prep DB/Actions] + [Privacy DB/Actions]
Week 7-8:  [Meal Prep UI] + [Privacy UI]
Week 9:    [Integration Testing] + [Polish]
```

## Risk Mitigation

1. **Supabase Realtime complexity**: Test early, have fallback polling
2. **Voice recognition browser support**: Graceful degradation
3. **Data export scale**: Use background jobs, set expectations
4. **Accessibility regression**: Add axe-core to CI

---

*Generated from Social Recipe Sharing Research - December 2024*
