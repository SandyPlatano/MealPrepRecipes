# Retro Brand Kit Implementation

**Date:** 2025-12-29
**Status:** Approved
**Scope:** Full application rebrand

---

## Overview

Replace the existing brand system with a neo-brutalist "Retro UI Kit" design. Single mode only (light/beige), no dark mode toggle.

## Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FFFBEB` | Page background (warm beige) |
| `--foreground` | `#050505` | Primary text (near black) |
| `--primary` | `#FFD166` | Accent color (golden yellow) |
| `--surface` | `#FFFFFF` | Cards, modals, surfaces |
| `--border` | `#000000` | All borders |
| `--muted` | `#737373` | Secondary text |
| `--muted-foreground` | `#525252` | Tertiary text |

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display/Headings | Space Mono | 700 | Monospace, uppercase, tight tracking |
| Body | Work Sans | 400-600 | Sans-serif, readable |
| Labels | Space Mono | 700 | xs size, uppercase, wide tracking |
| Code | Space Mono | 400 | Monospace |

**Font Loading:** Google Fonts CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-retro` | `2px 2px 0px 0px rgba(0,0,0,1)` | Cards, buttons, containers |
| `--shadow-retro-sm` | `1px 1px 0px 0px rgba(0,0,0,1)` | Small elements, badges |

### Border Radius

| Token | Value |
|-------|-------|
| Default | `0.5rem` (8px) |
| `lg` | `0.75rem` (12px) |
| `xl` | `1rem` (16px) |
| `full` | `9999px` |

---

## Component Patterns

### Neo-Brutalist Signature

All interactive elements follow this pattern:
- 2px solid black border
- 2px offset shadow (bottom-right)
- On press: translate(1px, 1px) + remove shadow

```css
.neo-brutalist {
  border: 2px solid #000000;
  box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
  transition: all 0.15s ease;
}

.neo-brutalist:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
```

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | `#FFD166` | `#000000` | `#000000` |
| Secondary | `#FFFFFF` | `#000000` | `#000000` |
| Ghost | `transparent` | `#000000` | `#000000` |
| Destructive | `#FEE2E2` | `#991B1B` | `#000000` |

### Cards

- Background: `#FFFFFF`
- Border: 2px solid `#000000`
- Shadow: `2px 2px 0px 0px rgba(0,0,0,1)`
- Border radius: `0.75rem`
- Padding: `1.5rem`

### Form Inputs

- Background: `#FFFFFF`
- Border: 2px solid `#000000`
- Focus: Border color changes to `#FFD166`
- No shadow on inputs
- Border radius: `0.5rem`

### Badges/Pills

- Border: 2px solid `#000000`
- Font: Space Mono, bold, xs, uppercase
- Padding: `0.25rem 0.5rem`
- Border radius: `0.5rem`

### Alerts

| Type | Background | Text | Icon BG |
|------|------------|------|---------|
| Success | `#DCFCE7` | `#166534` | `#22C55E` |
| Warning | `#FFD166` | `#000000` | `rgba(0,0,0,0.1)` |
| Error | `#FEE2E2` | `#991B1B` | `#EF4444` |
| Info | `#DBEAFE` | `#1E40AF` | `#3B82F6` |

---

## Files to Modify

### Phase 1: Foundation

| File | Changes |
|------|---------|
| `nextjs/src/app/globals.css` | Replace CSS variables, remove dark mode vars, add base styles |
| `nextjs/tailwind.config.ts` | Add colors, fonts, shadows, border radius |
| `nextjs/src/app/layout.tsx` | Add Google Fonts link |

### Phase 2: UI Primitives

| Component | Priority | Notes |
|-----------|----------|-------|
| `button.tsx` | High | Most used, add press animation |
| `card.tsx` | High | Container pattern |
| `input.tsx` | High | Form foundation |
| `badge.tsx` | High | Tags, status indicators |
| `alert.tsx` | Medium | Notifications |
| `dialog.tsx` | Medium | Modals |
| `dropdown-menu.tsx` | Medium | Menus |
| `select.tsx` | Medium | Form selects |
| `checkbox.tsx` | Medium | Form checkboxes |
| `switch.tsx` | Medium | Toggles |
| `tabs.tsx` | Medium | Navigation |
| `toast.tsx` | Medium | Notifications |
| `skeleton.tsx` | Low | Loading states |
| `separator.tsx` | Low | Dividers |

### Phase 3: Application Components

- Remove all `dark:` class prefixes
- Apply retro styles to custom components
- Update color references from old palette

**Key areas:**
- Recipe cards
- Meal planner grid
- Shopping list
- Settings pages
- Navigation/sidebar
- Marketing pages

---

## Removed Features

- Dark mode toggle
- Dark mode CSS variables
- All `dark:` Tailwind classes
- Previous color palette (Pale Lilac system)

---

## Success Criteria

1. All pages render with warm beige background
2. All interactive elements have retro borders and shadows
3. Typography uses Space Mono (headings) and Work Sans (body)
4. No dark mode references remain in codebase
5. Press animations work on buttons and clickable cards
6. Form inputs have yellow focus states
