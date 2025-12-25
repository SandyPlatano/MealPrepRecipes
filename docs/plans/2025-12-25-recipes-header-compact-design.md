# Recipes Page Header Compact Redesign

**Date:** 2025-12-25
**Status:** Approved
**Scope:** UI refinement — recipes page header

---

## Problem

The current recipes page header uses excessive vertical space with:
- A tagline ("Burning the midnight oil, TEEESST!")
- Large "Recipes" heading
- Separate "3 recipes and counting." subtitle

This pushes the actual content (recipe grid) below the fold and reduces the search experience.

## Solution

Consolidate the header into a single compact row, removing decorative elements in favor of functional density.

### Before

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Burning the midnight oil, TEEESST!                                        │
│                                                                            │
│  Recipes                                                                   │
│  3 recipes and counting.                                                   │
│                                                                            │
│  ⊞ Filters    │   [══════ Search... ══════]                    [+ Add]    │
└────────────────────────────────────────────────────────────────────────────┘
```

### After

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Recipes · 3 recipes           [══════ Search... ══════]       [+ Add]    │
│                                                                            │
│  ⊞ Filters ①  ⊟   │   ↕ Recent ▾    ✦ Discover                 2 recipes │
└────────────────────────────────────────────────────────────────────────────┘
```

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tagline | **Remove entirely** | Brand name "Midnight Ember" is sufficient |
| Title style | **Text only** (no emoji) | Cleaner, more professional |
| Recipe count | **Inline with title** | `Recipes · 3 recipes` saves a line |
| Search bar | **Grows to fill space** | Becomes more prominent |
| Vertical savings | **~80-100px** | Approximately 3-4 lines reclaimed |

## Implementation

### Files to Modify

1. **Recipes page header** — consolidate title + count + search into single row
2. **Remove tagline component/rendering** from recipes page

### Component Structure

```tsx
<header className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    <h1 className="text-lg font-semibold">Recipes</h1>
    <span className="text-muted-foreground">· {count} recipes</span>
  </div>

  <div className="flex-1">
    <SearchInput placeholder="Search recipes, ingredients, tags..." />
  </div>

  <AddRecipeButton />
</header>
```

### Styling Notes

- Title: `text-lg font-semibold` (reduced from `text-2xl`)
- Count: `text-muted-foreground` (subtle, secondary info)
- Search: `flex-1` to fill available horizontal space
- Overall row: `flex items-center gap-4`

## Out of Scope

- Filter row changes (stays as-is)
- Sidebar modifications
- Other page headers (meal plan, shopping list)

## Success Criteria

- Header occupies single line (excluding filter row)
- No tagline visible on recipes page
- Search bar is more prominent
- Recipe count remains visible inline with title
