# Data Fetching Patterns in MealPrepRecipes

## Overview
MealPrepRecipes uses a **Server Actions + Server Components** architecture with Next.js 15 App Router. No React Query or SWR. All data fetching happens server-side via `"use server"` actions, with client components receiving pre-fetched data as props. Client-side state changes trigger server actions with `useTransition` for optimistic updates and manual revalidation.

**Key characteristics:**
- 100% Server Actions for mutations (38+ action files)
- Server Components for initial data loading
- Specific column selection (avoiding `select('*')` except in 4 legacy cases)
- React `cache()` for request-level deduplication
- `revalidatePath()` for cache invalidation
- Limited `.limit()` usage (23 files, mostly for pagination/admin)
- Optimistic UI updates in ~10 interactive components

---

## Relevant Files

### Supabase Configuration
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/supabase/client.ts` - Browser client factory
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/supabase/server.ts` - Server client factory (with optional query monitoring)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/supabase/cached-queries.ts` - React `cache()` wrappers for common queries
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/lib/supabase/middleware.ts` - Auth middleware with timeout protection

### Server Actions (Primary Data Layer)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/recipes.ts` - Recipe CRUD (uses specific column selection)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/shopping-list.ts` - Shopping list operations
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/meal-plans.ts` - Meal planning logic
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/folders.ts` - Folder management with tree building
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/settings.ts` - User settings (36+ select statements)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/actions/nutrition.ts` - Nutrition tracking
- *+32 more action files* (see `src/app/actions/` directory)

### Key Server Component Pages
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/(app)/app/recipes/page.tsx` - Recipes page (parallel data fetching example)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/(app)/app/shop/page.tsx` - Shopping list page
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/app/(app)/app/page.tsx` - Home/meal planner (80+ lines of parallel fetching)

### Client Components (Data Consumers)
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/components/recipes/recipes-page-client.tsx` - Recipe grid with filtering
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/components/shopping-list/shopping-list-view.tsx` - Shopping list with optimistic updates
- `/Users/ferm/Documents/GitHub/MealPrepRecipes/nextjs/src/components/meal-plan/meal-planner-grid.tsx` - Meal planner interactions

---

## Architectural Patterns

### 1. Server Actions as the Data Layer
**All mutations and most reads go through server actions marked with `"use server"`**
- **Location**: `src/app/actions/*.ts` (38 files)
- **Pattern**: Each action file exports multiple async functions
- **Auth**: Every action calls `getCachedUser()` or `getCachedUserWithHousehold()` for authentication
- **Example**:
  ```typescript
  export async function getRecipes() {
    const { user, household } = await getCachedUserWithHousehold();
    const supabase = await createClient();
    const { data } = await supabase.from("recipes").select("*")...
    return { error: null, data };
  }
  ```

### 2. Server Components for Initial Page Loads
**Pages fetch data server-side and pass to client components**
- **Pattern**: `Promise.all([])` for parallel fetching in Server Components
- **Example** (`recipes/page.tsx` lines 35-57):
  ```typescript
  const [recipesResult, favoritesResult, settingsResult, ...] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getSettings(),
    // ...10 more parallel calls
  ]);
  return <RecipesPageClient recipes={recipes} ... />
  ```
- **Benefits**: Single round-trip, no loading spinners for initial render

### 3. React `cache()` for Request Deduplication
**Common queries wrapped with React's `cache()` to prevent duplicate fetches during SSR**
- **File**: `src/lib/supabase/cached-queries.ts`
- **Functions**:
  - `getCachedUser()` - Auth user (called in almost every action)
  - `getCachedUserWithHousehold()` - User + household + subscription (most common)
  - `getCachedHouseholdId()` - Just the household ID
- **Why**: Multiple Server Components/actions in the same request can safely call these without redundant database queries
- **Example** (lines 8-12):
  ```typescript
  export const getCachedUser = cache(async () => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  });
  ```

### 4. Specific Column Selection (Not `select('*')`)
**Nearly all queries specify exact columns to minimize data transfer**
- **Stats**: Only 4 files use `select('*')` (legacy code)
- **Stats**: 283 occurrences of `select("specific_columns")`
- **Example** (`folders.ts` lines 41-46):
  ```typescript
  .select(`
    *,
    cover_recipe:recipes!recipe_folders_cover_recipe_id_fkey(image_url)
  `)
  ```
- **Pattern**: Even wildcard selects join specific foreign table columns

### 5. Manual Cache Revalidation with `revalidatePath()`
**After mutations, server actions call `revalidatePath()` to clear Next.js cache**
- **Files**: 29 action files use `revalidatePath` or `revalidateTag`
- **Example** (`recipes.ts`):
  ```typescript
  export async function deleteRecipe(id: string) {
    // ... delete logic
    revalidatePath("/app/recipes");
    revalidatePath("/app");
    return { error: null };
  }
  ```
- **No auto-refetching**: Unlike React Query, developers must manually invalidate routes

### 6. Optimistic UI Updates with `useTransition`
**Interactive components use `startTransition` + local state for instant feedback**
- **Usage**: 136 occurrences across 23 components
- **Pattern**:
  1. Update local state immediately
  2. Call server action in `startTransition`
  3. Revert local state if action fails
- **Example** (`shopping-list-view.tsx` lines 164-168):
  ```typescript
  const [optimisticCooks, setOptimisticCooks] = useState({});
  const [, startTransition] = useTransition();

  // Update UI immediately, then sync to server
  setOptimisticCooks({ ...optimisticCooks, [itemId]: cook });
  startTransition(async () => {
    await updateMealAssignment(assignmentId, { cook });
  });
  ```
- **Files with optimistic patterns**: `shopping-list-view.tsx`, `meal-planner-grid.tsx`, `recipe-card.tsx`, `sidebar-collections.tsx`

### 7. Limited Use of `.limit()` for Performance
**Only 23 files use `.limit()`, mostly for pagination or admin features**
- **Common limits**:
  - `.limit(10)` - Recent items, suggestions
  - `.limit(50)` - Paginated lists
  - `.limit(100)` - Admin/bulk operations
- **Example** (`meal-plan-suggestions.ts`):
  ```typescript
  .select("id, title, recipe_type, prep_time, cook_time, image_url")
  .limit(10)
  ```
- **Note**: Most queries fetch unbounded result sets (recipes, folders, settings)

### 8. No Client-Side Data Fetching Libraries
**Zero usage of React Query, SWR, or similar**
- **Confirmed via**: `package.json` and codebase search
- **Client `useEffect` usage**: Only 126 files use `useEffect`, but NOT for data fetching (mostly for timers, side effects, event listeners)
- **Example** (common `useEffect` patterns):
  - Timers in cook mode
  - Keyboard shortcuts
  - Offline sync
  - DOM measurements

### 9. Offline-First Patterns (Optional)
**Some components cache data in IndexedDB for offline use**
- **File**: `src/lib/use-offline.ts`
- **Usage**: Shopping list component (`shopping-list-view.tsx` lines 111-115)
- **Pattern**: Cache server data locally, sync when online
- **Not widespread**: Only critical user flows (shopping) have offline support

---

## Edge Cases & Gotchas

### 1. Auth Caching Can Cause Stale Sessions
- **Issue**: `getCachedUser()` caches for the entire request lifecycle
- **Impact**: If user logs out mid-request, cached data might still show them as logged in
- **Mitigation**: Middleware (`middleware.ts` lines 44-57) has 5s timeout to prevent hanging auth checks

### 2. `revalidatePath()` is Manual and Easy to Forget
- **Issue**: Developers must remember to call `revalidatePath()` after mutations
- **Impact**: UI shows stale data until manual refresh
- **Example**: 29 action files have revalidation, but some mutations might be missing it
- **Workaround**: Search for "revalidatePath" when adding new mutations to find patterns

### 3. `.select('*')` Still Exists in 4 Legacy Files
- **Files**:
  - `src/lib/stripe/subscription.ts` (1 occurrence)
  - `src/lib/monitoring/monitored-client.ts` (1)
  - `src/app/api/pantry/confirm-items/route.ts` (1)
  - `src/app/actions/pantry-scan.ts` (2)
- **Risk**: These fetch all columns, including potentially large JSONB fields
- **TODO**: Refactor to specific columns

### 4. No Built-in Loading States for Server Actions
- **Issue**: Server Actions don't have automatic loading states like React Query
- **Pattern**: Components use `useTransition`'s `isPending` or custom `isLoading` state
- **Example** (`shopping-list-view.tsx` line 148):
  ```typescript
  const [isGenerating, setIsGenerating] = useState(false);
  ```

### 5. Parallel Fetching Can Mask Slow Queries
- **Issue**: `Promise.all()` runs queries in parallel, but slowest query blocks entire page
- **Example**: `recipes/page.tsx` has 10+ parallel queries (lines 35-57)
- **Risk**: One slow query (e.g., nutrition calculation) delays entire page
- **Mitigation**: Optional query monitoring (`ENABLE_QUERY_MONITORING=true` in `server.ts`)

### 6. Tree Structures Built in Application Code
- **Pattern**: Folders/categories fetched flat, then built into trees in actions
- **Example**: `folders.ts` lines 72-98 - Manual tree building from flat list
- **Performance**: O(n²) in worst case, but acceptable for small datasets (<100 folders)

### 7. Middleware Auth Timeout Could Fail Silently
- **Code**: `middleware.ts` lines 45-57 - 5s timeout on auth check
- **Risk**: If Supabase is slow, users might be incorrectly treated as logged out
- **Fallback**: Catches error and continues without user (line 56: `user = null`)

### 8. No Automatic Retry Logic
- **Issue**: Server actions return `{ error, data }` but don't auto-retry on network failure
- **Client responsibility**: Components must handle errors and provide retry UI
- **Example**: Most actions just return error message, no retry mechanism

---

## Relevant Documentation

### Internal Patterns
- Server Action error handling: See any `src/app/actions/*.ts` file's try-catch pattern
- Optimistic updates: See `src/components/shopping-list/shopping-list-view.tsx` lines 164-168
- Parallel fetching: See `src/app/(app)/app/recipes/page.tsx` lines 35-57

### External Documentation
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [React `cache()` API](https://react.dev/reference/react/cache)
- [Next.js Revalidation](https://nextjs.org/docs/app/building-your-application/caching#revalidating)

---

## Quick Reference: Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits page                                         │
│    → Next.js Server Component renders                       │
│    → Calls multiple server actions in Promise.all()         │
│    → Actions call getCachedUser() (deduped via cache())     │
│    → Supabase queries with specific column selection        │
│    → Data passed as props to Client Component               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. User interacts (e.g., toggles shopping item)             │
│    → Client component updates local state (optimistic)      │
│    → Calls server action via startTransition()              │
│    → Action authenticates, mutates DB, revalidates path     │
│    → Next.js re-renders Server Component with fresh data    │
│    → Client receives new props, syncs with optimistic state │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

1. **No overfetching**: 283 queries use specific columns, only 4 use `select('*')`
2. **Request deduplication**: `cache()` prevents duplicate auth/household queries
3. **Parallel loading**: Pages use `Promise.all()` to fetch data concurrently
4. **Minimal client JS**: No React Query bundle, all logic server-side
5. **Potential bottlenecks**:
   - Tree building in application code (folders, categories)
   - Unbounded queries (no `.limit()` on recipes, settings)
   - Sequential revalidation (could batch multiple paths)
