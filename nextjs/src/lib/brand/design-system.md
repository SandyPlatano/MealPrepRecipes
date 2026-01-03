# What's for Dinner? - Design System

> **Warm & Cozy** design system for a meal planning app that helps you save money on groceries.
> This document is the single source of truth for all UI implementation.

---

## Design Philosophy

| Aspect | Description |
|--------|-------------|
| **Vibe** | Warm & Cozy - approachable, practical, inviting |
| **Structure** | Clean, modular, professional (Zaplytic-inspired) |
| **Interactions** | Soft & Smooth - gentle transitions, rounded corners |

---

## Color Palette

### Brand Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--color-primary` | `#1A1A1A` | `0 0% 10%` | Buttons, text, dark elements |
| `--color-brand-primary` | `#D9F99D` | `75 91% 80%` | Accent highlights, CTAs, selection states |
| `--color-brand-yellow` | `#FDE047` | `47 96% 64%` | Charts, secondary highlights |
| `--color-brand-purple` | `#EDE9FE` | `251 91% 95%` | Feature card backgrounds |
| `--color-brand-orange` | `#FFF0E6` | `27 100% 95%` | Feature card backgrounds |

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background` | `#F5F5F0` | Page background (subtle warm gray) |
| `--color-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--color-muted` | `#F3F4F6` | Subtle backgrounds |

### Visual Hierarchy (3-Tier System)

The app uses a 3-tier depth system to create clear visual hierarchy:

| Tier | Color | Shadow | Usage |
|------|-------|--------|-------|
| 1 - Page | `#F5F5F0` | none | Page background |
| 2 - Container | `#FAFAF8` | `shadow-md` | Day cards, section containers |
| 3 - Content | `#FFFFFF` | `shadow-lg` | Recipe cards (hero elements) |

**Recipe Card Styling:**
```tsx
// Tier 3 - Hero element with lime accent
className="bg-white rounded-2xl border border-gray-100
  border-l-4 border-l-[#D9F99D]        // Lime left accent
  shadow-lg                             // Strong shadow
  hover:shadow-2xl hover:-translate-y-2 // Dramatic hover
  hover:ring-2 hover:ring-[#D9F99D]/30" // Lime glow
```

**Day Container Styling:**
```tsx
// Tier 2 - Section containers
className="bg-[#FAFAF8] shadow-md"
```

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-foreground` | `#1A1A1A` | Primary text |
| `--color-muted-foreground` | `#4B5563` | Secondary text, labels |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border` | `#E5E7EB` | Subtle borders, dividers |

### Sidebar (Warm Dark)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-sidebar-bg` | `#1E293B` | Sidebar background (slate-800) |
| `--color-sidebar-surface` | `#334155` | Elevated sidebar elements (slate-700) |
| `--color-sidebar-border` | `#475569` | Sidebar borders (slate-600) |
| `--color-sidebar-text` | `#E2E8F0` | Sidebar text (slate-200) |
| `--color-sidebar-text-muted` | `#94A3B8` | Sidebar secondary text (slate-400) |

### Footer (Warm Dark)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-footer-bg` | `#1E293B` | Footer background (slate-800) |
| `--color-footer-text` | `#94A3B8` | Footer body text (slate-400) |
| `--color-footer-title` | `#F1F5F9` | Footer headings (slate-100) |

### Semantic Colors

| Type | Default | Light | Dark |
|------|---------|-------|------|
| Success | `#10B981` | `#D1FAE5` | `#065F46` |
| Warning | `#F59E0B` | `#FEF3C7` | `#92400E` |
| Error | `#EF4444` | `#FEE2E2` | `#991B1B` |
| Info | `#3B82F6` | `#DBEAFE` | `#1E40AF` |

---

## Typography

### Font Stack

```css
--font-display: "Plus Jakarta Sans", "Nunito", system-ui, sans-serif;
--font-body: "Plus Jakarta Sans", "Nunito", system-ui, sans-serif;
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Subtle emphasis |
| Semibold | 600 | Subheadings, labels |
| Bold | 700 | Headings |
| Extrabold | 800 | Hero headings |

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem | 1rem | Fine print, badges |
| `text-sm` | 0.875rem | 1.25rem | Secondary text, captions |
| `text-base` | 1rem | 1.5rem | Body text |
| `text-lg` | 1.125rem | 1.75rem | Lead paragraphs |
| `text-xl` | 1.25rem | 1.75rem | Subheadings |
| `text-2xl` | 1.5rem | 2rem | Section headings |
| `text-3xl` | 1.875rem | 2.25rem | Page headings |
| `text-4xl` | 2.25rem | 2.5rem | Hero text (mobile) |
| `text-5xl` | 3rem | 1.1 | Hero text (tablet) |
| `text-6xl` | 3.75rem | 1.1 | Hero text (desktop) |

### Heading Styles

```tsx
// Hero heading
<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">

// Section heading
<h2 className="text-3xl md:text-4xl font-bold">

// Card heading
<h3 className="text-xl font-semibold">
```

---

## Spacing

Use Tailwind's default spacing scale. Key values:

| Token | Value | Usage |
|-------|-------|-------|
| `4` | 1rem | Base unit, component padding |
| `6` | 1.5rem | Card padding |
| `8` | 2rem | Section gaps |
| `12` | 3rem | Large gaps |
| `16` | 4rem | Section padding (vertical) |
| `20` | 5rem | Large section padding |
| `24` | 6rem | Hero section padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 0.5rem | Default, inputs |
| `rounded-lg` | 0.75rem | Cards |
| `rounded-xl` | 1rem | Feature cards |
| `rounded-2xl` | 1.5rem | Large cards, accent sections |
| `rounded-full` | 9999px | Buttons, pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, hero cards |

---

## Components

### Primary Button

```tsx
<button className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold
  hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 group">
  Get started
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</button>
```

**Variants:**
- Default: Dark background, white text
- Outline: Transparent bg, dark border
- Ghost: Transparent, text only
- Accent: Lime background, dark text

### Card

```tsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  {/* Card content */}
</div>
```

**Variants:**
- Default: White background
- Elevated: With shadow-lg
- Accent Yellow: `bg-[#FFF6D8]`
- Accent Purple: `bg-[#EDE9FE]`
- Accent Orange: `bg-[#FFF0E6]`

### Input

```tsx
<input className="w-full px-4 py-3 rounded-lg border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-[#D9F99D] focus:border-transparent
  transition-all duration-200" />
```

### Badge/Pill

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full
  bg-[#D9F99D] text-sm font-medium text-gray-900">
  New
</span>
```

### Timeline Number

```tsx
<div className="flex items-center justify-center w-12 h-12
  bg-white rounded-full border border-gray-100 shadow-sm">
  <span className="text-sm font-bold text-gray-400">01</span>
</div>
```

---

## Section Patterns

### Trust Strip

```tsx
<section className="bg-[#EFFFE3] dark:bg-[#1A2E1A] py-6">
  <div className="container mx-auto px-4 text-center">
    {/* Trust content */}
  </div>
</section>
```

### CTA Section

```tsx
<section className="bg-[#E4F8C9] dark:bg-gray-800 py-24 relative overflow-hidden">
  {/* Decorative elements */}
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
      Ready to answer "What's for dinner?" forever?
    </h2>
    <p className="text-gray-700 max-w-2xl mx-auto mb-10">
      {/* Subtext */}
    </p>
    <Button>Get started free</Button>
  </div>
</section>
```

### Feature Timeline

```tsx
<section className="py-24">
  <div className="container mx-auto px-4">
    {/* Alternating left/right cards with timeline numbers */}
  </div>
</section>
```

### Footer

```tsx
<footer className="bg-[#1E293B] text-[#94A3B8] pt-20 pb-8">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
      {/* Logo + description + social */}
      {/* Link columns */}
    </div>
    <div className="pt-8 border-t border-slate-700 text-center text-xs">
      {/* Copyright */}
    </div>
  </div>
</footer>
```

---

## Animations & Transitions

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `duration-150` | 150ms | Micro interactions (hovers) |
| `duration-200` | 200ms | Default transitions |
| `duration-300` | 300ms | Larger transitions |
| `duration-500` | 500ms | Page transitions |

### Easing

```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-out */
```

### Common Patterns

```tsx
// Hover lift
className="transition-transform duration-200 hover:-translate-y-1"

// Button arrow
className="group-hover:translate-x-1 transition-transform"

// Fade in
className="animate-fade-in"

// Scale on hover
className="transition-transform duration-200 hover:scale-105"
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Common Patterns

```tsx
// Hero text sizing
className="text-4xl md:text-5xl lg:text-6xl"

// Grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Padding
className="px-4 md:px-8 lg:px-12"
```

---

## Dark Mode

The app supports dark mode via the `.dark` class on `<html>`.

**Key differences:**
- Background: `#0F172A` (slate-900)
- Surface: `#1E293B` (slate-800)
- Text: `#F8FAFC` (slate-50)
- Accent backgrounds darken appropriately

**Note:** Sidebar and footer are always dark, regardless of theme.

---

## Decorative Elements

### Star/Sparkle SVG

```tsx
<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path
    d="M20 0L24.49 15.51L40 20L24.49 24.49L20 40L15.51 24.49L0 20L15.51 15.51L20 0Z"
    fill="currentColor"
  />
</svg>
```

### Organic Shape (Scribble)

Use hand-drawn style SVG paths with stroke-only, opacity-20 for subtle decoration.

---

## Accessibility

- All interactive elements must have visible focus states
- Color contrast must meet WCAG AA (4.5:1 for normal text)
- Use semantic HTML elements
- Provide aria-labels for icon-only buttons
- Ensure keyboard navigation works

### Focus States

```tsx
className="focus:outline-none focus:ring-2 focus:ring-[#D9F99D] focus:ring-offset-2"
```

---

## Component Architecture

We follow **Atomic Design** principles for component organization:

```
src/components/
│
├── ui/                    # ATOMS - shadcn/ui primitives (installed via CLI)
│   ├── button.tsx         # Base interactive elements
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── checkbox.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
│
├── shared/                # MOLECULES - Reusable compositions
│   ├── tag-list.tsx       # Tag display with remove option
│   ├── serving-adjuster.tsx  # +/- serving controls
│   ├── search-input.tsx   # Search with icon and clear
│   ├── loading-state.tsx  # Loading spinners and skeletons
│   └── index.ts           # Barrel exports
│
├── recipes/               # ORGANISMS - Recipe-related
│   ├── recipe-card.tsx
│   ├── recipe-grid.tsx
│   ├── recipe-detail.tsx
│   ├── recipe-form.tsx
│   ├── ingredient-list.tsx
│   └── instruction-steps.tsx
│
├── meal-plan/             # ORGANISMS - Meal planning
│   ├── week-view.tsx
│   ├── day-column.tsx
│   ├── meal-slot.tsx
│   ├── meal-slot-empty.tsx
│   └── calendar-nav.tsx
│
├── shopping-list/         # ORGANISMS - Shopping
│   ├── shopping-list.tsx
│   ├── shopping-item.tsx
│   ├── aisle-group.tsx
│   └── shopping-summary.tsx
│
├── layout/                # TEMPLATES - Layout components
│   ├── header.tsx
│   ├── sidebar/           # Sidebar components
│   ├── mobile-nav.tsx
│   └── page-container.tsx
│
├── landing/               # Marketing page components
│   ├── hero-section.tsx
│   ├── features-timeline.tsx
│   ├── cta-section.tsx
│   └── footer.tsx
│
└── branding/              # Logo, brand elements
    └── logo.tsx
```

### Import Patterns

```tsx
// Atoms - from ui/
import { Button, Card, Badge } from '@/components/ui'

// Molecules - from shared/
import { TagList, SearchInput, LoadingState } from '@/components/shared'

// Organisms - from feature folders
import { RecipeCard, RecipeGrid } from '@/components/recipes'
import { WeekView, MealSlot } from '@/components/meal-plan'
```

---

## File Structure

```
src/lib/brand/
├── colors.ts          # Color constants and utilities
├── design-system.md   # This document
└── index.ts           # Barrel exports
```

---

## Usage with shadcn/ui

shadcn/ui components are customized to match this design system:

1. **Colors** are mapped through CSS variables in `globals.css`
2. **Border radius** uses `rounded-lg` default
3. **Buttons** are customized to be pill-shaped when appropriate
4. **Cards** use our shadow and border conventions

When adding new shadcn components, update their default classes to match this system.

---

## Quick Reference

### Most Used Classes

```tsx
// Page background
className="bg-background"

// Card
className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"

// Primary button
className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold"

// Accent section
className="bg-[#E4F8C9] py-24"

// Section heading
className="text-3xl md:text-4xl font-bold text-gray-900"

// Body text
className="text-gray-600 text-lg"

// Muted text
className="text-gray-500 text-sm"
```

---

*Last updated: January 2026*
*Design system version: 2.0 (Warm & Cozy)*
