# Recipe Rating Visibility & Filtering

## Overview

Improve the visibility of personal recipe ratings by displaying them prominently on recipe cards and detail pages, and add the ability to filter recipes by rating.

### Goals

1. Make personal ratings visible at a glance on recipe cards
2. Allow quick rating directly from recipe cards
3. Enable filtering recipes by rating level
4. Maintain the connection between rating and cooking history

---

## User Stories

1. **As a user**, I want to see my rating for a recipe on its card so I can quickly identify my favorites without opening each recipe.

2. **As a user**, I want to rate a recipe directly from the card so I don't have to navigate to the detail page.

3. **As a user**, I want to filter my recipes by rating so I can find my highest-rated recipes for meal planning.

4. **As a user**, I want to filter to see only unrated recipes so I can identify which recipes I haven't tried yet.

---

## User Flow

### Viewing Ratings

1. User opens recipe list/grid
2. Each rated recipe displays a compact `⭐ 4` badge next to the heart icon (top-right)
3. Unrated recipes show nothing in that space (no empty stars, no placeholder)
4. On recipe detail page, rating is also displayed prominently near the heart icon

### Quick Rating from Card

1. User clicks the rating badge (or empty rating area) on a recipe card
2. A small popover appears with 5 clickable stars
3. User selects a star rating (1-5)
4. System automatically:
   - Creates a cooking history entry with today's date
   - Saves the rating to that entry
   - Updates the recipe's displayed rating
5. Popover closes, card updates to show new rating

### Re-rating a Recipe

1. User clicks existing rating badge on card
2. Popover shows current rating highlighted
3. User can select a new rating
4. New cooking history entry is created with updated rating
5. Recipe's displayed rating updates to the most recent rating

### Filtering by Rating

1. User opens filter panel in recipe grid
2. User sees rating filter section with:
   - **Star checkboxes**: ☐ 5 stars ☐ 4 stars ☐ 3 stars ☐ 2 stars ☐ 1 star
   - **Rated/Unrated toggle**: "Rated only" | "Unrated only" | "All"
3. User checks desired star levels (e.g., 4 and 5 stars)
4. Recipe grid updates to show only recipes matching selected ratings
5. Unrated recipes are hidden when any star checkbox is selected

---

## Technical Implementation

### Data Model

No schema changes required. Leverage existing structures:

```typescript
// Existing - cooking_history table
{
  id: string;
  recipe_id: string;
  user_id: string;
  cooked_at: string;
  rating: number | null;  // 1-5
  // ... other fields
}

// Existing - Recipe type
{
  rating: number | null;  // Most recent personal rating
  // ... other fields
}

// Update - RecipeFilters type
interface RecipeFilters {
  search?: string;
  recipe_type?: RecipeType | "all";
  category?: string;
  tags?: string[];
  favorites_only?: boolean;
  rating_filter?: number[];      // NEW: Array of star levels [4, 5]
  rated_filter?: "all" | "rated" | "unrated";  // NEW
}
```

### Components to Modify

#### 1. Recipe Card (`recipe-card.tsx`)

- Add rating badge next to heart icon (top-right area)
- Badge format: `⭐ {rating}` using yellow star icon
- Only render badge if `recipe.rating` exists
- Add click handler to open rating popover
- Implement rating popover with 5 clickable stars

```tsx
// Approximate structure
<div className="flex items-center gap-1">
  {recipe.rating && (
    <RatingBadge
      rating={recipe.rating}
      onClick={() => setShowRatingPopover(true)}
    />
  )}
  <FavoriteButton ... />
</div>
```

#### 2. Recipe Detail (`recipe-detail.tsx`)

- Add rating display near the heart icon in header
- Same click-to-rate popover functionality
- Keep existing cooking history section (now serves as rating history)

#### 3. Recipe Grid (`recipe-grid.tsx`)

- Add rating filter section to filter panel
- Implement checkbox group for star levels
- Add rated/unrated toggle
- Update filtering logic to respect new filters

#### 4. New Component: Rating Badge (`rating-badge.tsx`)

```tsx
interface RatingBadgeProps {
  rating: number | null;
  onClick?: () => void;
  size?: "sm" | "md";
}
```

- Compact display: star icon + number
- Hover state for interactivity
- Optional click handler for rating popover

#### 5. New Component: Quick Rating Popover (`quick-rating-popover.tsx`)

```tsx
interface QuickRatingPopoverProps {
  recipeId: string;
  currentRating: number | null;
  onRated: (rating: number) => void;
  onClose: () => void;
}
```

- 5 clickable stars in a row
- Hover preview (stars fill on hover)
- Click to confirm rating
- Calls server action to save

### Server Actions

#### Modify: `markAsCooked` action

Ensure it can be called with just a rating (minimal cook entry):

```typescript
// In /app/actions/recipes.ts
export async function quickRate(recipeId: string, rating: number) {
  // Creates cooking history entry with:
  // - cooked_at: today
  // - rating: provided rating
  // - notes: null
  // - modifications: null
  // Updates recipe.rating to this value
}
```

Or extend existing `markAsCooked`:

```typescript
export async function markAsCooked(
  recipeId: string,
  rating: number | null,
  options?: {
    notes?: string;
    modifications?: string;
    cookedBy?: string;
  }
)
```

### Filtering Logic

Update `recipe-grid.tsx` filtering:

```typescript
// Add to existing filter chain
if (filters.rating_filter && filters.rating_filter.length > 0) {
  filtered = filtered.filter(recipe =>
    recipe.rating !== null &&
    filters.rating_filter!.includes(recipe.rating)
  );
}

if (filters.rated_filter === "rated") {
  filtered = filtered.filter(recipe => recipe.rating !== null);
} else if (filters.rated_filter === "unrated") {
  filtered = filtered.filter(recipe => recipe.rating === null);
}
```

---

## UI/UX Specifications

### Rating Badge

- **Icon**: Filled yellow star (`fill-yellow-400 text-yellow-400`)
- **Text**: Rating number (integer, no decimal)
- **Size**: Small, matches heart icon scale
- **Spacing**: 4px gap from heart icon
- **Hover**: Subtle background highlight to indicate clickability
- **Position**: Left of heart icon, top-right of card

### Quick Rating Popover

- **Trigger**: Click on rating badge (or empty area for unrated)
- **Position**: Below/beside the badge, within card bounds
- **Content**: Row of 5 star icons
- **Interaction**:
  - Hover fills stars up to hovered position
  - Click confirms selection
  - Click outside closes without saving
- **Feedback**: Brief toast "Rated {n} stars" on success

### Filter Panel

- **Section header**: "Rating"
- **Star checkboxes**: Horizontal row, each with star icon + number
  - `☐ ⭐5  ☐ ⭐4  ☐ ⭐3  ☐ ⭐2  ☐ ⭐1`
- **Rated toggle**: Below checkboxes
  - Segmented control or radio group: "All" | "Rated" | "Unrated"
- **Behavior**: Selecting any star checkbox implies "Rated only"

---

## Assumptions & Constraints

### Assumptions

1. A recipe's displayed rating is always the **most recent** rating from cooking history
2. Users want to see their own ratings only (no community ratings in personal views)
3. The existing `StarRating` component can be reused/adapted for the popover
4. Rating a recipe is a positive action (users rate recipes they've tried)

### Constraints

1. **No schema changes** - Use existing `cooking_history` and `recipes` tables
2. **Rating range**: 1-5 stars (integers only)
3. **One rating display**: Show most recent rating, not average of all cooks
4. **Mobile-friendly**: Popover must work on touch devices

### Out of Scope

1. Half-star ratings
2. Rating without creating cooking history entry
3. Community/public recipe ratings in personal views
4. Rating trends or history visualization
5. Bulk rating operations

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/recipes/recipe-card.tsx` | Add rating badge, popover trigger |
| `src/components/recipes/recipe-detail.tsx` | Add rating display near heart |
| `src/components/recipes/recipe-grid.tsx` | Add rating filter UI and logic |
| `src/types/recipe.ts` | Extend `RecipeFilters` type |
| `src/app/actions/recipes.ts` | Add/modify quick rating action |

## New Files

| File | Purpose |
|------|---------|
| `src/components/ui/rating-badge.tsx` | Compact rating display component |
| `src/components/recipes/quick-rating-popover.tsx` | Star selection popover |

---

## Success Criteria

1. [ ] Rating badge visible on all rated recipe cards
2. [ ] No visual element shown for unrated recipes
3. [ ] Click badge → popover → select stars → saves successfully
4. [ ] Rating automatically creates cooking history entry
5. [ ] Detail page shows rating prominently near heart
6. [ ] Filter by star level works (checkboxes)
7. [ ] Filter by rated/unrated works
8. [ ] Unrated recipes hidden when star filter active
9. [ ] Mobile touch interactions work correctly
