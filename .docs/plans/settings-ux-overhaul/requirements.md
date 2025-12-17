# Settings Page UX/UI Overhaul

## Overview

**Goal:** Transform the current monolithic settings page into a world-class, mobile-first settings experience that drives customer retention through superior usability.

**Status:** Requirements Complete
**Scope:** Medium
**Created:** 2025-12-17

---

## Problem Statement

The current settings page suffers from critical UX issues:

| Issue | Impact |
|-------|--------|
| 1,597-line monolithic component | Unmaintainable, slow to modify |
| 37+ settings with no navigation | Users scroll endlessly to find settings |
| Mixed save patterns | Confusing - some auto-save, some require button |
| 20+ useState/useRef pairs | State management chaos, prone to bugs |
| No search functionality | Users can't find specific settings |
| Poor mobile experience | 50+ swipes to reach bottom on phone |

---

## User Requirements

### 1. Navigation

**Desktop:**
- Persistent left sidebar (240px width)
- 7 categories with icons
- Active state highlighting

**Mobile:**
- Bottom tab bar with 4 visible categories
- "More" overflow button for additional categories
- Sheet-based menu for overflow items
- 44-48px touch targets

**Categories:**
1. Profile & Account
2. Appearance
3. Meal Planning
4. Dietary & Nutrition
5. Sounds & Shortcuts
6. Data & Export
7. Household

### 2. Search

- Typeahead search bar at top of settings
- Real-time filtering as user types
- Shows category path in results (e.g., "Appearance > Accent Color")
- Highlights matched terms
- Keyword matching (e.g., "dark" matches "Dark Mode", "night", "theme")
- On selection: navigates to category, scrolls to setting, briefly highlights

### 3. Save Behavior

- **Auto-save everything** - no manual save button
- 800ms debounce to batch rapid changes
- Visual feedback: "Saving..." spinner > "Saved" checkmark
- Toast notifications for errors
- Optimistic updates (UI changes immediately)

### 4. Progressive Disclosure

Essential settings visible by default. Power user features hidden behind "Show Advanced" toggles:

- Keyboard shortcuts customization
- Custom AI prompts
- Recipe export preferences
- Custom fields definitions
- Custom ingredient categories
- API costs (admin only)

### 5. Live Preview

Real-time visual feedback for:
- Theme changes (dark/light mode)
- Accent color selection
- Display density changes
- Rating scale preview

### 6. Accessibility

- WCAG AA compliance minimum
- Full keyboard navigation
- ARIA labels on all interactive elements
- Visible focus indicators
- Screen reader support

---

## Technical Requirements

### Architecture

```
/app/settings/
├── layout.tsx          # Shared layout with sidebar + mobile nav
├── page.tsx            # Redirects to /profile
├── profile/page.tsx    # Profile & Account
├── appearance/page.tsx # Appearance
├── meal-planning/page.tsx
├── dietary/page.tsx
├── shortcuts/page.tsx
├── data/page.tsx
└── household/page.tsx
```

### State Management

**SettingsContext** provides:
- Unified state for all settings data
- Optimistic updates (UI first, then persist)
- Batched saves (multiple changes → single API call)
- Debounced persistence (800ms)
- Save status tracking (idle/saving/saved/error)

### Component Structure

```
/components/settings/
├── layout/
│   ├── settings-sidebar.tsx      # Desktop navigation
│   ├── settings-mobile-nav.tsx   # Mobile bottom tabs
│   └── settings-header.tsx       # Search + save indicator
├── search/
│   ├── settings-search.tsx       # Search input component
│   └── settings-search-index.ts  # Searchable registry
├── shared/
│   ├── auto-save-indicator.tsx   # "Saving..." / "Saved"
│   ├── setting-row.tsx           # Reusable setting layout
│   └── advanced-toggle.tsx       # Progressive disclosure
└── categories/
    ├── profile-settings.tsx
    ├── appearance-settings.tsx
    ├── meal-planning-settings.tsx
    ├── dietary-settings.tsx
    ├── shortcuts-settings.tsx
    ├── data-settings.tsx
    └── household-settings.tsx
```

### Search Index

Index all 37+ settings with:
- `id`: Unique identifier
- `label`: Display name
- `description`: Helper text
- `keywords[]`: Search synonyms
- `category`: Parent category ID
- `path`: Route to navigate to
- `componentId`: DOM element ID for scroll-to
- `isAdvanced`: Hidden by default?

---

## Settings by Category

### Profile & Account
- First name
- Last name
- Email (read-only)
- Public username
- Sign out button
- Delete account

### Appearance
- Dark mode toggle
- Theme mode (system/light/dark)
- Accent color (16 options)
- Rating scale (5-star/10-star/thumbs/letter/emoji)
- Custom rating emojis*
- Date format
- Time format (12h/24h)
- Week start day
- Seasonal themes*

### Meal Planning
- Meal type emojis
- Meal type colors
- Meal type calendar times
- Planner view density
- Show meal type headers
- Show nutrition badges
- Show prep time
- Default serving size
- Custom meal types*
- Custom recipe types*
- Google Calendar connection
- Calendar event time*
- Calendar event duration*
- Calendar excluded days*

### Dietary & Nutrition
- Allergen alerts (8+ allergens)
- Custom dietary restrictions
- Macro tracking enabled
- Macro goals (protein/carbs/fats)
- Macro goal preset
- Unit system (imperial/metric)
- Custom nutrition badges*
- Ingredient substitutions

### Sounds & Shortcuts
- Sounds enabled
- Timer complete sound
- Notification sound
- Achievement sound
- Volume level
- Keyboard shortcuts enabled*
- Custom hotkey mappings*
- Reset dismissed hints

### Data & Export
- Recipe export preferences
- Bulk export recipes
- Import recipes
- Custom fields*
- Custom ingredient categories*
- Category order
- API costs (admin)*

### Household
- Household name
- Members list
- Member roles
- Cook names
- Cook colors

*Items marked with asterisk are behind "Show Advanced" toggles

---

## User Flows

### Finding a Setting (Search)
1. User opens Settings
2. Clicks search bar
3. Types "dark"
4. Sees "Dark Mode" result under "Appearance"
5. Clicks result
6. Page navigates to Appearance
7. Scrolls to Dark Mode setting
8. Setting briefly highlights (ring animation)

### Changing a Setting (Auto-save)
1. User toggles "Dark Mode" switch
2. Theme changes instantly (live preview)
3. "Saving..." indicator appears
4. After 800ms, API call fires
5. "Saved" checkmark appears
6. Indicator fades after 2 seconds

### Mobile Navigation
1. User opens Settings on phone
2. Sees bottom tabs: Profile | Appearance | Meals | Dietary | More
3. Taps "More"
4. Sheet slides up: Shortcuts | Data | Household
5. Taps "Data"
6. Sheet closes, Data & Export section loads

---

## Implementation Phases

### Phase 1: Infrastructure
- SettingsContext with debounced auto-save
- Category definitions and types
- Layout components (sidebar, mobile nav)
- Search infrastructure

### Phase 2: Category Pages
- Route structure for each category
- Extract settings into category components
- Wire up to SettingsContext
- Preserve working existing section components

### Phase 3: Unified Auto-save
- Replace individual auto-save with context-based
- Remove manual "Save Settings" button
- Add global save indicator
- Test all save paths

### Phase 4: Polish
- Progressive disclosure toggles
- Complete search functionality
- Mobile testing
- Performance optimization
- Remove deprecated settings-form.tsx

---

## Success Criteria

- [ ] All 37+ settings accessible and functional
- [ ] Search finds any setting by name, description, or keyword
- [ ] Auto-save works with visual feedback
- [ ] Mobile navigation feels native
- [ ] Page load time ≤ current
- [ ] Zero data loss during migration
- [ ] WCAG AA accessibility compliance

---

## Out of Scope

- Adding new settings (UX restructure only)
- Changing persistence layer (keep Supabase)
- i18n/localization
- Settings export/import between accounts

---

## Critical Files

| File | Action |
|------|--------|
| `src/components/settings/settings-form.tsx` | Refactor into categories |
| `src/app/(app)/app/settings/page.tsx` | Add layout, redirect |
| `src/app/actions/settings.ts` | Keep existing actions |
| `src/types/settings.ts` | Keep type definitions |
| `src/contexts/settings-context.tsx` | Create new |
| `src/lib/settings/settings-categories.ts` | Create new |
| `src/lib/settings/settings-search-index.ts` | Create new |
