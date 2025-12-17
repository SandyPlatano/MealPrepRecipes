# Meal Type Slots with Color Coding

## Overview

Enhance the meal planning system to support **meal type slots** (breakfast, lunch, dinner, snack) with color-coded visual organization. Each meal assignment can be tagged with a meal type, displayed in consistent order, and visually distinguished by color-coded borders.

## Problem Statement

Currently, meal assignments are unstructured — recipes are added to days without any indication of *when* they'll be eaten. Users cannot quickly scan a day to see what's planned for breakfast vs. dinner. This feature adds structured meal slots with visual organization.

## Goals

- Allow users to categorize meals by type (breakfast, lunch, dinner, snack)
- Provide instant visual recognition through color-coded meal cards
- Auto-infer meal type from recipe metadata to reduce manual effort
- Maintain consistent ordering for predictable scanning

---

## User Flow

### Adding a Meal

1. User clicks **+ Add Meal** on a day
2. Recipe picker modal opens
3. User selects a recipe
4. System **auto-infers** meal type from recipe's `recipe_type` field:
   - `Breakfast` → breakfast slot
   - `Dinner` → dinner slot
   - `Snack` → snack slot
   - `Baking`, `Dessert`, `Side Dish` → unassigned (null)
5. User sees two dropdowns:
   - **Cook selector** (existing)
   - **Meal type selector** (new) — pre-filled with inferred value
6. User can change meal type manually if desired
7. User confirms — meal is added with assigned type

### Viewing a Day

1. Meals are grouped by meal type with **visual headers**:
   - 🌅 **Breakfast**
   - 🥗 **Lunch**
   - 🍽️ **Dinner**
   - 🍿 **Snack**
   - 📋 **Other** (unassigned meals)
2. Each section only appears if it has meals
3. Within each section, meals are ordered by **time added** (oldest first)
4. Each meal card has a **colored left border/accent** matching its type
5. Empty slots do not show headers (no empty "Breakfast" section)

### Editing a Meal

1. User clicks on a meal card
2. Dropdown menu includes existing options plus **Change Meal Type**
3. Selecting "Change Meal Type" shows the 4 options + "Other"
4. Selection updates immediately (optimistic UI)

---

## Technical Implementation

### Database Schema

**Migration: Add `meal_type` to `meal_assignments`**

```sql
-- Add meal_type column to meal_assignments
ALTER TABLE meal_assignments
ADD COLUMN meal_type TEXT
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack') OR meal_type IS NULL);

-- Add index for efficient grouping/sorting
CREATE INDEX idx_meal_assignments_meal_type ON meal_assignments(meal_type);
```

**No data migration required** — existing assignments remain `null` and display in "Other" section.

### TypeScript Types

```typescript
// types/meal-plan.ts

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealAssignment {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  meal_type: MealType | null;  // NEW
  created_at: string;
}

// Display order constant
export const MEAL_TYPE_ORDER: (MealType | null)[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  null  // "Other" at the end
];

// Display metadata
export const MEAL_TYPE_CONFIG: Record<MealType | 'other', {
  label: string;
  emoji: string;
  color: string;        // Tailwind border color class
  bgColor: string;      // Tailwind background tint class
}> = {
  breakfast: {
    label: 'Breakfast',
    emoji: '🌅',
    color: 'border-l-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  lunch: {
    label: 'Lunch',
    emoji: '🥗',
    color: 'border-l-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  dinner: {
    label: 'Dinner',
    emoji: '🍽️',
    color: 'border-l-coral',           // Uses brand coral
    bgColor: 'bg-coral/5 dark:bg-coral/10',
  },
  snack: {
    label: 'Snack',
    emoji: '🍿',
    color: 'border-l-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
  },
  other: {
    label: 'Other',
    emoji: '📋',
    color: 'border-l-gray-300 dark:border-l-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
  },
};
```

### Color Palette (Coral Brand Aligned)

| Meal Type | Border Color | Hex | Rationale |
|-----------|-------------|-----|-----------|
| Breakfast | Amber 400 | `#FBBF24` | Warm sunrise/morning feel |
| Lunch | Emerald 400 | `#34D399` | Fresh, midday energy |
| Dinner | Brand Coral | `#F97316` | Primary brand color for main meal |
| Snack | Violet 400 | `#A78BFA` | Playful, lighter moment |
| Other | Gray 300/600 | `#D1D5DB` | Neutral for unassigned |

### Recipe Type → Meal Type Inference

```typescript
// lib/meal-type-inference.ts

import { RecipeType } from '@/types/recipe';
import { MealType } from '@/types/meal-plan';

export function inferMealType(recipeType: RecipeType | null): MealType | null {
  switch (recipeType) {
    case 'Breakfast':
      return 'breakfast';
    case 'Dinner':
      return 'dinner';
    case 'Snack':
      return 'snack';
    // Ambiguous types → let user decide
    case 'Baking':
    case 'Dessert':
    case 'Side Dish':
    default:
      return null;
  }
}
```

### Server Actions Updates

**`addMealAssignment`** — Add `meal_type` parameter:

```typescript
export async function addMealAssignment(
  mealPlanId: string,
  recipeId: string,
  dayOfWeek: DayOfWeek,
  cook: string | null,
  mealType: MealType | null  // NEW
): Promise<MealAssignment>
```

**`updateMealAssignment`** — Support updating `meal_type`:

```typescript
export async function updateMealAssignment(
  assignmentId: string,
  updates: {
    day_of_week?: DayOfWeek;
    cook?: string | null;
    meal_type?: MealType | null;  // NEW
  }
): Promise<MealAssignment>
```

### Template Updates

**Schema change for `meal_plan_templates.assignments` JSONB:**

```typescript
interface TemplateAssignment {
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  meal_type: MealType | null;  // NEW - preserve full structure
}
```

When saving a template, include `meal_type`. When applying, restore it.

---

## UI Components

### MealTypeSelector (New Component)

```typescript
// components/meal-plan/meal-type-selector.tsx

interface MealTypeSelectorProps {
  value: MealType | null;
  onChange: (type: MealType | null) => void;
  disabled?: boolean;
}
```

- Dropdown select with colored indicators
- Options: Breakfast, Lunch, Dinner, Snack, Other (null)
- Each option shows emoji + label + color swatch

### MealSlotHeader (New Component)

```typescript
// components/meal-plan/meal-slot-header.tsx

interface MealSlotHeaderProps {
  mealType: MealType | null;
  mealCount: number;
}
```

- Displays emoji + label + meal count badge
- Styled with subtle background tint matching the meal type
- Only renders if `mealCount > 0`

### Updates to Existing Components

**`PlannerDayRow` / `PlannerDayColumn`:**
- Group meals by `meal_type` before rendering
- Sort groups by `MEAL_TYPE_ORDER`
- Within each group, sort by `created_at` ascending
- Render `MealSlotHeader` for each non-empty group
- Render meal cards with colored left border

**`RecipeRow` / `MealCell`:**
- Add `border-l-4` with color from `MEAL_TYPE_CONFIG`
- Include meal type in action dropdown

**`RecipePickerModal`:**
- Add `MealTypeSelector` below recipe selection
- Pre-fill with inferred value from selected recipe
- Pass to `addMealAssignment` on confirm

---

## Sorting Logic

```typescript
function sortMealsByType(meals: MealAssignmentWithRecipe[]): Map<MealType | null, MealAssignmentWithRecipe[]> {
  const grouped = new Map<MealType | null, MealAssignmentWithRecipe[]>();

  // Initialize in display order
  for (const type of MEAL_TYPE_ORDER) {
    grouped.set(type, []);
  }

  // Group meals
  for (const meal of meals) {
    const type = meal.meal_type;
    grouped.get(type)?.push(meal);
  }

  // Sort within each group by created_at (oldest first)
  for (const [type, typeMeals] of grouped) {
    typeMeals.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return grouped;
}
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Recipe has no `recipe_type` | Meal type defaults to `null` (Other) |
| User clears meal type selection | Set to `null`, show in Other section |
| Template has meal with deleted recipe | Skip that assignment when applying |
| Multiple meals same type, same day | All show under one header, sorted by time |
| Day has only "Other" meals | Only "Other" header shows |

---

## Assumptions & Constraints

1. **No slot limits** — Users can add unlimited meals to any slot
2. **No time-of-day tracking** — Meal type is categorical, not a specific time
3. **Backward compatible** — Existing assignments work without modification
4. **No lunch in recipe types** — Lunch slot is always user-assigned (no auto-inference)
5. **Cook and meal type are independent** — Either, both, or neither can be set

---

## Out of Scope

- Meal scheduling with specific times
- Nutritional balancing across meal types
- Meal type suggestions based on nutrition goals
- Recurring meal patterns (e.g., "always have oatmeal for breakfast")
- Drag-and-drop between meal types

---

## Files to Modify

### New Files
- `nextjs/src/components/meal-plan/meal-type-selector.tsx`
- `nextjs/src/components/meal-plan/meal-slot-header.tsx`
- `nextjs/src/lib/meal-type-inference.ts`
- `nextjs/supabase/migrations/YYYYMMDD_add_meal_type_to_assignments.sql`

### Modified Files
- `nextjs/src/types/meal-plan.ts` — Add `MealType`, update `MealAssignment`
- `nextjs/src/app/actions/meal-plans.ts` — Update CRUD actions
- `nextjs/src/components/meal-plan/planner-day-row.tsx` — Add grouping & headers
- `nextjs/src/components/meal-plan/planner-day-column.tsx` — Add grouping & headers
- `nextjs/src/components/meal-plan/recipe-row.tsx` — Add colored border
- `nextjs/src/components/meal-plan/recipe-picker-modal.tsx` — Add meal type selector
- `nextjs/src/components/meal-plan/meal-actions-dropdown.tsx` — Add "Change Meal Type" option

---

## Success Criteria

1. User can assign a meal type when adding a recipe to the plan
2. Meal type is auto-inferred from recipe type (Breakfast, Dinner, Snack)
3. Meals display grouped by type with visual headers
4. Each meal card has a colored left border matching its type
5. Order is always: breakfast → lunch → dinner → snack → other
6. Users can change meal type after assignment
7. Existing assignments show in "Other" section without errors
8. Templates preserve and restore meal type
