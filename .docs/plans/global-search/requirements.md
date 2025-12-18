# Global Search

> A Notion-style global search experience that provides fast access to recipes, quick actions, and public profiles from anywhere in the app.

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| **Searchable Content** | Recipes + Quick Actions + Public Users |
| **Recent Items** | Show recently viewed when modal opens |
| **Result Behavior** | Navigate directly on click |
| **Trigger** | "/" keyboard shortcut + header search button |
| **Grouping** | Sectioned results (Recipes, Actions, People) |
| **Scale** | Server-side search (supports 1000+ recipes) |
| **Keyboard Navigation** | Arrow keys + Enter + Escape |

---

## User Flow

### Opening Search
- User presses "/" anywhere (except input fields) OR clicks search icon in header
- Modal opens with focus on search input
- Recently viewed items display below input (max 8 items)

### Searching
- User types query
- Results appear grouped by category: **Recipes**, **Actions**, **People**
- Debounced search (300ms) prevents excessive requests
- Empty query shows recent items instead

### Navigating Results
- **Arrow Down**: Move selection to next result
- **Arrow Up**: Move selection to previous result
- **Enter**: Navigate to selected item and close modal
- **Escape**: Close modal without action
- Selection wraps around (bottom → top, top → bottom)

### Recent Items
- Stored in localStorage
- Updated when user visits recipes, profiles, or pages
- Max 8 items, FIFO when full

---

## Searchable Content

### Recipes (Server-side)

**Searchable Fields:**
- title
- ingredients (array)
- tags (array)
- description
- protein_type
- recipe_type
- category

**Scope:** User's own recipes + household shared recipes

**Results:** Max 8 recipes

**Relevance Ranking:**
1. Exact title match
2. Title prefix match
3. Title contains query
4. Other field matches

### Quick Actions (Client-side)

**Navigation:**
| Action | Destination |
|--------|-------------|
| Go to Planner | `/app` |
| Go to Recipes | `/app/recipes` |
| Go to Shopping List | `/app/shop` |
| Go to Settings | `/app/settings` |
| Go to Community | `/app/community` |

**Create:**
| Action | Behavior |
|--------|----------|
| Create New Recipe | Navigate to `/app/recipes/new` |
| Import Recipe from URL | Open import dialog |
| Add to Shopping List | Open add item dialog |

**Utilities:**
| Action | Behavior |
|--------|----------|
| Toggle Dark Mode | Toggle theme |
| Export Recipes | Navigate to `/app/settings/data` |
| Invite to Household | Navigate to `/app/settings/household` |

### Public Profiles (Server-side)

**Searchable Fields:**
- username
- first_name
- last_name
- bio
- cooking_philosophy

**Scope:** Public profiles only (where `public_profile = true`)

**Results:** Max 5 profiles

**Ranking:** Username prefix match prioritized, then by follower count

---

## Technical Approach

### Database

Create two PostgreSQL RPC functions:

1. **`search_user_recipes`**
   - Parameters: `p_user_id`, `p_household_id`, `p_query`, `p_limit`
   - Uses ILIKE for case-insensitive matching
   - Searches title, description, protein_type, recipe_type, category, tags[], ingredients[]
   - Returns relevance score for ranking

2. **`search_public_profiles`**
   - Parameters: `p_query`, `p_limit`
   - Searches username, first_name, last_name, bio, cooking_philosophy
   - Orders by username prefix match, then follower_count

### Frontend Architecture

**New Components:**
- `GlobalSearchProvider` - Context for search state
- `GlobalSearchModal` - Dialog with search input and results
- `SearchResults` - Grouped results display
- `RecentItems` - Recent items section

**State Management:**
- `isOpen` - Modal visibility
- `query` - Search input value
- `results` - Search results (recipes, actions, profiles)
- `selectedIndex` - Currently selected result for keyboard nav
- `recentItems` - From localStorage

### Integration Points

| File | Modification |
|------|--------------|
| `keyboard-shortcuts-provider.tsx` | Dispatch `keyboard:openSearch` event on "/" |
| `providers.tsx` | Wrap app with `GlobalSearchProvider` |
| `app-header.tsx` | Add search button |

---

## File Structure

```
/nextjs/src/
  contexts/
    global-search-context.tsx

  components/
    global-search/
      index.ts
      global-search-modal.tsx
      search-results.tsx
      search-result-item.tsx
      recent-items.tsx

  lib/
    search/
      global-search-index.ts      # Actions definition
      search-actions.ts           # Server actions
      recent-items.ts             # localStorage utils

  types/
    global-search.ts

/nextjs/supabase/migrations/
  YYYYMMDD_global_search.sql
```

---

## Implementation Phases

### Phase 1: Infrastructure
- Create type definitions (`types/global-search.ts`)
- Create recent-items localStorage utility (`lib/search/recent-items.ts`)
- Create actions index (`lib/search/global-search-index.ts`)

### Phase 2: Database
- Create migration with `search_user_recipes` and `search_public_profiles` functions
- Apply migration

### Phase 3: Server Actions
- Create `globalSearch` server action (`lib/search/search-actions.ts`)

### Phase 4: Context & Provider
- Create `GlobalSearchContext` (`contexts/global-search-context.tsx`)
- Add provider to `providers.tsx`

### Phase 5: UI Components
- Create `GlobalSearchModal` with Dialog
- Create `SearchResults` with grouped sections
- Create `RecentItems` section

### Phase 6: Integration
- Modify `KeyboardShortcutsProvider` to dispatch search event
- Add search button to `AppHeader`
- Track recent items on recipe/profile navigation

### Phase 7: Polish
- Add 300ms debounce on search input
- Add loading states
- Test keyboard navigation edge cases
- Performance test with large recipe collections

---

## Out of Scope

- Full-text search with stemming/fuzzy matching (ILIKE is sufficient for MVP)
- Search history persistence (beyond recent items)
- Advanced filters within search modal
- Mobile-specific bottom nav trigger
