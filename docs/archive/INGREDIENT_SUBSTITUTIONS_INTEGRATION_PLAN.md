# Ingredient Substitutions Feature - Integration Plan

## Overview
The ingredient substitutions feature has backend infrastructure (server actions, database tables, library functions) but lacks a UI for users to manage their custom substitutions. This plan outlines the steps to complete the integration.

## Current State

### ✅ What Exists
1. **Database Schema** (`20251206_recipe_enhancements.sql`)
   - `substitutions` table: Built-in default substitutions (butter→coconut oil, milk→oat milk, etc.)
   - `user_substitutions` table: User-defined custom substitutions
   - Proper indexes and RLS policies already in place

2. **Server Actions** (`nextjs/src/app/actions/substitutions.ts`)
   - `createUserSubstitution()` - Create new user substitution
   - `updateUserSubstitution()` - Update existing substitution
   - `deleteUserSubstitution()` - Delete user substitution
   - All actions include proper auth checks and revalidation

3. **Library Functions** (`nextjs/src/lib/substitutions.ts`)
   - `getDefaultSubstitutions()` - Get built-in substitutions
   - `getUserSubstitutions()` - Get user's custom substitutions
   - `getAllSubstitutions()` - Merge defaults + user custom (user takes precedence)
   - `findSubstitutionsForIngredient()` - Find substitutions for a single ingredient
   - `findSubstitutionsForIngredients()` - Find substitutions for recipe ingredients
   - Uses `normalizeIngredientName()` for matching

4. **Partial UI Integration** (`recipe-detail.tsx`)
   - UI structure exists (lines 551-570) but disabled
   - Substitution display code commented out due to server/client boundary issue
   - Shows "Swap" button with Popover for ingredient substitutions

### ❌ What's Missing
1. **Settings UI Component** - No UI in settings page to manage substitutions
2. **Server-Side Data Fetching** - Recipe detail page needs substitutions passed as props
3. **Enable Recipe Detail Display** - Uncomment and fix substitution display in recipe detail

---

## Implementation Plan

### Phase 1: Create Settings UI Component

**File:** `nextjs/src/components/settings/substitutions-section.tsx`

**Requirements:**
- Display list of user's custom substitutions
- Show default substitutions (read-only, informational)
- Add/Edit/Delete functionality for user substitutions
- Form validation (original and substitute ingredients required)
- Follow existing settings component patterns (see `macro-goals-section.tsx` for reference)

**UI Structure:**
```
Card
├── CardHeader
│   ├── CardTitle: "Ingredient Substitutions"
│   └── CardDescription: "Manage your ingredient preferences..."
├── CardContent
│   ├── Section: "Your Substitutions"
│   │   ├── List of user substitutions (editable)
│   │   └── "Add Substitution" button
│   └── Section: "Common Substitutions" (collapsible)
│       └── List of default substitutions (read-only, informational)
```

**Key Features:**
- Use `createUserSubstitution`, `updateUserSubstitution`, `deleteUserSubstitution` from actions
- Show empty state when no user substitutions exist
- Inline editing or modal for add/edit
- Delete confirmation dialog
- Toast notifications for success/error
- Loading states during operations

**Component Props:**
```typescript
interface SubstitutionsSectionProps {
  initialSubstitutions?: UserSubstitution[]; // Optional, can fetch in component
}
```

---

### Phase 2: Integrate Settings Component into Settings Page

**File:** `nextjs/src/components/settings/settings-form.tsx`

**Changes:**
1. Import `SubstitutionsSection` component
2. Add new section in the settings form layout (after Macro Goals section or similar)
3. Fetch user substitutions server-side and pass as prop (optional - component can fetch itself)

**Server-Side Fetching** (Optional):
- In `nextjs/src/app/(app)/app/settings/page.tsx`
- Fetch user substitutions using `getUserSubstitutions()` from `@/lib/substitutions`
- Pass to `SettingsForm` component

---

### Phase 3: Fix Recipe Detail Substitution Display

**File:** `nextjs/src/components/recipes/recipe-detail.tsx`

**Current Issue:**
- Line 71: Commented out import of `findSubstitutionsForIngredients` (server function)
- Line 162: Substitutions state is empty Map
- Lines 551-570: UI exists but shows no substitutions

**Solution:**
1. **Fetch substitutions server-side** in the recipe detail page component
2. **Pass as prop** to `RecipeDetail` component
3. **Uncomment and enable** the substitution display UI

**File:** `nextjs/src/app/(app)/app/recipes/[id]/page.tsx`

**Changes:**
```typescript
// Add import
import { findSubstitutionsForIngredients } from "@/lib/substitutions";

// In the page component, fetch substitutions
const substitutions = await findSubstitutionsForIngredients(recipe.ingredients);

// Pass to RecipeDetail component
<RecipeDetail
  // ... existing props
  substitutions={substitutions}
/>
```

**Update RecipeDetail Props:**
```typescript
interface RecipeDetailProps {
  // ... existing props
  substitutions?: Map<string, Substitution[]>; // Add this
}
```

**Enable UI:**
- Remove commented code on line 71
- Remove line 162 (empty Map initialization)
- Update line 551 to use `props.substitutions` instead of local state
- Ensure Popover content displays substitution options correctly

---

### Phase 4: Testing & Polish

**Test Cases:**
1. ✅ Create new substitution in settings
2. ✅ Edit existing substitution
3. ✅ Delete substitution
4. ✅ View substitutions in recipe detail page
5. ✅ Substitution matching works with normalized ingredient names
6. ✅ User substitutions override defaults
7. ✅ Empty states display correctly
8. ✅ Error handling (network errors, validation errors)

**Edge Cases:**
- Empty ingredient strings
- Duplicate substitutions (handled by DB unique constraint)
- Very long ingredient names
- Special characters in ingredient names
- Normalization edge cases (e.g., "all-purpose flour" vs "all purpose flour")

---

## Technical Considerations

### Server/Client Boundary
- **Problem:** `findSubstitutionsForIngredients` is a server function (uses `createClient()`)
- **Solution:** Fetch substitutions in server component (page.tsx) and pass as props to client component
- **Pattern:** Same approach used for other server data (nutrition, allergens, etc.)

### Data Normalization
- Uses `normalizeIngredientName()` from `@/lib/ingredient-scaler`
- Handles case-insensitive matching and common variations
- Important for matching user input to stored substitutions

### Database Constraints
- `user_substitutions` has unique constraint: `(user_id, original_ingredient, substitute_ingredient)`
- Prevents duplicate substitutions
- Handle constraint violations gracefully in UI

### RLS Policies
- Verify RLS policies allow users to read/write their own substitutions
- Check that `substitutions` table (defaults) is readable by all authenticated users

---

## File Structure

```
nextjs/src/
├── components/
│   └── settings/
│       └── substitutions-section.tsx          [NEW]
├── app/
│   └── (app)/
│       └── app/
│           ├── recipes/
│           │   └── [id]/
│           │       └── page.tsx                [MODIFY - add substitutions fetch]
│           └── settings/
│               └── page.tsx                    [OPTIONAL - add substitutions fetch]
└── components/
    └── recipes/
        └── recipe-detail.tsx                   [MODIFY - enable substitution display]
```

---

## Implementation Order

1. **Phase 1** - Create `substitutions-section.tsx` component (most important)
2. **Phase 2** - Add component to settings page
3. **Phase 3** - Fix recipe detail display
4. **Phase 4** - Test and polish

---

## Reference Components

- **Settings Pattern:** `nextjs/src/components/settings/macro-goals-section.tsx`
  - Shows how to structure a settings section
  - Uses Card, CardHeader, CardContent
  - Includes form handling and server actions

- **List Management:** `nextjs/src/components/settings/settings-form.tsx` (cook names section)
  - Shows add/edit/delete pattern for list items
  - Uses state management and auto-save

- **Popover Pattern:** `nextjs/src/components/recipes/recipe-detail.tsx` (lines 558-570)
  - Shows how substitution popover should work
  - Uses Popover, PopoverTrigger, PopoverContent

---

## Success Criteria

✅ Users can view their custom substitutions in settings
✅ Users can add new substitutions
✅ Users can edit existing substitutions
✅ Users can delete substitutions
✅ Substitutions appear in recipe detail page
✅ Substitution matching works correctly
✅ UI is consistent with existing design patterns
✅ Error states are handled gracefully
✅ Loading states are shown during operations

---

## Notes

- The database schema and server actions are already complete and tested
- The main work is creating the UI component and integrating it
- Follow existing patterns in the codebase for consistency
- Use shadcn/ui components (Card, Button, Input, Dialog, etc.)
- Use `toast` from `sonner` for notifications
- Use `revalidatePath` in server actions (already done)





