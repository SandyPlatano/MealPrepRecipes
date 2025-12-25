# Performance Optimization Design

**Date:** 2025-12-25
**Status:** Approved
**Scope:** Full-stack performance optimization (database, queries, caching, interactions, bundle)

---

## Current State Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Architecture | ✅ Good | Server Actions + Server Components |
| Loading states | ✅ Good | Detailed skeletons on main pages |
| Column selection | ✅ Good | 283 specific vs 4 `select('*')` |
| Optimistic updates | ⚠️ Partial | `useTransition` in 23 components |
| Pagination | ⚠️ Missing | Only 23 files use `.limit()` |
| Client caching | ❌ None | No React Query/SWR |
| Database indexes | ❓ Unknown | Needs audit |
| Bundle size | ❓ Unknown | Needs analysis |

---

## Phase 1: Database Optimization

### 1.1 Index Audit

Run in Supabase SQL Editor to identify slow queries:

```sql
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 1.2 Recommended Indexes

Based on app query patterns:

| Table | Index | Rationale |
|-------|-------|-----------|
| `recipes` | `user_id` | Filter by owner |
| `recipes` | `household_id` | Shared recipes |
| `meal_plan_items` | `(user_id, date)` | Weekly planner queries |
| `shopping_list_items` | `(user_id, checked)` | Active list items |
| `cooking_history` | `(user_id, cooked_at)` | Recent cooks |

Example migration:

```sql
-- Create indexes concurrently to avoid table locks
CREATE INDEX CONCURRENTLY idx_recipes_user_id ON recipes(user_id);
CREATE INDEX CONCURRENTLY idx_recipes_household_id ON recipes(household_id);
CREATE INDEX CONCURRENTLY idx_meal_plan_items_user_date ON meal_plan_items(user_id, date);
CREATE INDEX CONCURRENTLY idx_shopping_list_items_user_checked ON shopping_list_items(user_id, checked);
CREATE INDEX CONCURRENTLY idx_cooking_history_user_cooked ON cooking_history(user_id, cooked_at DESC);
```

### 1.3 Fix Legacy `select('*')` Queries

Files to update (4 total):
- Pantry scan actions
- Subscription actions
- Monitoring utilities

Change pattern:
```typescript
// Before
.select('*')

// After
.select('id, name, needed_columns, only')
```

---

## Phase 2: Query Optimization

### 2.1 Add Pagination/Limits

| Query Type | Current | Proposed |
|------------|---------|----------|
| Recipe list | Unbounded | `.limit(50)` + infinite scroll |
| Cooking history | Unbounded | `.limit(20)` + "load more" |
| Shopping list items | Unbounded | Keep (users need full list) |
| Activity feed | Unbounded | `.limit(30)` + pagination |
| Folders/categories | Unbounded | Keep (typically < 20) |

### 2.2 Query Caching Pattern

Apply React `cache()` to frequent server-side fetches:

```typescript
import { cache } from 'react';

export const getCachedRecipes = cache(async (userId: string) => {
  return supabase
    .from('recipes')
    .select('id, name, image_url, prep_time, cook_time')
    .eq('user_id', userId)
    .limit(50);
});
```

### 2.3 Verify No Waterfall Fetches

Ensure independent queries use `Promise.all()`:

```typescript
// Good - parallel
const [recipes, mealPlan, settings] = await Promise.all([
  getRecipes(userId),
  getMealPlan(userId, weekStart),
  getSettings(userId),
]);

// Bad - waterfall
const recipes = await getRecipes(userId);
const mealPlan = await getMealPlan(userId, weekStart);
```

---

## Phase 3: Client-Side Caching (React Query)

### 3.1 Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 3.2 Provider Setup

```typescript
// src/components/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes default
        gcTime: 1000 * 60 * 30,   // 30 minutes cache
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3.3 Stale Time Configuration

| Data Type | Stale Time | Rationale |
|-----------|------------|-----------|
| Recipes | 5 min | Rarely changes |
| User settings | 5 min | Rarely changes |
| Meal plan | 30 sec | May change frequently |
| Shopping list | 30 sec | Active editing |
| Cooking history | 2 min | Updated after cooking |

### 3.4 Custom Hooks Pattern

```typescript
// src/hooks/use-recipes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useRecipes(userId: string) {
  return useQuery({
    queryKey: ['recipes', userId],
    queryFn: () => fetchRecipes(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRecipe,
    onMutate: async (newRecipe) => {
      await queryClient.cancelQueries({ queryKey: ['recipes'] });
      const previous = queryClient.getQueryData(['recipes']);
      queryClient.setQueryData(['recipes'], (old) => [...old, { ...newRecipe, id: 'temp' }]);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['recipes'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
```

---

## Phase 4: Interaction Feedback

### 4.1 Button Loading States

Enhance action buttons with pending state feedback:

```typescript
function ActionButton({ onClick, children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() => startTransition(onClick)}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}
```

### 4.2 Optimistic Update Targets

| Action | Optimistic Behavior |
|--------|---------------------|
| Favorite recipe | Instant heart toggle |
| Check shopping item | Instant strikethrough |
| Add to meal plan | Instant card appearance |
| Delete recipe | Instant removal + undo toast |
| Reorder items | Instant position change |

### 4.3 Error Recovery

- Show toast on sync failure
- Provide "Retry" action
- Rollback UI to previous state

---

## Phase 5: Bundle Optimization

### 5.1 Analysis Setup

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // existing config
});
```

```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

### 5.2 Dynamic Import Targets

| Component | Load Trigger | Reason |
|-----------|--------------|--------|
| `MealCalendar` | Route entry | Large drag-drop library |
| `RecipeModal` | Button click | Only on detail view |
| `CookingMode` | Start cook | Full-screen experience |
| `AISuggestionModal` | AI button click | AI features |
| Markdown editor | Edit mode | Recipe editing only |

Example:

```typescript
import dynamic from 'next/dynamic';

const CookingMode = dynamic(() => import('@/components/cooking-mode'), {
  loading: () => <CookingModeSkeleton />,
  ssr: false,
});
```

### 5.3 Import Audit

Verify tree-shaking friendly imports:

```typescript
// Good
import { Home, Settings, User } from 'lucide-react';
import { format, addDays } from 'date-fns';

// Bad
import * as Icons from 'lucide-react';
import _ from 'lodash';
```

### 5.4 Dependency Cleanup

```bash
npx depcheck
# Remove unused packages
npm uninstall <unused-package>
```

---

## Implementation Order

| Phase | Scope | Effort | Impact |
|-------|-------|--------|--------|
| 1 | Database indexes + fix `select('*')` | Low | High |
| 2 | Add `.limit()` to unbounded queries | Low | Medium |
| 3 | React Query setup + caching | Medium | High |
| 4 | Optimistic updates on mutations | Medium | High |
| 5 | Bundle analysis + dynamic imports | Medium | Medium |

---

## Success Metrics

- **Time to Interactive (TTI):** < 2 seconds on 3G
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Interaction latency:** < 100ms perceived response
- **Bundle size:** < 200KB initial JS (gzipped)
- **Database query time:** < 100ms average

---

## Out of Scope

- Real-time subscriptions optimization (Supabase Realtime)
- CDN/edge caching configuration
- Service worker / offline support
- Server-side rendering optimizations
- Image optimization (already using next/image)

---

## Files to Modify

### Phase 1
- `supabase/migrations/xxx_add_performance_indexes.sql` (new)
- Pantry scan action files
- Subscription action files
- Monitoring utility files

### Phase 2
- Recipe list actions
- Cooking history actions
- Activity feed actions

### Phase 3
- `src/components/providers/query-provider.tsx` (new)
- `src/app/layout.tsx` (wrap with provider)
- `src/hooks/use-recipes.ts` (new)
- `src/hooks/use-meal-plan.ts` (new)
- `src/hooks/use-shopping-list.ts` (new)

### Phase 4
- Button components with loading states
- Favorite button component
- Shopping list item component
- Meal plan card component

### Phase 5
- `next.config.js` (bundle analyzer)
- Components with dynamic imports
- Package.json (remove unused deps)
