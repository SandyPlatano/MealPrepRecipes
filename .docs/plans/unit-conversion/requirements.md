# Unit Conversion Feature: Metric ↔ Imperial

## Overview

Enable users to view recipe ingredients in their preferred measurement system (metric or imperial) with both a global preference and per-recipe toggle.

## User Requirements

| Requirement | Decision |
|-------------|----------|
| **Toggle Locations** | Global setting in Settings + per-recipe quick toggle |
| **Scope** | Ingredients only (nutrition facts stay in standard metric g/mg) |
| **Display** | Show converted unit only (no dual display) |
| **Conversion Type** | Same-category only (volume↔volume, weight↔weight) |

## User Flow

### Setting Global Preference
1. User navigates to Settings page
2. User sees "Measurement Units" card with two options: **Imperial (US)** or **Metric**
3. User clicks their preference → auto-saves
4. All recipe ingredients across the app now display in chosen system

### Per-Recipe Override
1. User views a recipe detail page
2. Near the serving controls, user sees a toggle button showing current system (e.g., "US" or "Metric")
3. User clicks toggle → ingredients instantly convert to the other system
4. Override is session-only (refreshing returns to global preference)

### Conversion Examples

**Imperial → Metric:**
- "2 cups flour" → "473 ml flour"
- "8 oz chicken" → "227 g chicken"
- "1/4 tsp salt" → "1 ml salt"

**Metric → Imperial:**
- "500 ml water" → "2 cups water"
- "250 g butter" → "9 oz butter"

**No Conversion (count units):**
- "3 cloves garlic" → unchanged
- "1 can tomatoes" → unchanged

## Technical Implementation

### Phase 1: Database & Types

**Migration:** `20251216_add_unit_system_preference.sql`
```sql
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'imperial'
CHECK (unit_system IN ('imperial', 'metric'));
```

**Types:** Add to `src/types/settings.ts`
```typescript
export type UnitSystem = 'imperial' | 'metric';
```

### Phase 2: Conversion Logic

**Extend:** `src/lib/ingredient-scaler.ts`

New functions:
- `getTargetUnit(unit, targetSystem)` - Determines which unit to convert to
- `convertIngredientToSystem(ingredient, targetSystem)` - Converts a single ingredient string
- `convertIngredientsToSystem(ingredients[], targetSystem)` - Batch conversion
- `getPreferredUnitForSystem(quantity, unit, system)` - Smart unit selection (1000ml → 1l)

Unit system mapping:
| System | Volume Units | Weight Units |
|--------|--------------|--------------|
| Imperial | tsp, tbsp, cup, fl oz, pint, quart, gallon | oz, lb |
| Metric | ml, l | g, kg |

### Phase 3: Settings UI

**Modify:** `src/components/settings/settings-form.tsx`

Add new Card section for "Measurement Units" with two toggle buttons:
- **Imperial (US)** - cups, oz, lb
- **Metric** - ml, g, kg

### Phase 4: Recipe Page Toggle

**Create:** `src/components/recipes/unit-system-toggle.tsx`

Small toggle button component:
- Shows current system ("US" or "Metric")
- Tooltip explains the toggle
- Calls `onSystemChange` callback on click

### Phase 5: Integration Points

| Component | Changes |
|-----------|---------|
| `recipe-detail.tsx` | Add toggle UI, apply conversion to ingredients |
| `cooking-mode.tsx` | Apply conversion to ingredient checklist |
| `print/page.tsx` | Apply conversion based on user setting |
| `shopping-list-view.tsx` | Apply conversion at display time |

### Phase 6: Data Flow

```
User clicks ingredient display
        ↓
parseIngredient("2 cups flour")
        ↓
{quantity: 2, unit: "cup", ingredient: "flour"}
        ↓
getTargetUnit("cup", "metric") → "ml"
        ↓
convertUnit(2, "cup", "ml") → 473
        ↓
getPreferredUnitForSystem(473, "ml", "metric") → {473, "ml"}
        ↓
formatQuantity(473) → "473"
        ↓
"473 ml flour"
```

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20251216_add_unit_system_preference.sql` | CREATE | Add database column |
| `src/types/settings.ts` | MODIFY | Add UnitSystem type |
| `src/lib/ingredient-scaler.ts` | MODIFY | Add conversion functions |
| `src/components/recipes/unit-system-toggle.tsx` | CREATE | Toggle button component |
| `src/components/settings/settings-form.tsx` | MODIFY | Add unit preference UI |
| `src/app/actions/settings.ts` | MODIFY | Include unit_system in save/fetch |
| `src/components/recipes/recipe-detail.tsx` | MODIFY | Add toggle + apply conversion |
| `src/components/recipes/cooking-mode.tsx` | MODIFY | Apply conversion |
| `src/app/(app)/app/recipes/[id]/print/page.tsx` | MODIFY | Apply conversion |
| `src/components/shopping-list/shopping-list-view.tsx` | MODIFY | Apply conversion |
| `src/app/(app)/app/recipes/[id]/page.tsx` | MODIFY | Fetch and pass unit setting |
| `src/app/(app)/app/shop/page.tsx` | MODIFY | Fetch and pass unit setting |

## Existing Infrastructure to Leverage

The codebase already has **90% of the conversion logic** in `ingredient-scaler.ts`:
- `VOLUME_TO_ML` - Complete volume conversion table
- `WEIGHT_TO_GRAMS` - Complete weight conversion table
- `convertUnit()` - Converts between compatible units
- `parseIngredient()` - Extracts quantity/unit/name from strings
- `formatQuantity()` - Formats decimals as fractions (1/4, 1/2, etc.)

## Out of Scope

- Nutrition unit conversion (stays in g/mg)
- Volume ↔ Weight conversion (e.g., "1 cup flour" → "125g flour")
- Temperature conversion (oven temps)
- Persisting per-recipe overrides
- URL params for sharing converted recipes

## Success Criteria

1. Users can set global unit preference in Settings
2. Recipe detail pages show ingredients in user's preferred system
3. Per-recipe toggle allows temporary override
4. Shopping list displays in preferred system
5. Print view respects user preference
6. Cooking mode shows converted units
7. Conversion is accurate and handles edge cases (no quantity, count units)
