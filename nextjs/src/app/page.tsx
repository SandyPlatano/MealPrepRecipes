import Link from 'next/link';
import { Menu } from 'lucide-react';
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
import { HeroSection } from '@/components/landing/hero-section';
import { JourneySection } from '@/components/landing/journey-section';
import { TerminalFeature } from '@/components/landing/terminal-feature';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// Clean, pixel-art themed landing with alternating dark/cream sections
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111]">
      {/* Navigation */}
      <Navigation />

      {/* Hero - Dark */}
      <HeroSection />

      {/* Journey Section - Progressive user flow: Import → Plan → Shop → Cook */}
      <div id="features">
        <JourneySection />
      </div>

      {/* Terminal Feature - Dark (additional detail for developers) */}
      <TerminalFeature />


      {/* Pricing - Dark */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ - Cream */}
      <div id="faq">
        <FAQ />
      </div>

      {/* CTA - Dark */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-3 border-[#111111] bg-[#FDFBF7]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PixelBrandLogoCompact variant="inline" colorMode="light" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            href="/login"
            className="text-sm font-mono font-medium text-[#111111]/70 hover:text-[#111111] transition-colors"
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
              className="text-[#111111]/70 hover:text-[#111111] font-mono"
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
                className="text-[#111111]/70 hover:text-[#111111]"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-[#FDFBF7] border-l-3 border-[#111111]"
            >
              <SheetHeader>
                <SheetTitle className="font-mono text-left text-[#111111]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <SheetClose asChild>
                  <Link href="#features">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-mono text-[#111111]/70 hover:text-[#F97316] hover:bg-[#111111]/5"
                    >
                      Features
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="#pricing">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-mono text-[#111111]/70 hover:text-[#F97316] hover:bg-[#111111]/5"
                    >
                      Pricing
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="#faq">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-mono text-[#111111]/70 hover:text-[#F97316] hover:bg-[#111111]/5"
                    >
                      FAQ
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/about">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-mono text-[#111111]/70 hover:text-[#F97316] hover:bg-[#111111]/5"
                    >
                      About
                    </Button>
                  </Link>
                </SheetClose>
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
      className="text-sm font-mono font-medium text-[#111111]/70 hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t-4 border-[#FDFBF7]/20 py-8 bg-[#111111]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PixelBrandLogoCompact variant="inline" colorMode="dark" />
          </Link>

          <div className="flex items-center gap-6 text-sm font-mono text-[#FDFBF7]/60">
            <Link href="#features" className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none transition-colors">
              Terms
            </Link>
          </div>

          <p className="text-sm text-[#FDFBF7]/40">
            Made with{' '}
            <span className="inline-block w-3 h-3 bg-[#ff66c4] mx-1" />
            and meal plans
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-[#FDFBF7]/10 text-center">
          <p className="text-xs text-[#FDFBF7]/30 font-mono">
            &copy; {new Date().getFullYear()} Meal Prep OS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
