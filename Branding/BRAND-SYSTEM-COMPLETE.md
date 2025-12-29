# Babe, What's for Dinner? — Brand System

> Complete brand identity documentation for Claude Code reference.

---

## Quick Reference

| Element | Value |
|---------|-------|
| **Primary Font** | Manrope (all weights) |
| **Script Font** | Caveat |
| **Serif Font** | Cormorant Garamond |
| **Colors** | Ivory, Pale Lilac, Chestnut, Black |
| **Primary Lilac** | `#DDC3E0` |
| **Text Color** | Black `#000000` |
| **Illustration Color** | Chestnut `#7D4A5A` |

---

## 1. Brand Personality

**Together** — Built for couples and families who cook together.

**Warmth** — Every interaction feels personal and inviting.

**Simplicity** — Removes friction from meal planning.

---

## 2. Color Palette

### Brand Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Ivory** | `#FFFCF9` | `--color-ivory` | Backgrounds, cards |
| **Pale Lilac** | `#DDC3E0` | `--color-pale-lilac` | Accent, highlights, CTAs |
| **Pale Lilac Light** | `#EBD9ED` | `--color-pale-lilac-light` | Hover states |
| **Pale Lilac Dark** | `#C9A8CD` | `--color-pale-lilac-dark` | Pressed states |
| **Chestnut** | `#7D4A5A` | `--color-chestnut` | Illustrations only |
| **Black** | `#000000` | `--color-black` | Text, buttons, UI |
| **White** | `#FFFFFF` | `--color-white` | Backgrounds |

### Gray Scale

```css
--color-gray-100: #F7F5F6;  /* Subtle backgrounds */
--color-gray-200: #E8E4E8;  /* Borders, dividers */
--color-gray-300: #D1CCD1;  /* Disabled borders */
--color-gray-400: #9E979E;  /* Placeholder text */
--color-gray-500: #6B636B;  /* Secondary text */
```

### Cook Assignment Colors

```css
--color-cook-1: #000000;  /* Black */
--color-cook-2: #4A7C59;  /* Forest */
--color-cook-3: #8B6914;  /* Amber */
--color-cook-4: #2E5984;  /* Navy */
--color-cook-5: #6B4A7C;  /* Plum */
```

---

## 3. Typography

### Font Families

```css
--font-primary: 'Manrope', sans-serif;    /* Headlines, body, UI */
--font-script: 'Caveat', cursive;          /* Decorative, accents */
--font-serif: 'Cormorant Garamond', serif; /* Recipe titles (optional) */
```

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
```

### Type Scale

| Level | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | Manrope | 36px | 700 | Page titles |
| H2 | Manrope | 24px | 500 | Section titles |
| Body | Manrope | 16px | 400 | Paragraphs |
| Small | Manrope | 14px | 400 | Labels, hints |
| XS | Manrope | 12px | 400 | Timestamps |
| Script | Caveat | 30px | 400 | Decorative accents |

### Typography Usage

```css
/* Headlines */
.headline {
  font-family: var(--font-primary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-black);
}

/* Script accent */
.script-accent {
  font-family: var(--font-script);
  font-size: var(--text-3xl);
  color: var(--color-chestnut);
}

/* Body text */
.body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--color-black);
  line-height: var(--leading-normal);
}
```

---

## 4. Logo

### Versions

1. **Horizontal**: `Babe, What's for Dinner?` — Primary use
2. **Stacked**: Multi-line for square formats
3. **Short form**: `BWFD` — App icons, favicons

### Logo Font

Always use **Caveat** (script font) for the logo.

### Clearspace

Maintain clearspace equal to the height of the "B" on all sides.

### Color Variations

| Background | Logo Color |
|------------|------------|
| Ivory | Black |
| Pale Lilac | Black |
| Chestnut | White |
| Black | White |

---

## 5. Illustrations

### Style

- **Color**: Chestnut `#7D4A5A` only (single color)
- **Style**: Hand-drawn, sketchy strokes
- **Stroke width**: 2-3px
- **Line caps**: Rounded
- **Feel**: Warm, personal, approachable

### Subjects

- Cooking pot with steam
- Calendar
- Shopping list
- Hearts (couple motif)
- Food items
- Kitchen utensils

### SVG Example

```html
<svg viewBox="0 0 60 60" fill="none" stroke="#7D4A5A" stroke-width="2.5" stroke-linecap="round">
  <!-- Hand-drawn cooking pot -->
  <path d="M10 45 Q5 45 5 40 L5 20 Q5 10 15 10 L45 10 Q55 10 55 20 L55 40 Q55 45 50 45 Z" fill="none"/>
  <ellipse cx="30" cy="10" rx="20" ry="4" fill="none"/>
</svg>
```

---

## 6. Components

### Buttons

```css
/* Primary - Black */
.btn-primary {
  background: var(--color-black);
  color: var(--color-white);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  border: none;
}

/* Secondary - Pale Lilac */
.btn-secondary {
  background: var(--color-pale-lilac);
  color: var(--color-black);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--color-black);
  border: 2px solid var(--color-black);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-black);
}
```

### Form Inputs

```css
.form-input {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  padding: 12px 16px;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  color: var(--color-black);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px var(--color-pale-lilac-light);
}
```

### Badges

```css
.badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.badge-primary {
  background: var(--color-black);
  color: var(--color-white);
}

.badge-secondary {
  background: var(--color-pale-lilac);
  color: var(--color-black);
}

.badge-outline {
  background: transparent;
  border: 1px solid var(--color-black);
  color: var(--color-black);
}
```

### Cards

```css
.card {
  background: var(--color-ivory);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Meal Slots

```css
.meal-slot {
  background: var(--color-ivory);
  border: 2px dashed var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.meal-slot:hover {
  border-color: var(--color-pale-lilac-dark);
  background: var(--color-pale-lilac-light);
}

.meal-slot.filled {
  border-style: solid;
}
```

### Toggle

```css
.toggle {
  width: 48px;
  height: 26px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
}

.toggle.active {
  background: var(--color-black);
}
```

---

## 7. Spacing

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

## 8. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Subtle |
| `--radius-md` | 8px | Inputs |
| `--radius-lg` | 12px | Buttons, meal slots |
| `--radius-xl` | 16px | Cards |
| `--radius-2xl` | 24px | Sections |
| `--radius-full` | 9999px | Pills, avatars |

---

## 9. Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: '#FFFCF9',
        'pale-lilac': {
          DEFAULT: '#DDC3E0',
          light: '#EBD9ED',
          dark: '#C9A8CD',
        },
        chestnut: '#7D4A5A',
        gray: {
          100: '#F7F5F6',
          200: '#E8E4E8',
          300: '#D1CCD1',
          400: '#9E979E',
          500: '#6B636B',
        },
      },
      fontFamily: {
        primary: ['Manrope', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
}
```

---

## 10. Key Design Rules

1. **Text is always black** — Headers, body, labels
2. **Primary buttons are black** — White text
3. **Secondary buttons use Pale Lilac** — Black text
4. **Illustrations use Chestnut only** — Single color, hand-drawn
5. **Script font for decorative elements** — Logo, playful callouts
6. **Ivory for card backgrounds** — Pale Lilac for accents
7. **High contrast** — Clean, editorial feel

---

## Files Included

1. `bwfd-brand-guidelines-complete.html` — Full visual brand guidelines (27 pages)
2. `design-tokens-complete.css` — CSS custom properties
3. `BRAND-SYSTEM-COMPLETE.md` — This documentation

---

*Babe, What's for Dinner? — Meal planning for couples and families who actually cook together.*
