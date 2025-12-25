# Gemini Prompt: "Babe" Landing Page Design

Copy everything below the line and paste into Gemini:

---

## TASK

Create a landing page for a meal planning app called **"Babe, what's for dinner?"** (brand name: "Babe").

Build a complete, production-ready HTML page with inline CSS. The design must feel **clean and professional** like a polished SaaS product, but also **friendly and approachable** - not cold or corporate.

---

## CRITICAL CONSTRAINTS - READ CAREFULLY

**NEVER do these things:**
- NO emojis as design elements (looks cheap and AI-generated)
- NO saturated/bold gradients (looks amateur)
- NO playful fonts like Nunito, Quicksand, Poppins, Comic Sans
- NO floating/bouncing/wiggling animations
- NO purple gradients (generic AI aesthetic)
- NO busy layouts with too many decorative elements
- NO pill-shaped buttons (use subtle rounded rectangles instead)
- NO heavy drop shadows

---

## DESIGN REFERENCES

**Primary inspiration: Brainfish (brainfishai.com)**
- Very subtle sky-blue gradient background (barely noticeable, like #e8f4f8 → #f5fafa → white)
- Lime/yellow-green CTA buttons (#84cc16)
- Clean white cards with subtle shadows
- Generous whitespace - let the design breathe
- Professional typography (Inter font)
- Friendly but not childish

**Secondary inspiration: Masakin Food App (Dribbble)**
- Clean white backgrounds
- Coral/orange accent color (#f97316) for highlights
- Professional card layouts with large border-radius (16-20px)
- Simple line-art style icons (not filled, not emoji)
- Grid-based, organized layout

---

## EXACT SPECIFICATIONS

### Colors
```
Background: Very subtle gradient - #e8f4f8 at top → #f5fafa → #ffffff
Primary CTA: #84cc16 (lime green)
Secondary accent: #f97316 (coral/orange) - use sparingly
Headlines: #0f172a (slate-900)
Body text: #334155 (slate-700)
Secondary text: #64748b (slate-500)
Borders: #e2e8f0 (slate-200)
Cards: #ffffff with subtle shadow
```

### Typography
```
Font: Inter (or system sans-serif fallback)
Hero headline: 4rem, font-weight 700
Section headings: 2.25rem, font-weight 600
Body: 1rem, font-weight 400
Line-height: 1.5 for body, 1.1 for headlines
```

### Buttons
```
Primary: bg #84cc16, white text, padding 14px 28px, border-radius 8px, subtle shadow
Secondary: bg white, slate-700 text, 1px slate-200 border, border-radius 8px
Hover: subtle translateY(-1px) lift, slightly darker background
```

### Cards
```
Background: white
Border-radius: 16px or 20px
Shadow: 0 4px 6px -1px rgba(0,0,0,0.05)
Padding: 2rem
Hover: translateY(-4px), slightly stronger shadow
```

---

## PAGE STRUCTURE

Build these sections in order:

### 1. Navigation
- Logo: "Babe" wordmark (bold, slate-900)
- Nav links: Recipes, Meal Plans, Pricing (slate-600, medium weight)
- CTA button: "Get Started" (lime green)

### 2. Hero Section
- Small badge/pill: "Your kitchen companion" (white bg, subtle shadow)
- Headline: "Babe, **what's for dinner?**" (accent color on the question part)
- Subheadline: 1-2 sentences about the value prop (slate-600)
- Two buttons: "Start Planning Free" (primary) + "See How It Works" (secondary)
- Leave space for mascot/illustration (can be placeholder)

### 3. Features Section (6 cards in 3-column grid)
- Section headline: "Everything you need to meal prep like a pro"
- Feature cards with:
  - Simple LINE-ART icon (not filled, not emoji)
  - Feature title (semibold)
  - 2-line description (slate-600)

Features to include:
1. Smart Meal Planning - drag and drop weekly planning
2. Recipe Discovery - find recipes by ingredients
3. Smart Shopping Lists - auto-generated, organized by aisle
4. Family Friendly - scale recipes, track preferences
5. Quick & Easy - filter by cook time
6. Save Favorites - build your personal cookbook

### 4. Social Proof Section
- Clean stats strip: "10K+ Recipes" | "50K+ Happy Cooks" | "2M+ Meals Planned"
- Light background (#f8fafc)
- Keep understated

### 5. Final CTA Section
- Headline: "Ready to answer 'what's for dinner?'"
- Subheading: Join thousands of home cooks...
- Large primary CTA button

### 6. Footer
- Logo
- Navigation links
- "Made with love for home cooks everywhere"
- Keep minimal, dark background (#0f172a)

---

## ANIMATIONS (KEEP MINIMAL)

Only allowed:
- Hover states: translateY(-2px), 0.2s transition
- Color transitions on hover: 0.2s ease
- Button press: scale(0.98)

NOT allowed:
- Floating elements
- Bouncing
- Wiggling
- Parallax
- Continuous animations

---

## FINAL CHECKLIST

Before outputting, verify:
- [ ] No emojis anywhere
- [ ] Inter font (or clean sans-serif)
- [ ] Subtle sky gradient background (barely visible)
- [ ] Lime green (#84cc16) for primary CTAs
- [ ] Generous whitespace throughout
- [ ] Icons are line-art style, not filled
- [ ] Border-radius is 8px for buttons, 16-20px for cards
- [ ] Animations are hover-only, subtle
- [ ] Mobile responsive

---

## OUTPUT FORMAT

Return a single HTML file with:
- All CSS inline in a `<style>` tag
- Semantic HTML5 structure
- Mobile-responsive design
- Google Fonts import for Inter
- Clean, readable code

The result should look like a real, professional SaaS landing page - not like something generated by AI. Clean, polished, trustworthy, but also warm and inviting.
