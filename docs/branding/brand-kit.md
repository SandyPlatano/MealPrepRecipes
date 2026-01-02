# Babe, What's for Dinner? — Brand Kit

> Single source of truth for the BWFD brand system.
> **Design System:** Warm & Cozy

---

## Quick Reference

| Element | Value |
|---------|-------|
| **Primary Font** | Plus Jakarta Sans |
| **Background** | Warm Off-White `#FFFCF6` |
| **Accent** | Lime Green `#D9F99D` |
| **Secondary** | Yellow `#FDE047` |
| **Text/UI** | Near Black `#1A1A1A` |
| **Border Style** | `border border-gray-200` (1px subtle) |
| **Shadows** | Soft (`shadow-sm`, `shadow-md`) |
| **Border Radius** | `rounded-xl` cards, `rounded-full` buttons |

---

## Brand Personality

**Together** — Built for couples and families who cook together.

**Warmth** — Every interaction feels personal and inviting.

**Simplicity** — Removes friction from meal planning.

---

## Color Palette

### Primary Colors

| Name | Hex | HSL | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Background | `#FFFCF6` | `40 100% 99%` | `--color-background` | Page background (warm off-white) |
| Foreground | `#1A1A1A` | `0 0% 10%` | `--color-foreground` | Primary text, dark elements |
| Lime Accent | `#D9F99D` | `75 91% 80%` | `--color-brand-primary` | CTAs, highlights, selection states |
| Yellow Accent | `#FDE047` | `47 96% 64%` | `--color-brand-yellow` | Charts, secondary highlights |

### Surfaces

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Surface | `#FFFFFF` | `--color-surface` | Cards, modals, elevated surfaces |
| Muted | `#F3F4F6` | `--color-muted` | Subtle backgrounds |

### Text

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary Text | `#1A1A1A` | `--color-foreground` | Headings, body text |
| Secondary Text | `#4B5563` | `--color-muted-foreground` | Labels, captions |

### Borders

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Border | `#E5E7EB` | `--color-border` | Subtle borders, dividers |

### Accent Backgrounds

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Purple Accent | `#EDE9FE` | `--color-brand-purple` | Feature card backgrounds |
| Orange Accent | `#FFF0E6` | `--color-brand-orange` | Feature card backgrounds |
| Lime Accent BG | `#EFFFE3` | N/A | Trust strip, CTA sections (light) |
| Lime Accent Strong | `#E4F8C9` | N/A | CTA sections (darker) |

### Always-Dark Elements

#### Sidebar

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Sidebar BG | `#0D1117` | `--color-sidebar-bg` | Sidebar background |
| Sidebar Surface | `#161B22` | `--color-sidebar-surface` | Elevated sidebar elements |
| Sidebar Border | `#30363D` | `--color-sidebar-border` | Sidebar borders |
| Sidebar Text | `#F0F6FC` | `--color-sidebar-text` | Sidebar text |
| Sidebar Text Muted | `#8B949E` | `--color-sidebar-text-muted` | Secondary text |

#### Footer

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Footer BG | `#0D1117` | `--color-footer-bg` | Footer background |
| Footer Text | `#9CA3AF` | `--color-footer-text` | Footer body text |
| Footer Title | `#FFFFFF` | `--color-footer-title` | Footer headings |

### Semantic Colors

| Type | Default | Light BG | Dark Variant |
|------|---------|----------|--------------|
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

**Primary:** Plus Jakarta Sans (modern, friendly, professional)
**Fallback:** Nunito (similar characteristics)

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

Soft, subtle shadows for depth without harshness.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, hero cards |

---

## Border Style

**Soft & Subtle** — Use `border border-gray-200` for most elements (1px subtle borders).

```tsx
// Card example
className="border border-gray-200"

// NOT: border-2 border-black (too harsh)
```

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
- Default: Dark background (`#1A1A1A`), white text
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
- Elevated: With `shadow-lg`
- Accent Yellow: `bg-[#FFF6D8]`
- Accent Purple: `bg-[#EDE9FE]`
- Accent Orange: `bg-[#FFF0E6]`

### Input

```tsx
<input className="w-full px-4 py-3 rounded-lg border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-[#D9F99D] focus:border-transparent
  transition-all duration-200" />
```

**Focus State:** Lime ring (`focus:ring-[#D9F99D]`)

### Badge/Pill

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full
  bg-[#D9F99D] text-sm font-medium text-gray-900">
  New
</span>
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

### Footer

```tsx
<footer className="bg-[#0D1117] text-gray-400 pt-20 pb-8">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
      {/* Logo + description + social */}
      {/* Link columns */}
    </div>
    <div className="pt-8 border-t border-gray-800 text-center text-xs">
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

## Dark Mode

The app supports dark mode via the `.dark` class on `<html>`.

**Key differences:**
- Background: `#0F172A` (slate-900)
- Surface: `#1E293B` (slate-800)
- Text: `#F8FAFC` (slate-50)
- Accent backgrounds darken appropriately

**Note:** Sidebar and footer are always dark, regardless of theme.

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

## Quick Reference Classes

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

## Files Reference

| File | Purpose |
|------|---------|
| `nextjs/src/lib/brand/design-system.md` | Complete design system documentation |
| `nextjs/src/lib/brand/colors.ts` | TypeScript color exports |
| `nextjs/src/app/globals.css` | CSS implementation |
| `nextjs/tailwind.config.ts` | Tailwind configuration |

---

*Last updated: January 2026*
*Design system: Warm & Cozy v2.0*
