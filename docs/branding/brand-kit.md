# Babe, What's for Dinner? — Brand Kit

> Single source of truth for the BWFD brand system.

---

## Quick Reference

| Element | Value |
|---------|-------|
| **Primary Font** | Manrope (400-800) |
| **Script Font** | Caveat (decorative) |
| **Serif Font** | Cormorant Garamond (optional) |
| **Background** | Ivory `#FFFCF9` |
| **Accent** | Pale Lilac `#DDC3E0` |
| **Illustrations** | Chestnut `#7D4A5A` |
| **Text/UI** | Black `#000000` |

---

## Brand Personality

**Together** — Built for couples and families who cook together.

**Warmth** — Every interaction feels personal and inviting.

**Simplicity** — Removes friction from meal planning.

---

## Color Palette

### Brand Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Ivory | `#FFFCF9` | `--color-ivory` | Backgrounds, cards |
| Pale Lilac | `#DDC3E0` | `--color-pale-lilac` | Accent, highlights, CTAs |
| Pale Lilac Light | `#EBD9ED` | `--color-pale-lilac-light` | Hover states |
| Pale Lilac Dark | `#C9A8CD` | `--color-pale-lilac-dark` | Pressed states |
| Chestnut | `#7D4A5A` | `--color-chestnut` | Illustrations only |
| Black | `#000000` | `--color-black` | Text, buttons, UI |
| White | `#FFFFFF` | `--color-white` | Card backgrounds |

### Gray Scale

| Name | Hex | Usage |
|------|-----|-------|
| Gray 100 | `#F7F5F6` | Subtle backgrounds |
| Gray 200 | `#E8E4E8` | Borders, dividers |
| Gray 300 | `#D1CCD1` | Disabled borders |
| Gray 400 | `#9E979E` | Placeholder text |
| Gray 500 | `#6B636B` | Secondary text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#2D5A2D` | Positive actions |
| Success Light | `#E8F0E8` | Success backgrounds |
| Warning | `#5A4A2D` | Caution states |
| Warning Light | `#FDF5ED` | Warning backgrounds |
| Error | `#5A2D2D` | Destructive actions |
| Error Light | `#FDEDED` | Error backgrounds |

### Cook Assignment Colors

| Cook | Hex | Name |
|------|-----|------|
| Cook 1 | `#000000` | Black |
| Cook 2 | `#4A7C59` | Forest |
| Cook 3 | `#8B6914` | Amber |
| Cook 4 | `#2E5984` | Navy |
| Cook 5 | `#6B4A7C` | Plum |

---

## Typography

### Font Families

```css
--font-primary: 'Manrope', sans-serif;    /* Headlines, body, UI */
--font-script: 'Caveat', cursive;          /* Decorative, logo */
--font-serif: 'Cormorant Garamond', serif; /* Recipe titles (optional) */
```

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
```

### Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 36px (2.25rem) | 700 | Page titles |
| H2 | 24px (1.5rem) | 500 | Section titles |
| Body | 16px (1rem) | 400 | Paragraphs |
| Small | 14px (0.875rem) | 400 | Labels, hints |
| XS | 12px (0.75rem) | 400 | Timestamps |
| Script | 30px (1.875rem) | 400 | Decorative accents |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Related items |
| `--space-3` | 12px | Button padding |
| `--space-4` | 16px | Standard gap |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Between sections |
| `--space-12` | 48px | Page sections |
| `--space-16` | 64px | Major sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Subtle |
| `--radius-md` | 8px | Inputs |
| `--radius-lg` | 12px | Buttons, meal slots |
| `--radius-xl` | 16px | Cards |
| `--radius-2xl` | 24px | Sections |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08)` | Hover states |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Modals |

---

## Components

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | Black | White | None |
| Secondary | Pale Lilac | Black | None |
| Outline | Transparent | Black | 2px Black |
| Ghost | Transparent | Black | None |

### Form Inputs

- Background: White
- Border: 2px Gray 200
- Focus Border: Black
- Focus Shadow: Pale Lilac Light glow

### Cards

- Background: Ivory
- Border: 1px Gray 200
- Radius: XL (16px)
- Hover: Shadow LG + translateY(-2px)

### Badges

| Variant | Background | Text |
|---------|------------|------|
| Primary | Black | White |
| Secondary | Pale Lilac | Black |
| Outline | Transparent | Black (1px border) |

---

## Logo

### Versions

1. **Horizontal**: `Babe, What's for Dinner?` — Primary use
2. **Stacked**: Multi-line for square formats
3. **Short form**: `BWFD` — App icons, favicons

### Logo Font

Always use **Caveat** (script font) for the logo.

### Color Variations

| Background | Logo Color |
|------------|------------|
| Ivory | Black |
| Pale Lilac | Black |
| Chestnut | White |
| Black | White |

---

## Illustrations

- **Color**: Chestnut `#7D4A5A` only (single color)
- **Style**: Hand-drawn, sketchy strokes
- **Stroke width**: 2-3px
- **Line caps**: Rounded
- **Feel**: Warm, personal, approachable

---

## Design Rules

1. **Text is always black** — Headers, body, labels
2. **Primary buttons are black** — White text
3. **Secondary buttons use Pale Lilac** — Black text
4. **Illustrations use Chestnut only** — Single color, hand-drawn
5. **Script font for decorative elements** — Logo, playful callouts
6. **Ivory for backgrounds** — White for cards
7. **High contrast** — Clean, editorial feel
8. **Soft shadows** — No hard offsets

---

## Files Reference

| File | Purpose |
|------|---------|
| `/Branding/BRAND-SYSTEM-COMPLETE.md` | Original brand documentation |
| `/Branding/design-tokens-complete.css` | CSS custom properties |
| `/Branding/bwfd-brand-guidelines-complete.html` | Visual HTML guide |
| `src/app/globals.css` | Implementation |
| `src/lib/brand/colors.ts` | TypeScript exports |

---

*Babe, What's for Dinner? — Meal planning for couples and families who actually cook together.*
