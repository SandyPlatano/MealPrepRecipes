# Meal Prep OS - Design Reference (PostHog-Inspired)

## Design Philosophy

PostHog's design is **playful, bold, irreverent, and personality-driven**. It feels like a startup made by people who actually have fun, not a sterile enterprise tool. Key principles:

1. **Personality over polish** - Hand-drawn elements, quirky illustrations, bold statements
2. **Dark mode first** - Rich, warm dark backgrounds (not pure black)
3. **Bold accent colors** - Bright reds/oranges that pop
4. **Playful typography** - Mix of clean sans-serif with quirky display fonts
5. **Mascot-driven** - The hedgehog (Max) appears everywhere with personality
6. **Conversational tone** - UI copy is human, funny, direct

---

## Color Palette

### Primary Background (Dark Mode)
```css
--bg-dark: #1D1F27;          /* Main background - warm dark */
--bg-dark-lighter: #2C2E38;  /* Cards, elevated surfaces */
--bg-dark-accent: #35363F;   /* Borders, subtle highlights */
--bg-cream: #EEEFE9;         /* Light mode / contrast sections */
--bg-cream-light: #FDFDF8;   /* Lightest cream */
```

### Accent Colors (Bold & Playful)
```css
--accent-red: #F54E00;       /* Primary CTA, energy */
--accent-orange: #EB9D2A;    /* Warnings, highlights */
--accent-yellow: #F7A501;    /* Stars, achievements */
--accent-blue: #2F80FA;      /* Links, info */
--accent-purple: #A621C8;    /* Premium, special */
--accent-green: #6AA84F;     /* Success, positive */
--accent-pink: #E34C6F;      /* Love, favorites */
```

### Text Colors
```css
--text-primary: #EEEFE9;     /* Main text on dark */
--text-secondary: #9A9DA5;   /* Muted text */
--text-dark: #1D1F27;        /* Text on light backgrounds */
```

---

## Typography

### Font Stack
```css
--font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Squeak', 'Comic Neue', cursive;  /* Playful headers */
--font-mono: 'IBM Plex Mono', 'Source Code Pro', monospace;
```

### Usage
- **Body text**: IBM Plex Sans, 16px, normal weight
- **Headings**: IBM Plex Sans Bold or Squeak for playful sections
- **UI elements**: IBM Plex Sans Medium, 14px
- **Code/data**: IBM Plex Mono

### Personality Typography
- Use **sentence case** for buttons ("Get started" not "GET STARTED")
- Conversational UI copy ("Oops! That didn't work" not "Error 500")
- Emoji usage is encouraged but not overdone

---

## Component Patterns

### Buttons
```css
/* Primary - Bold red/orange */
.btn-primary {
  background: linear-gradient(to bottom, #F54E00, #E04400);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  padding: 10px 20px;
  box-shadow: 0 2px 0 #B33600;  /* Bottom shadow for depth */
}

/* Secondary - Outlined on dark */
.btn-secondary {
  background: transparent;
  border: 2px solid #EEEFE9;
  color: #EEEFE9;
  border-radius: 6px;
}

/* Ghost - Minimal */
.btn-ghost {
  background: transparent;
  color: #EEEFE9;
  text-decoration: underline;
}
```

### Cards
```css
.card {
  background: #2C2E38;
  border: 1px solid #35363F;
  border-radius: 12px;
  padding: 24px;
}

/* With accent border */
.card-accent {
  border-left: 4px solid #F54E00;
}

/* With gradient glow */
.card-glow {
  box-shadow: 0 0 40px rgba(245, 78, 0, 0.15);
}
```

### Hand-Drawn Elements
- Squiggly underlines under important text
- Doodle-style icons alongside hedgehog illustrations
- Rough, sketchy borders on feature sections
- Stars, sparkles, and motion lines

---

## Layout Patterns

### Hero Sections
- Large, bold headline (48-72px)
- Playful subheading with personality
- Prominent CTA button
- Hedgehog illustration to the side
- Gradient or textured background

### Feature Grids
- 2-3 column grids with generous spacing
- Each card has icon + headline + short description
- Alternating accent colors for visual interest

### Content Sections
- Alternating light/dark backgrounds for rhythm
- Generous whitespace (40-80px padding)
- Asymmetric layouts feel more human

---

## Mascot Guidelines (Tootsie the Owl → PostHog Style)

### Character Traits
- **Bold black outline** with consistent stroke width
- **Expressive eyebrows** for emotion
- **Simple shapes** - not overly detailed
- **Always facing the user** (front or 3/4 view)
- **Warm colors** - beige/tan body with brown accents

### Expressions
- Happy/Excited: Big eyes, raised eyebrows
- Confused: One eyebrow up, head tilt
- Proud: Chest out, slight smirk
- Hungry: Heart eyes or drooling

### Poses
- Waving hello
- Pointing at something
- Holding food/utensils
- Celebrating with confetti

---

## Dark Mode Implementation

PostHog is dark-mode-first. The dark theme should feel:
- **Warm**, not cold (hint of brown/purple in blacks)
- **High contrast** with bright accents
- **Cozy**, like a comfortable workspace at night

```css
:root {
  --background: #1D1F27;
  --foreground: #EEEFE9;
  --card: #2C2E38;
  --border: #35363F;
  --primary: #F54E00;
  --primary-foreground: #FFFFFF;
}
```

---

## Animation & Interaction

### Micro-interactions
- Buttons: Slight scale (1.02) on hover, press down on click
- Cards: Subtle lift with shadow on hover
- Icons: Wiggle or bounce on interaction

### Transitions
- Duration: 150-200ms
- Easing: ease-out for most, spring for playful elements

### Keyframes (from PostHog)
```css
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes grow {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## Voice & Tone

### UI Copy Examples
- **Button**: "Let's cook!" not "Submit"
- **Empty state**: "No recipes yet? Let's fix that!" not "No items found"
- **Error**: "Whoops! Something went sideways" not "Error occurred"
- **Success**: "Nailed it!" not "Success"
- **Loading**: "Tootsie is thinking..." not "Loading..."

### Headlines
- Use questions: "What's for dinner tonight?"
- Be direct: "Meal prep that doesn't suck"
- Add personality: "Your kitchen, turbocharged"

---

## Key Differences from Windows 95 Style

| Aspect | Windows 95 (Old) | PostHog Style (New) |
|--------|------------------|---------------------|
| Background | Teal desktop | Warm dark (#1D1F27) |
| Borders | Beveled 3D | Subtle, rounded |
| Colors | System grays | Bold red/orange accents |
| Typography | Pixel fonts | Modern sans (IBM Plex) |
| Personality | Nostalgic | Playful & irreverent |
| Illustrations | Pixel art | Hand-drawn style |
| Layout | Windows/panels | Cards with generous space |

---

## Sources
- [PostHog Brand Assets](https://posthog.com/handbook/company/brand-assets)
- [Designing PostHog Website](https://posthog.com/handbook/brand/designing-posthog-website)
- [PostHog Hedgehog Design](https://posthog.com/blog/drawing-hedgehogs)
- [Vibe Design Guide](https://posthog.com/newsletter/vibe-designing)
