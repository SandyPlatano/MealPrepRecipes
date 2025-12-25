# Landing Page Navigation & Footer Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the landing page navigation and footer to create a cohesive, modern dark theme that matches the Midnight Ember brand identity.

**Architecture:** Extract Navigation and Footer into separate component files. Navigation becomes a client component with scroll-aware backdrop. Footer gains animated pixel art elements for personality.

**Tech Stack:** Next.js, React hooks (useState, useEffect), Tailwind CSS, existing pixel-art components

---

## Design Decisions (from brainstorming)

| Element | Decision |
|---------|----------|
| Navigation background | Dark, transparent → gains backdrop on scroll |
| Navigation behavior | Fixed, scroll-aware (>50px triggers backdrop) |
| Nav CTAs | Keep pixel button style (`btn-pixel-primary`) |
| Footer style | Pixel art personality with animated elements |
| Footer animation | Floating food icons with subtle animation |

---

## Task 1: Extract Navigation to Dedicated Component

**Files:**
- Create: `src/components/landing/navigation.tsx`
- Modify: `src/app/page.tsx` (remove inline Navigation, import new component)

**Step 1: Create the navigation component file**

Create `src/components/landing/navigation.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PixelBrandLogoCompact } from '@/components/landing/pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// Dark, scroll-aware navigation with transparent → backdrop transition
// ═══════════════════════════════════════════════════════════════════════════

const SCROLL_THRESHOLD = 50;

export function Navigation() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        hasScrolled
          ? 'bg-[#111111]/90 backdrop-blur-sm border-b border-[#FDFBF7]/10'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PixelBrandLogoCompact variant="inline" colorMode="dark" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            href="/login"
            className="text-sm font-mono font-medium text-[#FDFBF7]/70 hover:text-[#F97316] transition-colors"
          >
            Log in
          </Link>
          <Link href="/signup">
            <button type="button" className="btn-pixel btn-pixel-primary text-sm py-2 px-4">
              Sign up free
            </button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/login">
            <Button
              size="sm"
              variant="ghost"
              className="text-[#FDFBF7]/70 hover:text-[#F97316] font-mono"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <button type="button" className="btn-pixel btn-pixel-primary text-sm py-2.5 px-4 min-h-[44px]">
              Sign Up
            </button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FDFBF7]/70 hover:text-[#FDFBF7] hover:bg-[#FDFBF7]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-[#111111] border-l border-[#FDFBF7]/10"
            >
              <SheetHeader>
                <SheetTitle className="font-mono text-left text-[#FDFBF7]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <MobileNavLink href="#features">Features</MobileNavLink>
                <MobileNavLink href="#pricing">Pricing</MobileNavLink>
                <MobileNavLink href="#faq">FAQ</MobileNavLink>
                <MobileNavLink href="/about">About</MobileNavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-mono font-medium text-[#FDFBF7]/70 hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link href={href}>
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-mono text-[#FDFBF7]/70 hover:text-[#F97316] hover:bg-[#FDFBF7]/5"
        >
          {children}
        </Button>
      </Link>
    </SheetClose>
  );
}
```

**Step 2: Verify the file was created correctly**

Run: `head -20 src/components/landing/navigation.tsx`
Expected: Shows the 'use client' directive and imports

**Step 3: Update page.tsx to use new Navigation component**

In `src/app/page.tsx`, replace the inline Navigation with the import.

Remove these lines (approximately lines 62-186 - the Navigation function and NavLink function):
- The `function Navigation() { ... }` block
- The `function NavLink() { ... }` block

Add this import at the top with other landing imports:
```tsx
import { Navigation } from '@/components/landing/navigation';
```

**Step 4: Verify the page still renders**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 5: Commit**

```bash
git add src/components/landing/navigation.tsx src/app/page.tsx
git commit -m "refactor: extract Navigation to dedicated component with scroll-aware backdrop"
```

---

## Task 2: Extract Footer to Dedicated Component

**Files:**
- Create: `src/components/landing/footer.tsx`
- Modify: `src/app/page.tsx` (remove inline Footer, import new component)

**Step 1: Create the footer component file**

Create `src/components/landing/footer.tsx`:

```tsx
import Link from 'next/link';
import { PixelBrandLogoCompact } from '@/components/landing/pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// Dark footer with pixel art personality and animated food icons
// ═══════════════════════════════════════════════════════════════════════════

export function Footer() {
  return (
    <footer className="relative border-t border-[#FDFBF7]/10 py-12 bg-[#111111] overflow-hidden">
      {/* Animated floating food icons background */}
      <FloatingFoodIcons />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PixelBrandLogoCompact variant="inline" colorMode="dark" />
          </Link>

          {/* Navigation links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono text-[#FDFBF7]/60">
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#pricing">Pricing</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </div>

          {/* Tagline with pixel heart */}
          <p className="text-sm text-[#FDFBF7]/40 flex items-center gap-2">
            Made with
            <span className="inline-block w-3 h-3 bg-[#F97316] animate-pulse" />
            and meal plans
          </p>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#FDFBF7]/10 to-transparent" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-[#FDFBF7]/30 font-mono">
            &copy; {new Date().getFullYear()} Meal Prep OS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors"
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating Food Icons - Animated pixel food decorations
// ─────────────────────────────────────────────────────────────────────────────

function FloatingFoodIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Tomato - top left */}
      <div
        className="absolute top-4 left-[10%] opacity-20 animate-pixel-float"
        style={{ animationDelay: '0s' }}
      >
        <PixelTomato />
      </div>

      {/* Avocado - top right */}
      <div
        className="absolute top-8 right-[15%] opacity-15 animate-pixel-float"
        style={{ animationDelay: '1s' }}
      >
        <PixelAvocado />
      </div>

      {/* Carrot - bottom left */}
      <div
        className="absolute bottom-12 left-[20%] opacity-20 animate-pixel-float"
        style={{ animationDelay: '0.5s' }}
      >
        <PixelCarrot />
      </div>

      {/* Egg - bottom right */}
      <div
        className="absolute bottom-8 right-[25%] opacity-15 animate-pixel-float"
        style={{ animationDelay: '1.5s' }}
      >
        <PixelEgg />
      </div>

      {/* Extra tomato - middle */}
      <div
        className="absolute top-1/2 left-[5%] opacity-10 animate-pixel-float hidden md:block"
        style={{ animationDelay: '2s' }}
      >
        <PixelTomato />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pixel Food Components - Simple 8x8 pixel art icons
// ─────────────────────────────────────────────────────────────────────────────

function PixelTomato() {
  return (
    <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
      {/* Stem */}
      <rect x="3" y="0" width="2" height="1" fill="#22c55e" />
      <rect x="4" y="1" width="1" height="1" fill="#22c55e" />
      {/* Body */}
      <rect x="2" y="2" width="4" height="1" fill="#ef4444" />
      <rect x="1" y="3" width="6" height="1" fill="#ef4444" />
      <rect x="1" y="4" width="6" height="1" fill="#dc2626" />
      <rect x="1" y="5" width="6" height="1" fill="#dc2626" />
      <rect x="2" y="6" width="4" height="1" fill="#b91c1c" />
      {/* Highlight */}
      <rect x="2" y="3" width="1" height="1" fill="#fca5a5" />
    </svg>
  );
}

function PixelAvocado() {
  return (
    <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
      {/* Outer */}
      <rect x="2" y="0" width="4" height="1" fill="#166534" />
      <rect x="1" y="1" width="6" height="1" fill="#166534" />
      <rect x="1" y="2" width="6" height="1" fill="#15803d" />
      <rect x="1" y="3" width="6" height="1" fill="#15803d" />
      <rect x="1" y="4" width="6" height="1" fill="#166534" />
      <rect x="1" y="5" width="6" height="1" fill="#166534" />
      <rect x="2" y="6" width="4" height="1" fill="#14532d" />
      <rect x="3" y="7" width="2" height="1" fill="#14532d" />
      {/* Inner */}
      <rect x="2" y="2" width="4" height="3" fill="#bef264" />
      {/* Pit */}
      <rect x="3" y="3" width="2" height="2" fill="#854d0e" />
    </svg>
  );
}

function PixelCarrot() {
  return (
    <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
      {/* Greens */}
      <rect x="3" y="0" width="2" height="1" fill="#22c55e" />
      <rect x="2" y="0" width="1" height="1" fill="#16a34a" />
      <rect x="5" y="0" width="1" height="1" fill="#16a34a" />
      {/* Body */}
      <rect x="2" y="1" width="4" height="1" fill="#f97316" />
      <rect x="2" y="2" width="4" height="1" fill="#ea580c" />
      <rect x="3" y="3" width="3" height="1" fill="#ea580c" />
      <rect x="3" y="4" width="2" height="1" fill="#c2410c" />
      <rect x="4" y="5" width="1" height="1" fill="#c2410c" />
      <rect x="4" y="6" width="1" height="1" fill="#9a3412" />
    </svg>
  );
}

function PixelEgg() {
  return (
    <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
      {/* Shell */}
      <rect x="3" y="0" width="2" height="1" fill="#fef3c7" />
      <rect x="2" y="1" width="4" height="1" fill="#fef3c7" />
      <rect x="1" y="2" width="6" height="1" fill="#fde68a" />
      <rect x="1" y="3" width="6" height="1" fill="#fde68a" />
      <rect x="1" y="4" width="6" height="1" fill="#fcd34d" />
      <rect x="1" y="5" width="6" height="1" fill="#fcd34d" />
      <rect x="2" y="6" width="4" height="1" fill="#fbbf24" />
      <rect x="3" y="7" width="2" height="1" fill="#f59e0b" />
      {/* Highlight */}
      <rect x="2" y="2" width="1" height="2" fill="#fffbeb" />
    </svg>
  );
}
```

**Step 2: Verify the file was created correctly**

Run: `head -30 src/components/landing/footer.tsx`
Expected: Shows the imports and Footer component start

**Step 3: Update page.tsx to use new Footer component**

In `src/app/page.tsx`, replace the inline Footer with the import.

Remove the `function Footer() { ... }` block (approximately lines 189-236).

Add this import at the top with other landing imports:
```tsx
import { Footer } from '@/components/landing/footer';
```

**Step 4: Verify the page still renders**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 5: Commit**

```bash
git add src/components/landing/footer.tsx src/app/page.tsx
git commit -m "refactor: extract Footer with animated pixel food icons"
```

---

## Task 3: Add CSS Animation for Floating Food

**Files:**
- Modify: `src/app/globals.css` (verify `animate-pixel-float` exists)

**Step 1: Verify the animation exists**

Run: `grep -n "pixel-float" src/app/globals.css`
Expected: Should find the `@keyframes pixel-float` and `.animate-pixel-float` definitions

If NOT found, add to globals.css in the animations section:

```css
/* Gentle floating for pixel icons */
@keyframes pixel-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-pixel-float {
  animation: pixel-float 3s ease-in-out infinite;
}
```

**Step 2: Commit if changes were made**

```bash
git add src/app/globals.css
git commit -m "style: ensure pixel-float animation is defined"
```

---

## Task 4: Update Landing Page Imports

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Clean up the page.tsx file**

The final `src/app/page.tsx` should have these imports at the top:

```tsx
import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { JourneySection } from '@/components/landing/journey-section';
import { TerminalFeature } from '@/components/landing/terminal-feature';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
```

Remove unused imports:
- `Menu` from lucide-react
- `Button` from @/components/ui/button
- `Sheet`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetTrigger` from @/components/ui/sheet
- `PixelBrandLogoCompact` from @/components/landing/pixel-art

**Step 2: Verify the component is clean**

The Home component should only contain:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111]">
      <Navigation />
      <HeroSection />
      <div id="features">
        <JourneySection />
      </div>
      <TerminalFeature />
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <CTASection />
      <Footer />
    </main>
  );
}
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds with no unused import warnings

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: clean up page.tsx imports after component extraction"
```

---

## Task 5: Visual Testing

**Files:** None (manual verification)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test navigation scroll behavior**

1. Load http://localhost:3000
2. Verify nav is transparent at top
3. Scroll down past 50px
4. Verify nav gains dark backdrop with blur
5. Scroll back to top
6. Verify nav returns to transparent

**Step 3: Test footer animations**

1. Scroll to footer
2. Verify floating food icons are visible and animating
3. Verify they have different animation delays (staggered float)

**Step 4: Test mobile navigation**

1. Resize browser to mobile width (<768px)
2. Verify hamburger menu appears
3. Open sheet menu
4. Verify dark styling matches brand

**Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: landing page nav/footer redesign complete"
```

---

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| Navigation | Cream bg, inline in page.tsx | Dark transparent, scroll-aware backdrop, extracted |
| Footer | Basic dark, inline in page.tsx | Animated pixel food icons, extracted |
| Mobile nav | Cream sheet | Dark sheet matching brand |
| page.tsx | 237 lines with inline components | ~30 lines, clean imports |

---

## File Structure After Implementation

```
src/
├── app/
│   ├── page.tsx                    # Clean, imports only
│   └── globals.css                 # (unchanged, animation exists)
└── components/
    └── landing/
        ├── navigation.tsx          # NEW - scroll-aware dark nav
        ├── footer.tsx              # NEW - animated pixel art footer
        ├── hero-section.tsx        # (unchanged)
        ├── journey-section.tsx     # (unchanged)
        ├── terminal-feature.tsx    # (unchanged)
        ├── pricing-section.tsx     # (unchanged)
        ├── faq.tsx                 # (unchanged)
        ├── cta-section.tsx         # (unchanged)
        └── pixel-art.tsx           # (unchanged)
```
