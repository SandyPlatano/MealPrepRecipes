# Babe - Master Design Specification

## Critical Failures to Avoid

**DO NOT:**
- Use emojis as design elements (looks cheap and AI-generated)
- Use oversaturated gradients (looks amateur)
- Use playful/bubbly fonts like Nunito, Quicksand, Comic Sans
- Create busy layouts with too many elements
- Use generic "AI slop" patterns (purple gradients, Inter font, predictable layouts)
- Fake app mockups with emoji placeholders
- Heavy drop shadows
- Floating animated elements that distract from content

---

## Primary Design References

### 1. Brainfish (brainfishai.com) - LAYOUT & PERSONALITY
**What we take:** Friendly personality, soft color palette, subtle floating decorations, professional-but-approachable tone

**Key observations:**
- Background: Very subtle sky-blue gradient (#e8f4f8 → #f0f9ff → white), almost imperceptible
- Mascot: Custom vector illustration (fish characters), NOT emojis
- Typography: Clean sans-serif (appears to be Inter or similar), professional not playful
- CTAs: Lime/yellow-green (#84cc16 or similar), solid not gradient
- Cards: Clean white with subtle shadows, generous padding
- Decorations: Subtle vector clouds, coral/plant elements at page bottom - very restrained
- Layout: Generous whitespace, content breathes, not cluttered

### 2. Masakin Food App (Dribbble) - UI POLISH & FOOD AESTHETIC
**What we take:** Clean white UI, beautiful food photography treatment, coral/orange accents, professional card layouts

**Key observations:**
- Background: Pure white (#ffffff), no gradients
- Accent color: Coral/orange (#f97316 or #ff6b6b)
- Typography: Clean sans-serif, readable, professional
- Cards: White with very subtle shadows, large border-radius (16-24px)
- Food images: Beautiful photography with gradient overlays for text legibility
- Category icons: Simple line-art style, not filled emoji-style
- Layout: Grid-based, organized, predictable in a good way
- Navigation: Clean bottom nav with simple icons

---

## Exact Design Specifications

### Color Palette

```css
/* Primary - Soft Sky (from Brainfish) */
--sky-50: #f0f9ff;
--sky-100: #e0f4f8;
--sky-200: #bae6f4;
--sky-gradient: linear-gradient(180deg, #e8f4f8 0%, #f5fafa 50%, #ffffff 100%);

/* Accent - Lime Green (CTAs, from Brainfish) */
--lime-500: #84cc16;
--lime-600: #65a30d;
--lime-hover: #a3e635;

/* Secondary - Coral/Orange (highlights, from Masakin) */
--coral-500: #f97316;
--coral-600: #ea580c;

/* Neutral */
--slate-900: #0f172a;  /* Headlines */
--slate-700: #334155;  /* Body text */
--slate-500: #64748b;  /* Secondary text */
--slate-200: #e2e8f0;  /* Borders */
--slate-50: #f8fafc;   /* Light backgrounds */

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-hero: var(--sky-gradient);
```

### Typography

```css
/* Font Stack - Clean & Professional */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* DO NOT USE: Nunito, Quicksand, Poppins, Comic Sans, or any "friendly" fonts */

/* Type Scale */
--text-hero: 4rem;      /* 64px - Main headline only */
--text-h1: 3rem;        /* 48px */
--text-h2: 2.25rem;     /* 36px */
--text-h3: 1.5rem;      /* 24px */
--text-body: 1rem;      /* 16px */
--text-small: 0.875rem; /* 14px */

/* Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.1;   /* Headlines */
--leading-normal: 1.5;  /* Body */
--leading-relaxed: 1.7; /* Long-form */
```

### Spacing System

```css
/* Use generous whitespace - let the design breathe */
--space-section: 6rem;    /* Between major sections */
--space-block: 3rem;      /* Between content blocks */
--space-element: 1.5rem;  /* Between related elements */
--space-tight: 0.75rem;   /* Tight groupings */

/* Container */
--container-max: 1200px;
--container-padding: 1.5rem;
```

### Component Specifications

#### Hero Section
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Subtle sky gradient background - barely noticeable]               │
│                                                                     │
│        ┌──────────────────────────────────────────────┐            │
│        │  [Small badge: "Your kitchen companion"]     │            │
│        └──────────────────────────────────────────────┘            │
│                                                                     │
│              Babe, what's for dinner?                               │
│              (Large, clean headline - slate-900)                    │
│              "what's for dinner?" in lime-500 or coral-500          │
│                                                                     │
│        Subheading text goes here. Keep it concise,                 │
│        two lines max. Slate-600, regular weight.                   │
│                                                                     │
│        [Start Planning Free]  [See How It Works]                   │
│        (Lime bg, white text)  (White bg, slate border)             │
│                                                                     │
│                    [Mascot illustration area]                       │
│                    (SVG, not emoji - friendly spoon/utensil)       │
│                                                                     │
│  [Subtle decorative elements at edges - clouds or kitchen items]   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Feature Cards
```
┌───────────────────────────────────────┐
│                                       │
│  ┌─────┐                              │
│  │ ◯◯◯ │  <- Simple line icon        │
│  └─────┘     (NOT emoji, NOT filled)  │
│                                       │
│  Feature Title                        │
│  (text-h3, font-semibold, slate-900)  │
│                                       │
│  Description text that explains       │
│  the feature in 2-3 lines max.        │
│  (text-body, slate-600)               │
│                                       │
└───────────────────────────────────────┘

Card styling:
- Background: white
- Border: none or 1px slate-200
- Border-radius: 16px or 20px
- Shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05)
- Padding: 2rem
- Hover: subtle lift (translateY -4px), slightly stronger shadow
```

#### Buttons
```css
/* Primary CTA */
.btn-primary {
  background: var(--lime-500);
  color: white;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;          /* NOT pill-shaped */
  font-weight: 600;
  font-size: 1rem;
  border: none;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--lime-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Secondary CTA */
.btn-secondary {
  background: white;
  color: var(--slate-700);
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid var(--slate-200);
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--slate-300);
  background: var(--slate-50);
}
```

---

## Mascot Guidelines

### Character: Kitchen Spoon/Utensil
- **Style:** Simple vector illustration, not cartoon-y, not emoji
- **Personality:** Friendly, helpful, approachable
- **Colors:** Use brand colors (lime accents, maybe coral cheeks)
- **Usage:** Hero section, empty states, loading states, onboarding
- **DO NOT:** Use 3D renders, realistic images, or emoji substitutes

### Mascot Reference Style
Think of the Brainfish fish mascots:
- Simple shapes
- Flat design with subtle gradients
- Expressive but minimal features (simple eyes, maybe a smile)
- Works at small and large sizes
- Professional enough for a SaaS product

---

## Layout Principles

### 1. Generous Whitespace
Every section should feel like it can breathe. When in doubt, add more space.

### 2. Visual Hierarchy
- One clear focal point per section
- Headlines command attention
- Supporting text is clearly secondary
- CTAs are obvious but not overwhelming

### 3. Content-First
- No decorative elements that don't serve a purpose
- Every element should support the message
- Photography/illustrations should enhance, not distract

### 4. Grid Consistency
- Use a 12-column grid
- Consistent gutters (24px or 32px)
- Align elements to the grid

---

## Animation Guidelines

### Allowed Animations
- Subtle hover states (translateY -2px to -4px)
- Smooth color transitions (0.2s ease)
- Fade-in on scroll (once, subtle)
- Button press feedback (scale 0.98)

### NOT Allowed
- Floating/bouncing elements
- Continuous animations that distract
- Parallax effects
- Heavy entrance animations
- Wiggling or rotating elements

---

## Page Structure

### Landing Page Sections (in order)

1. **Navigation**
   - Logo (wordmark or logo + wordmark)
   - Nav links (Recipes, Meal Plans, Pricing, About)
   - CTA button (Get Started)

2. **Hero**
   - Badge/tagline
   - Main headline with accent color
   - Subheadline (1-2 sentences)
   - Two CTAs (primary + secondary)
   - Mascot or product preview

3. **Social Proof Strip** (optional)
   - Logo cloud or stat highlights
   - Keep subtle, don't overdo

4. **Features Grid**
   - Section headline
   - 3 or 6 feature cards
   - Simple icons, clear copy

5. **Product Preview/How It Works**
   - Show the actual app interface
   - Clean screenshots or illustrations
   - Brief explanatory text

6. **Testimonial** (optional)
   - Single impactful quote
   - Clean, understated design

7. **Final CTA**
   - Repeat the value proposition
   - Strong call to action

8. **Footer**
   - Logo
   - Navigation links
   - Legal links
   - Keep minimal

---

## What Success Looks Like

The final design should feel:
- **Clean:** Like Masakin - organized, professional, polished
- **Friendly:** Like Brainfish - approachable, warm, inviting
- **Trustworthy:** Not gimmicky, not try-hard
- **Modern:** Current design trends without being trendy
- **Appetizing:** Makes you want to cook (warm, inviting colors)

When someone lands on this page, they should think:
"This looks like a professional product I can trust, but also feels friendly and approachable - not corporate or cold."

---

## Implementation Checklist

Before shipping, verify:
- [ ] No emojis used as design elements
- [ ] Typography is Inter or similar clean sans-serif
- [ ] Colors match the specification exactly
- [ ] Sufficient whitespace between all elements
- [ ] Animations are subtle and purposeful
- [ ] Icons are line-art style, not filled/emoji
- [ ] Cards have consistent styling
- [ ] Buttons follow the specification
- [ ] Mobile responsive and clean
- [ ] No "AI slop" patterns (purple gradients, generic layouts)

---

## File References

All design reference screenshots located at:
`~/Downloads/Branding Ideas Claude_code/`

Key references:
- `brainfishai.jpg` - Full page screenshot of Brainfish
- `Screenshot_20251219-082143.png` - Brainfish mobile hero
- `Screenshot_20251219-082504.png` through `082525.png` - Masakin app screens
