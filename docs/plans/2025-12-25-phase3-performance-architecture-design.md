# Phase 3 Performance Architecture Design

**Date**: 2025-12-25
**Status**: Approved
**Goal**: Eliminate general UI sluggishness through architectural improvements

---

## Problem Statement

The app experiences general sluggishness across multiple areas due to:
1. Sequential database queries after initial parallel batch
2. Heavy client-side filtering (smart folder evaluation on every render)
3. No caching layer — every page load hits the database

---

## Solution Overview

Three optimizations in priority order:

| Priority | Optimization | Expected Impact |
|----------|--------------|-----------------|
| 1 | Fix sequential waterfall | -200-400ms page load |
| 2 | Server-side smart folder cache | Instant filtering (vs 50-100ms) |
| 3 | Redis caching layer | Sub-10ms for cached reads |

---

## Priority 1: Fix Sequential Waterfall

### Current State

In `src/app/(app)/app/recipes/page.tsx`:

```
Promise.all([...10 queries...])  ← Parallel (good)
↓
await supabase.from("recipe_folder_members")...  ← Sequential (+100ms)
↓
await getBulkRecipeNutrition(recipeIds)  ← Sequential (+150ms)
↓
await supabase.from("cooking_history")...  ← Sequential (+100ms)
```

### Proposed Change

Move folder memberships and cooking history INTO the Promise.all. Keep nutrition as single sequential call (depends on recipe IDs).

```tsx
const [
  profileResult,
  recipesResult,
  favoritesResult,
  settingsResult,
  cookCountsResult,
  customBadgesResult,
  foldersResult,
  systemSmartFoldersResult,
  userSmartFoldersResult,
  cookingHistoryResult,
  // NEW: Add these to parallel batch
  folderMembershipsResult,
  recentHistoryResult,
] = await Promise.all([
  // ...existing 10 queries...
  // Folder memberships (no dependency)
  supabase.from("recipe_folder_members")
    .select("folder_id, recipe_id"),
  // Recent cooking history (no dependency)
  supabase.from("cooking_history")
    .select("recipe_id")
    .gte("cooked_at", thirtyDaysAgo.toISOString()),
]);

// Only nutrition remains sequential (needs recipeIds)
const recipeIds = recipes.map((r) => r.id);
const nutritionResult = await getBulkRecipeNutrition(recipeIds);
```

### Expected Result

- Before: 10 parallel + 3 sequential = ~450ms
- After: 12 parallel + 1 sequential = ~200ms
- **Savings: ~250ms per page load**

---

## Priority 2: Server-Side Smart Folder Cache

### Current State

Client component runs `filterRecipesBySmartFolder` on every render:
- Parses time strings ("30 min" → 30)
- Evaluates filter conditions per recipe
- Runs for each smart folder interaction

Location: `src/components/recipes/recipes-page-client.tsx` lines 106-139

### Proposed Change

Create a cache table that precomputes smart folder memberships.

#### Database Schema

```sql
-- Migration: create_smart_folder_recipe_cache
CREATE TABLE smart_folder_recipe_cache (
  smart_folder_id UUID NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (smart_folder_id, recipe_id)
);

-- Fast lookups by folder
CREATE INDEX idx_smart_folder_cache_folder
  ON smart_folder_recipe_cache(smart_folder_id);

-- Fast invalidation by recipe
CREATE INDEX idx_smart_folder_cache_recipe
  ON smart_folder_recipe_cache(recipe_id);

-- Household scoping
CREATE INDEX idx_smart_folder_cache_household
  ON smart_folder_recipe_cache(household_id);
```

#### Cache Invalidation Strategy

| Trigger | Action |
|---------|--------|
| Recipe created | Evaluate all smart folders for household |
| Recipe updated | Evaluate all smart folders for household |
| Recipe deleted | Remove from cache (CASCADE handles this) |
| Smart folder criteria changed | Re-evaluate that folder only |
| Cooking history added | Re-evaluate time-based folders |

#### Implementation Approach

1. Create Edge Function `rebuild-smart-folder-cache` that:
   - Takes `household_id` and optional `folder_id`
   - Fetches recipes and evaluates filter criteria
   - Upserts results into cache table

2. Call this function:
   - On recipe mutations (via database trigger or action)
   - On smart folder save
   - On cooking history insert

3. Update client to use cache instead of client-side filtering:
   ```tsx
   // Before: Client-side filtering
   const folderRecipeIds = filterRecipesBySmartFolder(recipes, criteria, context);

   // After: Simple lookup from precomputed cache
   const folderRecipeIds = smartFolderCache[folderId] || [];
   ```

### Expected Result

- Before: 50-100ms client-side computation per smart folder
- After: 0ms (simple array lookup)
- **Perceived improvement: Instant folder switching**

---

## Priority 3: Redis Caching Layer

### Setup

Use Upstash Redis (free tier available, edge-compatible).

```bash
npm install @upstash/redis
```

Environment variables:
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Cache Utility

```tsx
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  // Fetch fresh
  const fresh = await fetcher();

  // Store with TTL
  await redis.set(key, fresh, { ex: ttlSeconds });

  return fresh;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### Caching Strategy

| Data | Cache Key | TTL | Invalidation |
|------|-----------|-----|--------------|
| Recipes list | `recipes:{householdId}` | 5 min | Recipe CRUD |
| Recipe detail | `recipe:{recipeId}` | 5 min | Recipe update |
| Nutrition data | `nutrition:{householdId}` | 10 min | Nutrition recalc |
| User settings | `settings:{userId}` | 10 min | Settings change |
| Folder structure | `folders:{householdId}` | 5 min | Folder CRUD |
| Smart folder cache | `smartcache:{householdId}` | 5 min | Recipe/history change |

### Integration Example

```tsx
// app/actions/recipes.ts
import { getCached, invalidateCache } from '@/lib/cache/redis';

export async function getRecipes() {
  const { householdId } = await getCachedHouseholdId();

  return getCached(
    `recipes:${householdId}`,
    async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('household_id', householdId);
      return { data, error };
    },
    300 // 5 minutes
  );
}

export async function createRecipe(formData: RecipeFormData) {
  // ... create logic ...

  // Invalidate cache
  await invalidateCache(`recipes:${householdId}`);
  await invalidateCache(`smartcache:${householdId}`);

  return result;
}
```

### Expected Result

- Before: 100-300ms database query per request
- After: 5-10ms cache hit
- **95%+ of reads served from cache**

---

## Implementation Order

### Phase 3.1: Fix Waterfall (1-2 hours)
- [ ] Restructure Promise.all in recipes/page.tsx
- [ ] Test page load timing improvement
- [ ] Apply same pattern to other pages (plan, shop, etc.)

### Phase 3.2: Smart Folder Cache (4-6 hours)
- [ ] Create migration for cache table
- [ ] Create rebuild function (can be server action initially)
- [ ] Add invalidation calls to recipe/folder/history mutations
- [ ] Update client to use cached data
- [ ] Remove client-side filter evaluation code

### Phase 3.3: Redis Caching (3-4 hours)
- [ ] Set up Upstash Redis account
- [ ] Create cache utility module
- [ ] Wrap high-traffic queries with caching
- [ ] Add invalidation to all mutations
- [ ] Monitor cache hit rates

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Recipes page load | ~800ms | <300ms |
| Smart folder switch | 50-100ms | <10ms |
| Repeated page loads | ~800ms | <100ms |
| Lighthouse Performance | ~70 | 90+ |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Cache staleness | Short TTLs + aggressive invalidation |
| Redis downtime | Fallback to direct DB query |
| Smart folder cache drift | Periodic full rebuild (daily cron) |
| Increased complexity | Clear cache key conventions |

---

## Not In Scope (Deferred)

These Phase 3 items are deferred for later consideration:
- Edge runtime for API routes
- Prisma connection pooling
- Service worker / PWA
- Database read replicas
- Bundle splitting optimizations

These may be revisited after measuring impact of the three priority items.
